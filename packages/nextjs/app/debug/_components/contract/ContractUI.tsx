"use client";

// @refresh reset
import { useReducer } from "react";
import { ContractReadMethods } from "./ContractReadMethods";
import { ContractVariables } from "./ContractVariables";
import { ContractWriteMethods } from "./ContractWriteMethods";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import './ContractUI.css';

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ contractName, className = "" }: ContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo({ contractName });
  const networkColor = useNetworkColor();

  if (deployedContractLoading) {
    return (
      <div className="contract-ui-loader">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="contract-not-found">
        {`No contract found by the name of "${contractName}" on chain "${targetNetwork.name}"!`}
      </p>
    );
  }

  return (
    <div className={`contract-ui-container ${className}`}>
        <div className="contract-info">
          <div className="contract-card">
            <div className="contract-card-header">
              <div className="contract-card-title">
                <span className="contract-name">{contractName}</span>
                <Address address={deployedContractData.address} onlyEnsOrAddress />
                <div className="balance-info">
                  <span className="balance-label">Balance:</span>
                  <Balance address={deployedContractData.address} className="balance" />
                </div>
              </div>
            </div>
            {targetNetwork && (
              <p className="network-info">
                <span className="network-label">Network</span>:{" "}
                <span className="network-name" style={{ color: networkColor }}>{targetNetwork.name}</span>
              </p>
            )}
          </div>
          <div className="contract-variables">
            <ContractVariables
              refreshDisplayVariables={refreshDisplayVariables}
              deployedContractData={deployedContractData}
            />
          </div>
        </div>
        <div className="contract-actions">
          <div className="contract-methods">
            <div className="card">
            <p className="method-title">Read</p>
              <ContractReadMethods deployedContractData={deployedContractData} />
              </div>
          </div>
          <div className="contract-methods">
            <div className="card">
            <p className="method-title">Write</p>
              <ContractWriteMethods
              deployedContractData={deployedContractData}
              onChange={triggerRefreshDisplayVariables}
            />
            </div>
          </div>
        </div>
    </div>
  );
};
