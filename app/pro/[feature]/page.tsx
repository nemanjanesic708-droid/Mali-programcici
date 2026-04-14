import Link from "next/link";
import { notFound } from "next/navigation";
import { registerLaunchInterestAction } from "@/lib/actions";
import { getCurrentUser } from "@/lib/current-user";
import { PRO_FEATURES, isProFeatureSlug } from "@/lib/pro-features";
import { NotifyMeForm } from "@/app/components/notify-me-form";

export default async function ProFeaturePage({
  params,
  searchParams
}: {
  params: { feature: string };
  searchParams?: { saved?: string; error?: string };
}) {
  if (!isProFeatureSlug(params.feature)) {
    notFound();
  }

  const user = await getCurrentUser();
  const feature = PRO_FEATURES[params.feature];
  const action = registerLaunchInterestAction.bind(null, params.feature);
  const returnTo = `/pro/${params.feature}`;
  const isAvailableNow = feature.availableNow;

  return (
    <div className="page-stack page-narrow">
      <section className="page-stack">
        <div className="stack">
          <Link href="/" className="back-link">
            Nazad na pregled
          </Link>
          <div>
            <h1 className="section-title">{feature.title}</h1>
            <p className="section-copy">{feature.summary}</p>
          </div>
        </div>
        <article className="detail-panel">
          <div>
            {!user.isPremium ? <span className="tag">Pro</span> : null}
            <h2 className="panel-title" style={{ marginTop: 10 }}>Sta omogucava</h2>
            <p className="muted-copy">{feature.details}</p>
          </div>
          <ul className="feature-list">
            {feature.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          {user.isPremium && isAvailableNow ? (
            <div className="panel panel-subtle">
              <h2 className="panel-title">Premium pristup je aktivan</h2>
              <p className="muted-copy">Ova funkcija je dostupna na tvom nalogu i nije zakljucana.</p>
            </div>
          ) : user.isPremium ? (
            <div className="panel panel-subtle">
              <h2 className="panel-title">U pripremi</h2>
              <p className="muted-copy">Ova premium funkcija jos nema pun tok u aplikaciji, iako je paket aktivan.</p>
            </div>
          ) : (
            <div className="stack">
              <div>
                <h2 className="panel-title">Otkljucaj premium</h2>
                <p className="muted-copy">Ostavi email adresu i javljamo kada funkcija bude dostupna.</p>
              </div>
              {searchParams?.saved ? <div className="notice notice-success">Sacuvano. Javicemo kada funkcija bude spremna.</div> : null}
              {searchParams?.error ? <div className="notice notice-error">{searchParams.error}</div> : null}
              <NotifyMeForm action={action} returnTo={returnTo} />
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
