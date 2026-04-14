import { getDashboardItems } from "@/lib/items";
import { formatDisplayDate } from "@/lib/date";
import { updateProfileAction } from "@/lib/actions";
import { LockedFeatureCard } from "@/app/components/locked-feature-card";
import { requireCurrentUser } from "@/lib/current-user";
import { maybeRunAutomaticReminderCheckForUser } from "@/lib/automatic-reminders";
import { FormSubmitButton } from "@/app/components/form-submit-button";
import { LogoutForm } from "@/app/components/logout-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams
}: {
  searchParams?: { saved?: string; error?: string };
}) {
  const user = await requireCurrentUser();
  await maybeRunAutomaticReminderCheckForUser(user.id);
  const items = await getDashboardItems(user.id);
  const reminderItems = items.filter((item) => item.reminderActive);
  const emailedItems = items.filter((item) => item.lastReminderSentAt);

  const summary = items.reduce(
    (accumulator, item) => {
      accumulator.total += 1;
      accumulator[item.status] += 1;
      return accumulator;
    },
    {
      total: 0,
      active: 0,
      expiringSoon: 0,
      expired: 0
    }
  );

  return (
    <div className="page-stack">
      {searchParams?.error ? <div className="notice notice-error">{searchParams.error}</div> : null}
      {searchParams?.saved === "profile" ? <div className="notice notice-success">Profil je sacuvan.</div> : null}

      <section className="panel">
        <div className="panel-head">
          <div>
            <h1 className="section-title">{user.fullName}</h1>
            <p className="section-copy">{user.plan === "pro" ? "Pro paket" : "Free paket"}</p>
          </div>
          <div className="stack" style={{ justifyItems: "end" }}>
            {user.plan === "pro" ? <span className="status-pill status-active">Verified</span> : null}
            <LogoutForm />
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="stack">
          <div>
            <h2 className="panel-title">Email podsetnici</h2>
            <p className="muted-copy">Unesi email adresu i ukljuci slanje podsetnika kada proizvod udje u reminder period.</p>
            <p className="muted-copy">Provera se pokrece automatski za tvoj nalog najvise jednom na 30 dana.</p>
          </div>

          <form action={updateProfileAction} className="profile-form">
            <div className="field">
              <label htmlFor="email">Email adresa</label>
              <input id="email" name="email" type="email" defaultValue={user.email ?? ""} placeholder="ime@primer.com" />
            </div>

            <label className="checkbox-row checkbox-stack">
              <input type="checkbox" name="wantsEmailReminders" defaultChecked={user.wantsEmailReminders} />
              <span>
                <strong>Zelim email podsetnike</strong>
                <span className="input-help">Jedan email se salje samo jednom za isti reminder period proizvoda.</span>
              </span>
            </label>

            {!user.email ? (
              <div className="notice notice-error">Email reminderi ne mogu raditi dok email adresa nije uneta.</div>
            ) : null}

            <div className="form-actions">
              <FormSubmitButton pendingLabel="Cuvanje..." className="button button-primary">
                Sacuvaj profil
              </FormSubmitButton>
            </div>
          </form>
        </div>
      </section>

      <section className="mini-stats">
        <article className="mini-stat">
          <span>Ukupno garancija</span>
          <strong>{summary.total}</strong>
        </article>
        <article className="mini-stat">
          <span>Istekle garancije</span>
          <strong>{summary.expired}</strong>
        </article>
        <article className="mini-stat">
          <span>Vazece garancije</span>
          <strong>{summary.active}</strong>
        </article>
        <article className="mini-stat">
          <span>Email podsetnici poslati</span>
          <strong>{emailedItems.length}</strong>
        </article>
      </section>

      <section className="page-stack">
        <div>
          <h2 className="panel-title">Predstojeci podsetnici</h2>
          <p className="muted-copy">Garancije koje su trenutno u periodu za podsetnik.</p>
        </div>
        {reminderItems.length > 0 ? (
          <div className="reminder-list panel panel-subtle">
            {reminderItems.map((item) => (
              <article key={item.id} className="reminder-row">
                <div>
                  <strong>{item.name}</strong>
                  <div className="muted-copy">{item.retailer}</div>
                </div>
                <div className="reminder-row-side">
                  <span className="status-pill status-reminder">Podsetnik aktivan</span>
                  <span className="muted-copy">{item.daysUntilExpiry === 0 ? "Istice danas" : `Istice za ${item.daysUntilExpiry} dana`}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel panel-subtle">
            <p className="muted-copy">Trenutno nema aktivnih podsetnika.</p>
          </div>
        )}
      </section>

      <section className="page-stack">
        <div>
          <h2 className="panel-title">Poslati email podsetnici</h2>
          <p className="muted-copy">Proizvodi za koje je email podsetnik vec poslat u aktuelnom reminder periodu.</p>
        </div>
        {emailedItems.length > 0 ? (
          <div className="reminder-list panel panel-subtle">
            {emailedItems.map((item) => (
              <article key={item.id} className="reminder-row">
                <div>
                  <strong>{item.name}</strong>
                  <div className="muted-copy">{item.retailer}</div>
                </div>
                <div className="reminder-row-side">
                  <span className="status-pill status-active">Email poslat</span>
                  <span className="muted-copy">{item.lastReminderSentAt ? formatDisplayDate(item.lastReminderSentAt) : ""}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel panel-subtle">
            <p className="muted-copy">Jos nema poslatih email podsetnika.</p>
          </div>
        )}
      </section>

      <section className="page-stack">
        <div>
          <h2 className="panel-title">{user.plan === "pro" ? "Dostupno u tvom paketu" : "Premium opcije"}</h2>
          <p className="muted-copy">
            {user.plan === "pro"
              ? "Prikazane su samo funkcije koje vec postoje u interfejsu."
              : "Pro opcije su zakljucane dok premium paket nije aktivan."}
          </p>
        </div>
        <div className="compact-pro-list">
          <LockedFeatureCard feature="smart-ocr" source="profile" isPremium={user.plan === "pro"} />
        </div>
      </section>

      <section className="page-stack">
        <div>
          <h2 className="panel-title">U pripremi</h2>
          <p className="muted-copy">Ove premium funkcije jos nemaju pun UI tok u aplikaciji.</p>
        </div>
        <div className="compact-pro-list">
          <LockedFeatureCard feature="cloud-backup" source="profile" isPremium={user.plan === "pro"} />
        </div>
      </section>
    </div>
  );
}
