"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { addMonths, format, isValid } from "date-fns";
import { FormSubmitButton } from "@/app/components/form-submit-button";

export type ItemFormValues = {
  name: string;
  retailer: string;
  price: string;
  priceCurrency: "RSD" | "EUR";
  purchaseDate: string;
  warrantyMonths: string;
  notes: string;
  receiptImagePath?: string | null;
  productImagePath?: string | null;
  reminderEnabled: boolean;
  reminderDaysBefore: string;
};

type ItemFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  pendingLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  initialValues: ItemFormValues;
  returnTo: string;
  errorMessage?: string;
  isPremium: boolean;
  enableSmartScan: boolean;
};

type FieldErrors = Partial<
  Record<"name" | "retailer" | "price" | "purchaseDate" | "warrantyMonths" | "reminderDaysBefore", string>
>;
type OcrState = "idle" | "loading" | "done";

type OcrPreset = {
  keywords: string[];
  values: Partial<Pick<ItemFormValues, "name" | "retailer" | "price" | "priceCurrency" | "purchaseDate">>;
};

const OCR_PRESETS: OcrPreset[] = [
  {
    keywords: ["sony", "xm5", "wh1000xm5"],
    values: {
      name: "Sony WH-1000XM5",
      retailer: "TechMart",
      price: "389.99",
      priceCurrency: "EUR",
      purchaseDate: "2025-09-14"
    }
  },
  {
    keywords: ["airpods", "apple"],
    values: {
      name: "Apple AirPods Pro",
      retailer: "Apple Store",
      price: "279.00",
      priceCurrency: "EUR",
      purchaseDate: "2025-11-02"
    }
  },
  {
    keywords: ["dyson", "v15"],
    values: {
      name: "Dyson V15 Detect",
      retailer: "Home Studio",
      price: "729.00",
      priceCurrency: "EUR",
      purchaseDate: "2025-04-06"
    }
  },
  {
    keywords: ["samsung", "frame", "tv"],
    values: {
      name: "Samsung Frame TV 55",
      retailer: "Nova Electronics",
      price: "139900",
      priceCurrency: "RSD",
      purchaseDate: "2025-05-18"
    }
  }
];

function getExpiryPreview(purchaseDate: string, warrantyMonths: string) {
  if (!purchaseDate || !warrantyMonths) {
    return "Datum isteka se racuna automatski.";
  }

  const parsedDate = new Date(`${purchaseDate}T12:00:00`);
  const months = Number.parseInt(warrantyMonths, 10);

  if (!isValid(parsedDate) || !Number.isInteger(months) || months <= 0) {
    return "Datum isteka se racuna automatski.";
  }

  return `Istek garancije: ${format(addMonths(parsedDate, months), "d MMM yyyy")}`;
}

