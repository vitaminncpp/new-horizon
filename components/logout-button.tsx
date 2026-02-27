import { redirect } from "next/navigation";
import { clearSessionCookie } from "@/lib/http/session";

async function logoutAction() {
  "use server";

  await clearSessionCookie();
  redirect("/login");
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:opacity-85"
      >
        Sign out
      </button>
    </form>
  );
}
