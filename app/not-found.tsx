import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-stack">
      <section className="empty-panel">
        <h1 className="section-title">Proizvod nije pronadjen</h1>
        <p className="section-copy">Vrati se na listu i proveri sacuvane proizvode.</p>
        <div className="actions-row" style={{ justifyContent: "center", marginTop: 20 }}>
          <Link href="/" className="button button-primary">
            Nazad na pregled
          </Link>
        </div>
      </section>
    </div>
  );
}
