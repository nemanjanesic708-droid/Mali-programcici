"use client";

import { useState } from "react";
import { FormSubmitButton } from "@/app/components/form-submit-button";

export function NotifyMeForm({
  action,
  returnTo
}: {
  action: (formData: FormData) => void | Promise<void>;
  returnTo: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={action}
      className="stack"
      onSubmit={(event) => {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          event.preventDefault();
          setError("Unesi ispravnu email adresu.");
          return;
        }

        setError(null);
      }}
    >
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="source" value={`coming_soon_${returnTo.split("/").pop()}`} />
      <div className="field">
        <label htmlFor="notify-email">Email</label>
        <input
          id="notify-email"
          name="email"
          type="email"
          placeholder="ime@primer.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      {error ? <div className="field-error">{error}</div> : null}
      <FormSubmitButton pendingLabel="Cuvanje..." className="button button-primary button-full">
        Obavesti me
      </FormSubmitButton>
    </form>
  );
}
