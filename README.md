# Warranty Tracker

Modern MVP web app for saving products, receipts, and warranty expiry dates in one place.

## Stack

- Next.js 14 + React + TypeScript
- Prisma + SQLite
- App Router pages and server actions for CRUD and Pro interest tracking

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run dev
```

3. Open `http://localhost:3000`

`predev` runs `prisma db push`, so the SQLite database is created automatically. The app also seeds example products on first load if the database is empty.

If PowerShell blocks `npm` script execution on your machine, use:

```bash
npm.cmd install
npm.cmd run dev
```

## Included MVP flows

- Dashboard with seeded items and warranty statuses
- Add item form with receipt image upload
- Item detail page
- Edit item flow with automatic expiry recalculation
- Delete item flow
- Locked Pro feature cards with a coming-soon page
- Interest capture for `Notify me when Pro launches`
- Admin login and protected `/admin` dashboard
- Analytics-ready event hooks for `pro_click` and `notify_me_click`

## Notes for later expansion

- Add auth by introducing a `User` model and relating `Product`, `LaunchInterest`, and `AnalyticsEvent`
- Replace local receipt storage with cloud object storage
- Add OCR parsing and notification jobs behind the existing Pro entry points
