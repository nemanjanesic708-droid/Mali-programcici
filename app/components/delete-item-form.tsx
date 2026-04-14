"use client";

import { FormSubmitButton } from "@/app/components/form-submit-button";

export function DeleteItemForm({
  action
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Obrisi ovaj proizvod i sacuvani racun?")) {
          event.preventDefault();
        }
      }}
    >
      <FormSubmitButton pendingLabel="Brisanje..." className="button button-danger">
        Obrisi
      </FormSubmitButton>
    </form>
  );
}
