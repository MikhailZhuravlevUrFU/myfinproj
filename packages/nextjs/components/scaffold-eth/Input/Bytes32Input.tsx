import { useCallback } from "react";
import { hexToString, isHex, stringToHex } from "viem";
import { CommonInputProps, InputBase } from "~~/components/scaffold-eth";
import "./Bytes32Input.css"; // Импорт стилей

export const Bytes32Input = ({ value, onChange, name, placeholder, disabled }: CommonInputProps) => {
  const convertStringToBytes32 = useCallback(() => {
    if (!value) {
      return;
    }
    onChange(isHex(value) ? hexToString(value, { size: 32 }) : stringToHex(value, { size: 32 }));
  }, [onChange, value]);

  return (
    <div className="input-container">
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="input-base"
      />
      <button
        className="suffix-button"
        onClick={convertStringToBytes32}
        type="button"
        disabled={disabled}
      >
        #
      </button>
    </div>
  );
};
