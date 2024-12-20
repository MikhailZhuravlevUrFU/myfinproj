"use client";

import { Dispatch, SetStateAction } from "react";
import { Tuple } from "./Tuple";
import { TupleArray } from "./TupleArray";
import { AbiParameter } from "abitype";
import {
  AddressInput,
  Bytes32Input,
  BytesInput,
  InputBase,
  IntegerInput,
  IntegerVariant,
} from "~~/components/scaffold-eth";
import { AbiParameterTuple } from "~~/utils/scaffold-eth/contract";
import "./ContractInput.css";

type ContractInputProps = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any> | undefined;
  stateObjectKey: string;
  paramType: AbiParameter;
};

/**
 * Generic Input component to handle input's based on their function param type
 */
export const ContractInput = ({ setForm, form, stateObjectKey, paramType }: ContractInputProps) => {
  const inputProps = {
    name: stateObjectKey,
    value: form?.[stateObjectKey],
    placeholder: paramType.name ? `${paramType.type} ${paramType.name}` : paramType.type,
    onChange: (value: any) => {
      setForm(form => ({ ...form, [stateObjectKey]: value }));
    },
  };

  const renderInput = () => {
    switch (paramType.type) {
      case "address":
        return <AddressInput {...inputProps}/>;
      case "bytes32":
        return <Bytes32Input {...inputProps}/>;
      case "bytes":
        return <BytesInput {...inputProps}/>;
      case "string":
        return <InputBase {...inputProps}/>;
      case "tuple":
        return (
          <Tuple
            setParentForm={setForm}
            parentForm={form}
            abiTupleParameter={paramType as AbiParameterTuple}
            parentStateObjectKey={stateObjectKey}
            className="contract-tuple-container"
          />
        );
      default:
        if (paramType.type.includes("int") && !paramType.type.includes("[")) {
          return <IntegerInput {...inputProps} className="contract-input-field contract-input-number" />;
        } else if (paramType.type.startsWith("tuple[")) {
          return (
            <TupleArray
              setParentForm={setForm}
              parentForm={form}
              abiTupleParameter={paramType as AbiParameterTuple}
              parentStateObjectKey={stateObjectKey}
              className="contract-tuple-array"
            />
          );
        } else {
          return <InputBase {...inputProps} className="contract-input-field" />;
        }
    }
  };
  

  return (
    <div className="contract-input-container">
      {renderInput()}
    </div>

  );
};
