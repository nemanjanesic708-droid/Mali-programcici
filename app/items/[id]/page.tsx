import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteItemAction } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/current-user";
import { maybeRunAutomaticReminderCheckForUser } from "@/lib/automatic-reminders";
import { formatDisplayDate } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { getItemById } from "@/lib/items";
import { StatusPill } from "@/app/components/status-pill";
import { DeleteItemForm } from "@/app/components/delete-item-form";
import { LockedFeatureCard } from "@/app/components/locked-feature-card";
import { LightboxImage } from "@/app/components/lightbox-image";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const user = await requireCurrentUser();
  await maybeRunAutomaticReminderCheckForUser(user.id);
  const item = await getItemById(params.id, user.id);

  if (!item) {
    notFound();
  }

  const deleteAction = deleteItemAction.bind(null, item.id);

  console.info("[Warranty Tracker] Detail image sources", {
    itemId: item.id,
    productImageSrc: item.displayProductImage,
    receiptImageSrc: item.receiptImagePath
  });

  return (
    <div className="page-stack">
      <div className="stack">
        <Link href="/" className="back-link">
          Nazad na pregled
        </Link>
        <div className="detail-head">
          <div>
            <h1 className="section-title">{item.name}</h1>
            <p className="section-copy">{item.retailer}</p>
          </div>
          <StatusPill status={item.status} />
        </div>
      </div>

      <section className="detail-top">
        <div className="detail-visual">
          {item.displayProductImage ? (
            <LightboxImage
              src={item.displayProductImage}
              alt={item.name}
              imageClassName="detail-image"
              fallbackLabel={item.name.slice(0, 1).toUpperCase()}
              frameClassName="detail-image"
            />
          ) : (
            <div className="placeholder-visual" aria-hidden="true">
              {item.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="detail-panel">
          <div className="detail-actions">
            <Link href={`/items/${item.id}/edit`} className="button button-primary">
              Izmeni
            </Link>
            <DeleteItemForm action={deleteAction} />
          </div>

          <div className="detail-grid">
            <div className="meta-row">
              <span>Prodavnica</span>
              <strong>{item.retailer}</strong>
            </div>
            <div className="meta-row">
              <span>Cena</span>
              <strong>{formatMoney(item.displayPriceAmount, item.displayPriceCurrency)}</strong>
            </div>
            <div className="meta-row">
              <span>Datum kupovine</span>
              <strong>{formatDisplayDate(item.purchaseDate)}</strong>
            </div>
            <div className="meta-row">
              <span>Istek garancije</span>
              <strong>{formatDisplayDate(item.expiryDate)}</strong>
            </div>
            <div className="meta-row">
              <span>Trajanje garancije</span>
              <strong>{item.warrantyMonths} meseci</strong>
            </div>
            <div className="meta-row">
              <span>Status</span>
              <strong>{item.status === "active" ? "Vazeca garancija" : item.status === "expiringSoon" ? "Uskoro istice" : "Istekla"}</strong>
            </div>
            <div className="meta-row">
              <span>Podsetnik</span>
              <strong>{item.reminderEnabled ? "Ukljucen" : "Iskljucen"}</strong>
            </div>
            <div className="meta-row">
              <span>Podsetnik ranije</span>
              <strong>{item.reminderEnabled && item.reminderDaysBefore ? `${item.reminderDaysBefore} dana` : "Nije podesen"}</strong>
            </div>
            <div className="meta-row">
              <span>Email podsetnici</span>
              <strong>{user.wantsEmailReminders && user.email ? "Aktivni" : "Nisu aktivni"}</strong>
            </div>
            <div className="meta-row">
              <span>Email status</span>
              <strong>{item.lastReminderSentAt ? `Poslat ${formatDisplayDate(item.lastReminderSentAt)}` : "Jos nije poslat"}</strong>
            </div>
          </div>

          {item.reminderActive ? (
            <div className="inline-badges">
              <span className="status-pill status-reminder">Podsetnik aktivan</span>
              <span className="muted-copy">
                {item.daysUntilExpiry === 0 ? "Garancija istice danas." : `Garancija istice za ${item.daysUntilExpiry} dana.`}
              </span>
            </div>
          ) : null}

          <div className="stack">
            <h2 className="panel-title">Napomena</h2>
            <p className="muted-copy">{item.notes || "Nema dodatih napomena."}</p>
          </div>
        </div>
      </section>

      <section className="page-stack">
        <article className="detail-panel">
          <div>
            <h2 className="panel-title">Racun</h2>
            <p className="muted-copy">Sacuvana potvrda kupovine za ovaj proizvod.</p>
          </div>
          {item.receiptImagePath ? (
            <div className="receipt-frame">
              <LightboxImage
                src={item.receiptImagePath}
                alt={`Racun za ${item.name}`}
                imageClassName="receipt-image"
                fallbackLabel="R"
                frameClassName="receipt-image"
              />
            </div>
          ) : (
            <p className="muted-copy">Racun nije dodat.</p>
          )}
        </article>

        <div className="page-stack">
          <div>
            <h2 className="panel-title">Pro funkcije</h2>
            <p className="muted-copy">
              {user.plan === "pro"
                ? "Premium funkcije su dostupne na ovom nalogu."
                : "Premium opcije su zakljucane dok premium paket nije aktivan."}
            </p>
          </div>
          <div className="compact-pro-list">
            <LockedFeatureCard feature="smart-ocr" source="item_detail" isPremium={user.plan === "pro"} />
          </div>
        </div>
      </section>
    </div>
  );
}
