"use client";

import { useEffect, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import {
  ContractInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "~~/app/debug/_components/contract";
import { IntegerInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import './WriteOnlyFunctionForm.css'; // Импортируем стили

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  inheritedFrom?: string;
};

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
  inheritedFrom,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string>("");
  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const handleWrite = async () => {
    if (writeContractAsync) {
      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: contractAddress,
            functionName: abiFunction.name,
            abi: abi,
            args: getParsedContractFunctionArgs(form),
            value: BigInt(txValue),
          });
        await writeTxn(makeWriteWithParams);
        onChange();
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
      }
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransactionReceipt({
    hash: result,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const transformedFunction = transformAbiFunction(abiFunction);
  const inputs = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
        className="input-field"
      />
    );
  });
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="form-container">
      <div className="form-title">
        {abiFunction.name}
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>
      <div className="form-input-group">
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <div className="payment-input-group">
            <span className="payment-label">Payable Value (wei)</span>
            <IntegerInput
              value={txValue}
              onChange={updatedTxValue => {
                setDisplayedTxResult(undefined);
                setTxValue(updatedTxValue);
              }}
              className="payment-input"
              placeholder="Enter value in wei"
            />
            <span className="payment-info">Value must be in wei</span>
          </div>
        ) : null}
      </div>
      <div className="button-group">
        <div className="tooltip-wrapper">
          <button
            className="send-button"
            disabled={writeDisabled || isPending}
            onClick={handleWrite}
          >
            {isPending && <span className="loading loading-spinner loading-xs"></span>}
            Выполнить
          </button>
          {writeDisabled && (
            <div className="tooltip">Wallet not connected or in the wrong network</div>
          )}
        </div>
        {!zeroInputs && (
          <div className="tx-receipt">
            {displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}
          </div>
        )}
      </div>
      {zeroInputs && txResult ? (
        <div className="tx-receipt">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
