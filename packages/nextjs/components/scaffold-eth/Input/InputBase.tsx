import { ChangeEvent, FocusEvent, ReactNode, useCallback, useEffect, useRef } from "react";
import { CommonInputProps } from "~~/components/scaffold-eth";
import "./InputBase.css"; // Импорт стилей

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  reFocus?: boolean;
};

export const InputBase = <T extends { toString: () => string } | undefined = string>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
  reFocus,
}: InputBaseProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T);
    },
    [onChange],
  );

  // Устанавливаем фокус и курсор в конец текста, если передан `reFocus`
  const onFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    if (reFocus !== undefined) {
      e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
    }
  };

  useEffect(() => {
    if (reFocus) {
      inputRef.current?.focus();
    }
  }, [reFocus]);

  return (
    <div
      className={`input-base-container ${error ? "input-error" : ""} ${
        disabled ? "input-disabled" : ""
      }`}
    >
      {prefix && <div className="input-prefix">{prefix}</div>}
      <input
        className="input-element"
        placeholder={placeholder}
        name={name}
        value={value?.toString() || ""}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
        ref={inputRef}
        onFocus={onFocus}
      />
      {suffix && <div className="input-suffix">{suffix}</div>}
    </div>
  );
};
