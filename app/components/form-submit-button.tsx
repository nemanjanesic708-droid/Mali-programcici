"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
};

export function FormSubmitButton({
  children,
  pendingLabel,
  className
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className ?? "button button-primary"} disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
