import { type WarrantyStatus } from "@/lib/date";

const LABELS: Record<WarrantyStatus, string> = {
  active: "Vazeca garancija",
  expiringSoon: "Uskoro istice",
  expired: "Istekla"
};

export function StatusPill({ status }: { status: WarrantyStatus }) {
  return <span className={`status-pill status-${status}`}>{LABELS[status]}</span>;
}
