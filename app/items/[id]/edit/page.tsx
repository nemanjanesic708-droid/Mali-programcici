import { notFound } from "next/navigation";
import { updateItemAction } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/current-user";
import { maybeRunAutomaticReminderCheckForUser } from "@/lib/automatic-reminders";
import { formatDateInput } from "@/lib/date";
import { formatPriceInput } from "@/lib/format";
import { getItemById } from "@/lib/items";
import { ItemForm } from "@/app/components/item-form";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const user = await requireCurrentUser();
  await maybeRunAutomaticReminderCheckForUser(user.id);
  const item = await getItemById(params.id, user.id);

  if (!item) {
    notFound();
  }

  const action = updateItemAction.bind(null, item.id);

  return (
    <ItemForm
      title={`Izmeni: ${item.name}`}
      description=""
      submitLabel="Sacuvaj"
      pendingLabel="Cuvanje..."
      action={action}
      isPremium={false}
      enableSmartScan={false}
      returnTo={`/items/${item.id}/edit`}
      errorMessage={searchParams?.error}
      initialValues={{
        name: item.name,
        retailer: item.retailer,
        price: formatPriceInput(item.displayPriceAmount, item.displayPriceCurrency),
        priceCurrency: item.displayPriceCurrency,
        purchaseDate: formatDateInput(item.purchaseDate),
        warrantyMonths: String(item.warrantyMonths),
        notes: item.notes ?? "",
        receiptImagePath: item.receiptImagePath,
        productImagePath: item.displayProductImage,
        reminderEnabled: item.reminderEnabled,
        reminderDaysBefore: item.reminderDaysBefore ? String(item.reminderDaysBefore) : "30"
      }}
    />
  );
}