export function ItemForm({
  title,
  description,
  submitLabel,
  pendingLabel,
  action,
  initialValues,
  returnTo,
  errorMessage,
  isPremium,
  enableSmartScan
}: ItemFormProps) {
  const [values, setValues] = useState<ItemFormValues>(initialValues);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [ocrState, setOcrState] = useState<OcrState>("idle");
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [selectedReceiptName, setSelectedReceiptName] = useState<string | null>(null);
  const [selectedReceiptPreview, setSelectedReceiptPreview] = useState<string | null>(null);
  const [selectedProductImagePreview, setSelectedProductImagePreview] = useState<string | null>(
    initialValues.productImagePath ?? null
  );
  const [selectedProductImageName, setSelectedProductImageName] = useState<string | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const receiptPreviewUrlRef = useRef<string | null>(null);
  const productPreviewUrlRef = useRef<string | null>(null);

  const expiryPreview = useMemo(
    () => getExpiryPreview(values.purchaseDate, values.warrantyMonths),
    [values.purchaseDate, values.warrantyMonths]
  );
  const supportsCapture = useMemo(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return "capture" in document.createElement("input");
  }, []);

  useEffect(() => {
    return () => {
      if (receiptPreviewUrlRef.current) {
        URL.revokeObjectURL(receiptPreviewUrlRef.current);
      }

      if (productPreviewUrlRef.current) {
        URL.revokeObjectURL(productPreviewUrlRef.current);
      }
    };
  }, []);

  function updateValue<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((current) => ({
      ...current,
      [key]: value
    }));
  }

  function validateForm() {
    const nextErrors: FieldErrors = {};
    const price = Number.parseFloat(values.price.replace(",", "."));
    const warrantyMonths = Number.parseInt(values.warrantyMonths, 10);

    if (!values.name.trim()) {
      nextErrors.name = "Unesi naziv proizvoda.";
    }

    if (!values.retailer.trim()) {
      nextErrors.retailer = "Unesi naziv prodavnice.";
    }

    if (!values.purchaseDate) {
      nextErrors.purchaseDate = "Izaberi datum kupovine.";
    }

    if (!Number.isInteger(warrantyMonths) || warrantyMonths <= 0) {
      nextErrors.warrantyMonths = "Garancija mora trajati najmanje 1 mesec.";
    }

    if (!Number.isFinite(price) || price <= 0) {
      nextErrors.price = "Unesi ispravnu cenu.";
    }

    if (values.reminderEnabled && !["7", "14", "30"].includes(values.reminderDaysBefore)) {
      nextErrors.reminderDaysBefore = "Izaberi kada zelis podsetnik.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function runMockOcr(file: File) {
    console.info("[Warranty Tracker] OCR start", {
      fileName: file.name,
      size: file.size,
      type: file.type
    });
    setSelectedReceiptName(file.name);
    setOcrState("loading");
    setOcrMessage("Obrada racuna...");

    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    const lowerFileName = file.name.toLowerCase();
    const preset = OCR_PRESETS.find((entry) => entry.keywords.some((keyword) => lowerFileName.includes(keyword)));
    const priceMatch = lowerFileName.match(/(\d{2,4}[.,]\d{2})/);
    const dateMatch = lowerFileName.match(/(20\d{2})[-_.](\d{2})[-_.](\d{2})/);

    const extractedValues: Partial<ItemFormValues> = {
      name: preset?.values.name ?? "",
      retailer: preset?.values.retailer ?? "",
      price: preset?.values.price ?? (priceMatch ? priceMatch[1].replace(",", ".") : ""),
      priceCurrency: preset?.values.priceCurrency ?? values.priceCurrency,
      purchaseDate: preset?.values.purchaseDate ?? (dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : "")
    };

    const matchedFields = Object.entries(extractedValues)
      .filter(([, value]) => Boolean(value))
      .map(([key]) => key);

    setValues((current) => ({
      ...current,
      name: extractedValues.name || current.name,
      retailer: extractedValues.retailer || current.retailer,
      price: extractedValues.price || current.price,
      priceCurrency: extractedValues.priceCurrency || current.priceCurrency,
      purchaseDate: extractedValues.purchaseDate || current.purchaseDate
    }));

    setOcrState("done");
    setOcrMessage(
      matchedFields.length > 0
        ? "Prepoznati podaci su uneti u formu. Proveri ih pre cuvanja."
        : "Nisu prepoznata sva polja. Nastavi rucni unos."
    );
    console.info("[Warranty Tracker] OCR done", {
      fileName: file.name,
      matchedFields
    });
  }

  function updateReceiptPreview(file: File) {
    if (receiptPreviewUrlRef.current) {
      URL.revokeObjectURL(receiptPreviewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    receiptPreviewUrlRef.current = objectUrl;
    setSelectedReceiptPreview(objectUrl);
  }

  function updateProductPreview(file: File) {
    if (productPreviewUrlRef.current) {
      URL.revokeObjectURL(productPreviewUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    productPreviewUrlRef.current = objectUrl;
    setSelectedProductImagePreview(objectUrl);
  }

  function openFileInput(input: HTMLInputElement | null, source: "camera" | "upload" | "camera-fallback") {
    if (!input) {
      console.warn("[Warranty Tracker] Receipt input missing", { source });
      return;
    }

    console.info("[Warranty Tracker] Requesting receipt input", {
      source,
      capture: input.getAttribute("capture") ?? "none",
      hasShowPicker: typeof input.showPicker === "function"
    });

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.click();
      }

      console.info("[Warranty Tracker] Receipt input open requested", { source });
    } catch (error) {
      console.warn("[Warranty Tracker] Receipt input request failed", { source, error });

      if (source === "camera" && uploadInputRef.current && uploadInputRef.current !== input) {
        openFileInput(uploadInputRef.current, "camera-fallback");
      }
    }
  }

  function handleCameraClick() {
    console.info("[Warranty Tracker] Click on 'Slikaj racun'");

    if (!supportsCapture) {
      console.info("[Warranty Tracker] Capture is not supported, using upload fallback");
      openFileInput(uploadInputRef.current, "camera-fallback");
      return;
    }

    openFileInput(cameraInputRef.current, "camera");
  }

  function handleUploadClick() {
    console.info("[Warranty Tracker] Click on 'Otpremi racun'");
    openFileInput(uploadInputRef.current, "upload");
  }

  async function handleReceiptSelection(
    event: ChangeEvent<HTMLInputElement>,
    source: "camera" | "upload",
    shouldRunOcr: boolean
  ) {
    const file = event.target.files?.[0];

    console.info("[Warranty Tracker] Receipt input changed", {
      source,
      hasFile: Boolean(file)
    });

    if (!file) {
      console.info("[Warranty Tracker] No receipt file selected", { source });
      return;
    }

    console.info("[Warranty Tracker] Receipt file selected", {
      source,
      fileName: file.name,
      size: file.size,
      type: file.type
    });

    updateReceiptPreview(file);
    setSelectedReceiptName(file.name);

    if (shouldRunOcr) {
      await runMockOcr(file);
    } else {
      setOcrState("idle");
      setOcrMessage(null);
    }

  }

  function handleProductImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    updateProductPreview(file);
    setSelectedProductImageName(file.name);
  }

  return (
    <div className="page-stack page-narrow">
      <div className="stack">
        <Link href="/" className="back-link">
          Nazad na pregled
        </Link>
        <div>
          <h1 className="section-title">{title}</h1>
          {description ? <p className="section-copy">{description}</p> : null}
        </div>
      </div>

      {errorMessage ? <div className="notice notice-error">{errorMessage}</div> : null}

      <form
        action={action}
        className="form-panel"
        encType="multipart/form-data"
        onSubmit={(event) => {
          if (!validateForm()) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="returnTo" value={returnTo} />

        <section className="upload-panel">
          <div className="upload-panel-head">
            <div>
              <h2 className="panel-title">Slika proizvoda</h2>
              <p className="muted-copy">Dodaj fotografiju proizvoda radi lakseg pregleda u listi i detaljima.</p>
            </div>
          </div>

          <div className="field">
            <label htmlFor="productImage">Slika proizvoda</label>
            <input id="productImage" name="productImage" type="file" accept="image/*" onChange={handleProductImageChange} />
            <div className="input-help">Podrzane su fotografije i slike proizvoda do 10 MB.</div>
          </div>

          {selectedProductImageName ? <div className="ocr-file-name">Izabrana slika: {selectedProductImageName}</div> : null}
          {selectedProductImagePreview ? (
            <div className="upload-preview">
              <img src={selectedProductImagePreview} alt="Pregled slike proizvoda" className="receipt-image" />
            </div>
          ) : null}

          {initialValues.productImagePath ? (
            <label className="checkbox-row">
              <input type="checkbox" name="removeProductImage" />
              Ukloni trenutnu sliku proizvoda
            </label>
          ) : null}
        </section>

        {enableSmartScan ? (
          isPremium ? (
            <section className="ocr-panel">
              <div className="ocr-panel-head">
                <div>
                  <h2 className="panel-title">Pametno skeniranje racuna</h2>
                  <p className="muted-copy">
                    Otpremi fotografiju ili uslikaj racun, a aplikacija ce automatski popuniti naziv proizvoda,
                    prodavnicu, cenu i datum kupovine.
                  </p>
                </div>
                <span className="tag">Premium</span>
              </div>

              <div className="ocr-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={handleUploadClick}
                >
                  Otpremi racun
                </button>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={handleCameraClick}
                >
                  Slikaj racun
                </button>
              </div>

              <input
                id="receiptUpload"
                ref={uploadInputRef}
                className="hidden-file-input"
                type="file"
                name="receiptUpload"
                accept="image/*"
                onClick={() => console.info("[Warranty Tracker] Upload input click fired")}
                onFocus={() => console.info("[Warranty Tracker] Upload input focused")}
                onChange={(event) => handleReceiptSelection(event, "upload", true)}
              />
              <input
                id="receiptCamera"
                ref={cameraInputRef}
                className="hidden-file-input"
                type="file"
                name="receiptCamera"
                accept="image/*"
                capture="environment"
                onClick={() => console.info("[Warranty Tracker] Camera input click fired")}
                onFocus={() => console.info("[Warranty Tracker] Camera input focused")}
                onChange={(event) => handleReceiptSelection(event, "camera", true)}
              />

              <div className="ocr-footnote">Premium: automatsko prepoznavanje podataka sa racuna</div>
              <div className="input-help">Ako se kamera ne otvori direktno, otvorice se obican izbor slika.</div>
              {selectedReceiptName ? <div className="ocr-file-name">Izabrani racun: {selectedReceiptName}</div> : null}
              {selectedReceiptPreview ? (
                <div className="ocr-preview">
                  <img src={selectedReceiptPreview} alt="Pregled izabranog racuna" className="receipt-image" />
                </div>
              ) : null}
              {ocrState === "loading" ? <div className="ocr-status">Obrada racuna...</div> : null}
              {ocrMessage && ocrState === "done" ? <div className="notice notice-success">{ocrMessage}</div> : null}
            </section>
          ) : (
            <section className="ocr-panel">
              <div className="ocr-panel-head">
                <div>
                  <h2 className="panel-title">Racun</h2>
                  <p className="muted-copy">Dodaj sliku racuna uz novi proizvod.</p>
                </div>
                <Link href="/pro/smart-ocr" className="ocr-upgrade-link">
                  Nadogradi za pametno skeniranje
                </Link>
              </div>
              <div className="field">
                <label htmlFor="receiptUpload">Slika racuna</label>
                <input
                  id="receiptUpload"
                  name="receiptUpload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleReceiptSelection(event, "upload", false)}
                />
                <div className="input-help">Pametno skeniranje racuna dostupno je u Premium paketu.</div>
              </div>
              {selectedReceiptPreview ? (
                <div className="ocr-preview">
                  <img src={selectedReceiptPreview} alt="Pregled izabranog racuna" className="receipt-image" />
                </div>
              ) : null}
            </section>
          )
        ) : (
          <div className="field">
            <label htmlFor="receiptUpload">Slika racuna</label>
            <input
              id="receiptUpload"
              name="receiptUpload"
              type="file"
              accept="image/*"
              onChange={(event) => handleReceiptSelection(event, "upload", false)}
            />
            <div className="input-help">Dodaj fotografiju ili sken racuna.</div>
            {selectedReceiptPreview ? (
              <div className="ocr-preview">
                <img src={selectedReceiptPreview} alt="Pregled izabranog racuna" className="receipt-image" />
              </div>
            ) : null}
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Naziv proizvoda</label>
            <input
              id="name"
              name="name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="Apple AirPods Pro"
            />
            {errors.name ? <div className="field-error">{errors.name}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="retailer">Prodavnica</label>
            <input
              id="retailer"
              name="retailer"
              value={values.retailer}
              onChange={(event) => updateValue("retailer", event.target.value)}
              placeholder="Nova Electronics"
            />
            {errors.retailer ? <div className="field-error">{errors.retailer}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="price">Cena</label>
            <input
              id="price"
              name="price"
              inputMode="decimal"
              value={values.price}
              onChange={(event) => updateValue("price", event.target.value)}
              placeholder={values.priceCurrency === "RSD" ? "12500" : "199.99"}
            />
            {errors.price ? <div className="field-error">{errors.price}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="priceCurrency">Valuta</label>
            <select
              id="priceCurrency"
              name="priceCurrency"
              value={values.priceCurrency}
              onChange={(event) => updateValue("priceCurrency", event.target.value as ItemFormValues["priceCurrency"])}
            >
              <option value="RSD">RSD</option>
              <option value="EUR">EUR</option>
            </select>
            <div className="input-help">Cena se prikazuje u valuti koju izaberes.</div>
          </div>

          <div className="field">
            <label htmlFor="purchaseDate">Datum kupovine</label>
            <input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              value={values.purchaseDate}
              onChange={(event) => updateValue("purchaseDate", event.target.value)}
            />
            {errors.purchaseDate ? <div className="field-error">{errors.purchaseDate}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="warrantyMonths">Trajanje garancije (meseci)</label>
            <input
              id="warrantyMonths"
              name="warrantyMonths"
              type="number"
              min="1"
              step="1"
              value={values.warrantyMonths}
              onChange={(event) => updateValue("warrantyMonths", event.target.value)}
            />
            <div className="expiry-preview">{expiryPreview}</div>
            {errors.warrantyMonths ? <div className="field-error">{errors.warrantyMonths}</div> : null}
          </div>

          <div className="field field-span-2">
            <label htmlFor="notes">Napomena</label>
            <textarea
              id="notes"
              name="notes"
              value={values.notes}
              onChange={(event) => updateValue("notes", event.target.value)}
              placeholder="Dodaj kratku napomenu ako je potrebna."
            />
          </div>

          <div className="field field-span-2">
            <label className="checkbox-row checkbox-stack">
              <input
                type="checkbox"
                name="reminderEnabled"
                checked={values.reminderEnabled}
                onChange={(event) => updateValue("reminderEnabled", event.target.checked)}
              />
              <span>
                <strong>Podseti me pre isteka garancije</strong>
                <span className="input-help">Aplikacija ce oznaciti proizvod kada udje u period za podsetnik.</span>
              </span>
            </label>
          </div>

          {values.reminderEnabled ? (
            <div className="field field-span-2">
              <label htmlFor="reminderDaysBefore">Kada zelis podsetnik</label>
              <select
                id="reminderDaysBefore"
                name="reminderDaysBefore"
                value={values.reminderDaysBefore}
                onChange={(event) => updateValue("reminderDaysBefore", event.target.value)}
              >
                <option value="7">7 dana ranije</option>
                <option value="14">14 dana ranije</option>
                <option value="30">30 dana ranije</option>
              </select>
              {errors.reminderDaysBefore ? <div className="field-error">{errors.reminderDaysBefore}</div> : null}
            </div>
          ) : (
            <input type="hidden" name="reminderDaysBefore" value="" />
          )}
        </div>

        {initialValues.receiptImagePath ? (
          <div className="stack">
            <div className="receipt-frame" style={{ maxWidth: 360 }}>
              <img src={initialValues.receiptImagePath} alt="Trenutni racun" className="receipt-image" />
            </div>
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="removeReceipt"
                checked={removeReceipt}
                onChange={(event) => setRemoveReceipt(event.target.checked)}
              />
              Ukloni trenutni racun
            </label>
          </div>
        ) : null}

        <div className="form-actions">
          <FormSubmitButton pendingLabel={pendingLabel} className="button button-primary">
            {submitLabel}
          </FormSubmitButton>
          <Link href="/" className="button button-ghost">
            Otkazi
          </Link>
        </div>
      </form>
    </div>
  );
}
