import { createItemAction } from "@/lib/actions";
import { requireCurrentUser } from "@/lib/current-user";
import { maybeRunAutomaticReminderCheckForUser } from "@/lib/automatic-reminders";
import { formatDateInput } from "@/lib/date";
import { ItemForm } from "@/app/components/item-form";

export default function NewItemPage({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  return <NewItemPageContent searchParams={searchParams} />;
}

async function NewItemPageContent({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const user = await requireCurrentUser();
  await maybeRunAutomaticReminderCheckForUser(user.id);

  return (
    <ItemForm
      title="Dodaj proizvod"
      description=""
      submitLabel="Sacuvaj"
      pendingLabel="Cuvanje..."
      action={createItemAction}
      isPremium={user.plan === "pro"}
      enableSmartScan
      returnTo="/items/new"
      errorMessage={searchParams?.error}
      initialValues={{
        name: "",
        retailer: "",
        price: "",
        priceCurrency: "EUR",
        purchaseDate: formatDateInput(new Date()),
        warrantyMonths: "24",
        notes: "",
        receiptImagePath: null,
        productImagePath: null,
        reminderEnabled: true,
        reminderDaysBefore: "30"
      }}
    />
  );
}
