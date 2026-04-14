import Link from "next/link";
import { openProFeatureAction } from "@/lib/actions";
import { PRO_FEATURES, type ProFeatureSlug } from "@/lib/pro-features";

type LockedFeatureCardProps = {
  feature: ProFeatureSlug;
  source: string;
  isPremium: boolean;
};

export function LockedFeatureCard({ feature, source, isPremium }: LockedFeatureCardProps) {
  const featureMeta = PRO_FEATURES[feature];
  const action = openProFeatureAction.bind(null, feature, source);
  const isAvailableNow = featureMeta.availableNow;

  return (
    <article className="pro-hint-card">
      <div className="pro-hint-head">
        <div>
          <h3 className="panel-title">{featureMeta.title}</h3>
          <p className="muted-copy">{featureMeta.summary}</p>
        </div>
        {!isPremium ? <span className="tag">Pro</span> : null}
      </div>
      {isPremium && isAvailableNow ? (
        <Link href={featureMeta.entryHref ?? `/pro/${feature}`} className="pro-state-note">
          Dostupno u tvom paketu
        </Link>
      ) : isPremium ? (
        <span className="pro-state-muted">U pripremi</span>
      ) : (
        <form action={action} className="inline-form">
          <button type="submit" className="button button-ghost pro-hint-button">
            Saznaj vise
          </button>
        </form>
      )}
    </article>
  );
}
