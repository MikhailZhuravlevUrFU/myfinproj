import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

export const AddressCopyIcon = ({ className, address }: { className?: string; address: string }) => {
  const [addressCopied, setAddressCopied] = useState(false);

  return (
    <CopyToClipboard
      text={address}
      onCopy={() => {
        setAddressCopied(true);
        setTimeout(() => {
          setAddressCopied(false);
        }, 800);
      }}
    >
      <button
        onClick={e => e.stopPropagation()}
        type="button"
        className={`flex items-center justify-center ${className} px-4 py-2`}
      >
        {addressCopied ? (
          <CheckCircleIcon className="h-1 w-1" aria-hidden="true" />
        ) : (
          <DocumentDuplicateIcon className="h-1 w-1" aria-hidden="true" />
        )}
      </button>
    </CopyToClipboard>
  );
};
