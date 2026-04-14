import Link from "next/link";
import { ItemRecord } from "@/lib/items";
import { formatDisplayDate } from "@/lib/date";
import { formatMoney } from "@/lib/format";
import { StatusPill } from "@/app/components/status-pill";
import { PersistedImage } from "@/app/components/persisted-image";

function getStatusNote(item: ItemRecord) {
  if (item.status === "expired") {
    const days = Math.abs(item.daysUntilExpiry);
    return days === 0 ? "Istekla danas." : `Istekla pre ${days} ${days === 1 ? "dan" : "dana"}.`;
  }

  if (item.status === "expiringSoon") {
    if (item.daysUntilExpiry === 0) {
      return "Istice danas.";
    }

    return `Istice za ${item.daysUntilExpiry} ${item.daysUntilExpiry === 1 ? "dan" : "dana"}.`;
  }

  return `Garancija traje jos ${item.warrantyMonths} meseci od kupovine.`;
}

function getReminderNote(item: ItemRecord) {
  if (!item.reminderEnabled || !item.reminderDaysBefore) {
    return "Podsetnik nije ukljucen.";
  }

  if (item.reminderActive) {
    return item.reminderDueToday
      ? `Podsetnik je aktivan danas, ${item.reminderDaysBefore} dana pre isteka.`
      : `Podsetnik je aktivan: istice za ${item.daysUntilExpiry} ${item.daysUntilExpiry === 1 ? "dan" : "dana"}.`;
  }

  if (item.daysUntilReminder === null) {
    return `Podsetnik je podesen ${item.reminderDaysBefore} dana ranije.`;
  }

  if (item.daysUntilReminder > 0) {
    return `Podsetnik pocinje za ${item.daysUntilReminder} ${item.daysUntilReminder === 1 ? "dan" : "dana"}.`;
  }

  return `Podsetnik je bio podesen ${item.reminderDaysBefore} dana ranije.`;
}

export function ProductCard({ item }: { item: ItemRecord }) {
  return (
    <article className="list-row-card">
      <Link href={`/items/${item.id}`} className="list-row-link">
        <div className="list-row-thumb">
          {item.displayProductImage ? (
            <PersistedImage
              src={item.displayProductImage}
              alt={item.name}
              className="list-row-thumb-image"
              fallbackLabel={item.name.slice(0, 1).toUpperCase()}
            />
          ) : (
            <div className="placeholder-visual" aria-hidden="true">
              {item.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="list-row-main">
          <div className="list-row-title">
            <h3 className="item-card-title">{item.name}</h3>
            <p className="item-card-subtitle">{item.retailer}</p>
          </div>
          <div className="list-row-meta">
            <div className="meta-row">
              <span>Datum kupovine</span>
              <strong>{formatDisplayDate(item.purchaseDate)}</strong>
            </div>
            <div className="meta-row">
              <span>Istek garancije</span>
              <strong>{formatDisplayDate(item.expiryDate)}</strong>
            </div>
            <div className="meta-row">
              <span>Cena</span>
              <strong>{formatMoney(item.displayPriceAmount, item.displayPriceCurrency)}</strong>
            </div>
            <div className="meta-row">
              <span>Podsetnik</span>
              <strong>{item.reminderEnabled ? `${item.reminderDaysBefore} dana ranije` : "Iskljucen"}</strong>
            </div>
          </div>
          <p className="status-note">{item.reminderActive ? getReminderNote(item) : getStatusNote(item)}</p>
        </div>
        <div className="list-row-side">
          <StatusPill status={item.status} />
          {item.reminderActive ? <span className="status-pill status-reminder">Podsetnik aktivan</span> : null}
          <span className="list-row-action">Detalji</span>
        </div>
      </Link>
    </article>
  );
}
