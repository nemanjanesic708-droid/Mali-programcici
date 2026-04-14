import { getDashboardItems } from "@/lib/items";
import { requireCurrentUser } from "@/lib/current-user";
import { maybeRunAutomaticReminderCheckForUser } from "@/lib/automatic-reminders";
import { ProductCard } from "@/app/components/product-card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  await maybeRunAutomaticReminderCheckForUser(user.id);
  const items = await getDashboardItems(user.id);
  const reminderItems = items.filter((item) => item.reminderActive);

  return (
    <div className="page-stack">
      <section className="content-header">
        <div>
          <h1 className="section-title">Moje garancije</h1>
          <p className="section-copy">Sacuvani proizvodi, racuni i datumi isteka.</p>
        </div>
      </section>

      {reminderItems.length > 0 ? (
        <section className="panel panel-subtle">
          <div>
            <h2 className="panel-title">Predstojeci podsetnici</h2>
            <p className="muted-copy">Garancije koje su usle u period za podsetnik pre isteka.</p>
          </div>
          <div className="reminder-list">
            {reminderItems.map((item) => (
              <article key={item.id} className="reminder-row">
                <div>
                  <strong>{item.name}</strong>
                  <div className="muted-copy">{item.retailer}</div>
                </div>
                <div className="reminder-row-side">
                  <span className="status-pill status-reminder">Podsetnik aktivan</span>
                  <span className="muted-copy">Istek {item.daysUntilExpiry === 0 ? "danas" : `za ${item.daysUntilExpiry} dana`}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="page-stack">
        {items.length === 0 ? (
          <div className="empty-panel">
            <h3 className="panel-title">Jos nema sacuvanih proizvoda</h3>
            <p className="muted-copy">Dodaj prvi proizvod i sacuvaj racun uz datum isteka garancije.</p>
          </div>
        ) : (
          <div className="product-list">
            {items.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
