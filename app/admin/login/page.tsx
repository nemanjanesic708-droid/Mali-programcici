import { redirect } from "next/navigation";
import { FormSubmitButton } from "@/app/components/form-submit-button";
import { hasAdminSession, loginAdminAction } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  return (
    <div className="page-stack page-narrow">
      <section className="panel">
        <div className="stack">
          <div>
            <h1 className="section-title">Admin login</h1>
            <p className="section-copy">Pristup admin dashboard-u je dozvoljen samo admin nalogu.</p>
          </div>

          {searchParams?.error ? <div className="notice notice-error">{searchParams.error}</div> : null}

          <form action={loginAdminAction} className="profile-form">
            <div className="field">
              <label htmlFor="admin-email">Email</label>
              <input id="admin-email" name="email" type="email" placeholder="admin@garancija.local" autoComplete="username" />
            </div>

            <div className="field">
              <label htmlFor="admin-password">Lozinka</label>
              <input id="admin-password" name="password" type="password" autoComplete="current-password" />
            </div>

            <div className="form-actions">
              <FormSubmitButton pendingLabel="Prijava..." className="button button-primary">
                Prijavi se
              </FormSubmitButton>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
