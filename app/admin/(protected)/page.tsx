import { logoutAdminAction, requireAdminSession } from "@/lib/admin-auth";
import { getAdminDashboardMetrics } from "@/lib/admin";
import { AdminDashboardTables } from "@/app/components/admin-dashboard-tables";
import { FormSubmitButton } from "@/app/components/form-submit-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [adminUser, metrics] = await Promise.all([requireAdminSession(), getAdminDashboardMetrics()]);

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h1 className="section-title">Admin dashboard</h1>
            <p className="section-copy">Pregled osnovnih sistemskih metrika iz baze.</p>
          </div>
          <form action={logoutAdminAction}>
            <FormSubmitButton pendingLabel="Odjava..." className="button button-ghost">
              Odjavi admina
            </FormSubmitButton>
          </form>
        </div>
        <p className="muted-copy">
          Ulogovan kao <strong>{adminUser.email}</strong>
        </p>
      </section>

      <section className="mini-stats">
        <article className="mini-stat">
          <span>Ukupan broj korisnika</span>
          <strong>{metrics.totalUsers}</strong>
        </article>
        <article className="mini-stat">
          <span>Ukupan broj garancija</span>
          <strong>{metrics.totalWarranties}</strong>
        </article>
        <article className="mini-stat">
          <span>Zainteresovani za Premium</span>
          <strong>{metrics.premiumInterestCount}</strong>
        </article>
      </section>

      <section className="panel panel-subtle">
        <div className="stack">
          <div>
            <h2 className="panel-title">Izvor metrika</h2>
            <p className="muted-copy">Korisnici se broje iz `UserProfile`, garancije iz `Product`, a Premium interes iz `PremiumInterest` tabele.</p>
          </div>
        </div>
      </section>

      <AdminDashboardTables />
    </div>
  );
}
