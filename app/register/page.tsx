import Link from "next/link";
import { registerAction } from "@/lib/auth-actions";
import { FormSubmitButton } from "@/app/components/form-submit-button";

export default function RegisterPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return (
    <div className="page-stack">
      <div className="stack">
        <div>
          <h1 className="section-title">Registracija</h1>
          <p className="section-copy">Napravi nalog i cuvaj svoje garancije, racune i podsetnike na jednom mestu.</p>
        </div>
      </div>

      {searchParams?.error ? <div className="notice notice-error">{searchParams.error}</div> : null}

      <form action={registerAction} className="form-panel auth-form">
        <div className="auth-grid">
          <div className="field">
            <label htmlFor="firstName">Ime</label>
            <input id="firstName" name="firstName" autoComplete="given-name" placeholder="Nikola" />
          </div>

          <div className="field">
            <label htmlFor="lastName">Prezime</label>
            <input id="lastName" name="lastName" autoComplete="family-name" placeholder="Jovanovic" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email adresa</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="ime@primer.com" />
        </div>

        <div className="field">
          <label htmlFor="password">Lozinka</label>
          <input id="password" name="password" type="password" autoComplete="new-password" placeholder="Najmanje 8 karaktera" />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Potvrda lozinke</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Ponovi lozinku" />
        </div>

        <div className="form-actions">
          <FormSubmitButton pendingLabel="Registracija..." className="button button-primary button-full">
            Kreiraj nalog
          </FormSubmitButton>
        </div>

        <p className="section-copy">
          Vec imas nalog? <Link href="/login" className="inline-link">Prijavi se</Link>
        </p>
      </form>
    </div>
  );
}
