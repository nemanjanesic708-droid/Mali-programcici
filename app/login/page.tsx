import Link from "next/link";
import { loginAction } from "@/lib/auth-actions";
import { FormSubmitButton } from "@/app/components/form-submit-button";

export default function LoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="page-stack">
      <div className="stack">
        <div>
          <h1 className="section-title">Prijava</h1>
          <p className="section-copy">Prijavi se da pristupis svojim garancijama i podsetnicima.</p>
        </div>
      </div>

      {searchParams?.error ? <div className="notice notice-error">{searchParams.error}</div> : null}

      <form action={loginAction} className="form-panel auth-form">
        <div className="field">
          <label htmlFor="email">Email adresa</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="ime@primer.com" />
        </div>

        <div className="field">
          <label htmlFor="password">Lozinka</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Unesi lozinku" />
        </div>

        <div className="form-actions">
          <FormSubmitButton pendingLabel="Prijava..." className="button button-primary button-full">
            Prijavi se
          </FormSubmitButton>
        </div>

        <p className="section-copy">
          Nemas nalog? <Link href="/register" className="inline-link">Registruj se</Link>
        </p>
      </form>
    </div>
  );
}
