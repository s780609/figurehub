"use client";

import { useFormStatus } from "react-dom";
import Spinner from "./Spinner";

interface Props {
  children: React.ReactNode;
  className?: string;
  pendingText?: React.ReactNode;
  disabled?: boolean;
  spinnerClassName?: string;
}

export default function SubmitButton({
  children,
  className,
  pendingText,
  disabled,
  spinnerClassName = "h-4 w-4",
}: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
    >
      {pending && <Spinner className={spinnerClassName} />}
      <span>{pending ? pendingText ?? children : children}</span>
    </button>
  );
}
