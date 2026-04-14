"use client";

import { useEffect, useMemo, useState } from "react";

type AdminUserRow = {
  id: string;
  fullName: string;
  email: string | null;
  role: string;
  verified: boolean;
  plan: string;
  createdAt: string;
};

type PremiumInterestRow = {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function AdminDashboardTables() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [premiumInterest, setPremiumInterest] = useState<PremiumInterestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [usersResponse, premiumResponse] = await Promise.all([
          fetch("/api/admin/users", { cache: "no-store" }),
          fetch("/api/admin/premium-interest", { cache: "no-store" })
        ]);

        if (!usersResponse.ok || !premiumResponse.ok) {
          throw new Error("Admin podaci nisu dostupni.");
        }

        const [usersPayload, premiumPayload] = await Promise.all([usersResponse.json(), premiumResponse.json()]);

        if (!cancelled) {
          setUsers(usersPayload.users);
          setPremiumInterest(premiumPayload.entries);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Ucitavanje nije uspelo.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleVerified(user: AdminUserRow) {
    try {
      setPendingUserId(user.id);
      setError(null);

      const response = await fetch(`/api/admin/users/${user.id}/verified`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          verified: !user.verified
        })
      });

      if (!response.ok) {
        throw new Error("Izmena verified statusa nije uspela.");
      }

      const payload = await response.json();
      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === payload.user.id ? { ...currentUser, verified: payload.user.verified } : currentUser
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Izmena verified statusa nije uspela.");
    } finally {
      setPendingUserId(null);
    }
  }

  const userRows = useMemo(
    () =>
      users.map((user) => (
        <tr key={user.id}>
          <td>{user.fullName}</td>
          <td>{user.email ?? "Nema email"}</td>
          <td>{user.role}</td>
          <td>{user.plan}</td>
          <td>
            <span className={`status-pill ${user.verified ? "status-active" : "status-expired"}`}>
              {user.verified ? "Verified" : "Not verified"}
            </span>
          </td>
          <td>{formatDate(user.createdAt)}</td>
          <td>
            <button
              type="button"
              className="button button-ghost button-small"
              onClick={() => toggleVerified(user)}
              disabled={pendingUserId === user.id}
            >
              {pendingUserId === user.id ? "Cuvanje..." : user.verified ? "Iskljuci verified" : "Ukljuci verified"}
            </button>
          </td>
        </tr>
      )),
    [pendingUserId, users]
  );

  const premiumRows = useMemo(
    () =>
      premiumInterest.map((entry) => (
        <tr key={entry.id}>
          <td>{entry.email}</td>
          <td>{entry.source ?? "n/a"}</td>
          <td>{formatDate(entry.createdAt)}</td>
        </tr>
      )),
    [premiumInterest]
  );

  return (
    <div className="page-stack">
      {error ? <div className="notice notice-error">{error}</div> : null}

      <section className="panel">
        <div className="stack">
          <div>
            <h2 className="panel-title">Registrovani korisnici</h2>
            <p className="muted-copy">Lista svih usera iz baze i kontrola verified statusa.</p>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ime</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Verified</th>
                  <th>Kreiran</th>
                  <th>Akcija</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="admin-table-empty">
                      Ucitavanje korisnika...
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  userRows
                ) : (
                  <tr>
                    <td colSpan={7} className="admin-table-empty">
                      Nema registrovanih korisnika.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="stack">
          <div>
            <h2 className="panel-title">Premium interesovanja</h2>
            <p className="muted-copy">Email i datum prijave za ljude zainteresovane za Premium.</p>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Datum prijave</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="admin-table-empty">
                      Ucitavanje premium interesa...
                    </td>
                  </tr>
                ) : premiumInterest.length > 0 ? (
                  premiumRows
                ) : (
                  <tr>
                    <td colSpan={3} className="admin-table-empty">
                      Jos nema prijava za Premium.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
