import { logoutAction } from "@/lib/auth-actions";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="button button-ghost">
        Odjavi se
      </button>
    </form>
  );
}
