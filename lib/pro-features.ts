export const PRO_FEATURES = {
  "smart-ocr": {
    slug: "smart-ocr",
    title: "Pametno OCR skeniranje racuna",
    eyebrow: "Pro funkcija",
    availableNow: true,
    entryHref: "/items/new",
    summary: "Skeniraj racun i automatski popuni prodavnicu, cenu i osnovne podatke o garanciji.",
    details:
      "Pripremamo OCR obradu racuna, proveru prepoznatih polja i jednostavan pregled pre cuvanja kako bi unos bio brzi i pouzdaniji.",
    bullets: [
      "Automatsko prepoznavanje prodavnice, datuma i iznosa",
      "Predlog trajanja garancije na osnovu racuna",
      "Provera podataka pre cuvanja"
    ]
  },
  "cloud-backup": {
    slug: "cloud-backup",
    title: "Backup u oblaku",
    eyebrow: "Pro funkcija",
    availableNow: false,
    summary: "Cuvaj racune i istoriju garancija bezbedno i dostupno na vise uredjaja.",
    details:
      "Pro plan ce doneti sinhronizaciju izmedju uredjaja, oporavak podataka i sigurnije cuvanje dokumenata na jednom mestu.",
    bullets: [
      "Pristup sa vise uredjaja",
      "Bezbedno cuvanje racuna",
      "Obnova arhive posle reinstalacije"
    ]
  },
  "automatic-reminders": {
    slug: "automatic-reminders",
    title: "Automatski podsetnici",
    eyebrow: "Pro funkcija",
    availableNow: true,
    entryHref: "/",
    summary: "Prati proizvode sa ukljucenim podsetnikom i oznaci ih kada udju u reminder period.",
    details:
      "Osnovni in-app sistem podsetnika je aktivan: proizvod moze da ima reminder 7, 14 ili 30 dana pre isteka, a aplikacija ga prikazuje kada udje u taj period.",
    bullets: [
      "Reminder period 7, 14 ili 30 dana pre isteka",
      "Oznake u listi i na detaljima proizvoda",
      "Prostor za email i push obavestenja kasnije"
    ]
  }
} as const;

export type ProFeatureSlug = keyof typeof PRO_FEATURES;

export function isProFeatureSlug(value: string): value is ProFeatureSlug {
  return value in PRO_FEATURES;
}
