import { createItemAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/current-user";
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
  const user = await getCurrentUser();

  return (
    <ItemForm
      title="Dodaj proizvod"
      description=""
      submitLabel="Sacuvaj"
      pendingLabel="Cuvanje..."
      action={createItemAction}
      isPremium={user.isPremium}
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
