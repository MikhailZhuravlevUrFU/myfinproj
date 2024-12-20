import { useEffect, useState } from "react";
import { blo } from "blo";
import { useDebounceValue } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { CommonInputProps, InputBase, isENS } from "~~/components/scaffold-eth";
import "./AddressInput.css"; // Импорт CSS для стилей

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  // Debounce the input to keep clean RPC calls when resolving ENS names
  // If the input is an address, we don't need to debounce it
  const [_debouncedValue] = useDebounceValue(value, 500);
  const debouncedValue = isAddress(value) ? value : _debouncedValue;
  const isDebouncedValueLive = debouncedValue === value;

  // If the user changes the input after an ENS name is already resolved, we want to remove the stale result
  const settledValue = isDebouncedValueLive ? debouncedValue : undefined;

  const {
    data: ensAddress,
    isLoading: isEnsAddressLoading,
    isError: isEnsAddressError,
    isSuccess: isEnsAddressSuccess,
  } = useEnsAddress({
    name: settledValue,
    chainId: 1,
    query: {
      gcTime: 30_000,
      enabled: isDebouncedValueLive && isENS(debouncedValue),
    },
  });

  const [enteredEnsName, setEnteredEnsName] = useState<string>();
  const {
    data: ensName,
    isLoading: isEnsNameLoading,
    isError: isEnsNameError,
    isSuccess: isEnsNameSuccess,
  } = useEnsName({
    address: settledValue as Address,
    chainId: 1,
    query: {
      enabled: isAddress(debouncedValue),
      gcTime: 30_000,
    },
  });

  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(ensName),
      gcTime: 30_000,
    },
  });

  // ens => address
  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setEnteredEnsName(debouncedValue);
    onChange(ensAddress);
  }, [ensAddress, onChange, debouncedValue]);

  useEffect(() => {
    setEnteredEnsName(undefined);
  }, [value]);

  const reFocus =
    isEnsAddressError ||
    isEnsNameError ||
    isEnsNameSuccess ||
    isEnsAddressSuccess ||
    ensName === null ||
    ensAddress === null;

  return (
    <div className="input-container">
      {ensName && (
        <div className="prefix">
          {isEnsAvatarLoading && <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full"></div>}
          {ensAvatar ? (
            <img className="avatar" src={ensAvatar} alt={`${ensAddress} avatar`} />
          ) : null}
          <span className="ens-name">{enteredEnsName ?? ensName}</span>
        </div>
      )}
      {!ensName && (isEnsNameLoading || isEnsAddressLoading) && (
        <div className="prefix">
          <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full"></div>
          <div className="skeleton bg-base-200 h-3 w-20"></div>
        </div>
      )}
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
      />
      {value && <img className="suffix" src={blo(value as `0x${string}`)} alt="" />}
    </div>
  );
};
