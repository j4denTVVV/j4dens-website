import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import profileAsset from "@/assets/j4dentv-pfp.jpg.asset.json";

export const Route = createFileRoute("/hq")({
  head: () => ({
    meta: [
      { title: "J4DENTV Creator HQ — Private Access" },
      { name: "description", content: "Private access to the J4DENTV Creator HQ." },
      { property: "og:title", content: "J4DENTV Creator HQ" },
      { property: "og:description", content: "Private planning HQ for J4DENTV." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignIn,
});

const OWNER_EMAIL = "owner.j4dentv@gmail.com";

function SignIn() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const { error } = await supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password });
    setBusy(false);
    if (error) {
      setError(true);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-14">
      <main className="animate-page flex w-full max-w-md flex-col items-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-[#c9a84c]/15 blur-2xl" aria-hidden />
          <img
            src={profileAsset.url}
            alt="J4DENTV profile photo"
            className="relative h-20 w-20 rounded-full border border-[#c9a84c]/60 object-cover shadow-[0_0_40px_-5px_rgba(201,168,76,0.45)]"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 border border-[#c9a84c]/50 bg-[#0b0b0b] px-1.5 py-0.5 text-[7px] font-bold tracking-[0.2em] text-[#c9a84c]">
            OFFICIAL
          </span>
        </div>

        <h1 className="font-display mt-7 text-6xl tracking-wide text-[#f5f5f5]">J4DENTV</h1>

        <form onSubmit={submit} className="panel-hover mt-8 w-full border border-[#252525] bg-[#0b0b0b] px-6 py-7">
          <p className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.35em] text-[#c9a84c]">
            <span className="h-px w-6 bg-[#c9a84c]/50" aria-hidden />
            PRIVATE HQ
            <span className="h-px w-6 bg-[#c9a84c]/50" aria-hidden />
          </p>
          <p className="mt-2.5 text-center text-[10px] tracking-[0.3em] text-[#666666]">PRIVATE ACCESS</p>

          <label className="mt-6 block text-[10px] font-semibold tracking-[0.3em] text-[#9a9a9a]" htmlFor="hq-pass">
            PASSWORD
          </label>
          <input
            id="hq-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            autoComplete="current-password"
            className="mt-2 w-full border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3 text-sm tracking-widest text-[#f5f5f5] outline-none transition-colors focus:border-[#c9a84c]/50"
          />
          {error ? (
            <p role="alert" className="mt-3 text-center text-[11px] tracking-[0.2em] text-destructive">
              Incorrect password
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-3 border border-[#f5f5f5]/80 bg-[#f5f5f5] py-3 font-display text-xl tracking-[0.2em] text-[#050505] transition-colors hover:bg-[#050505] hover:text-[#f5f5f5] disabled:opacity-60"
          >
            {busy ? "OPENING…" : "ENTER HQ"}
          </button>
        </form>

        <Link
          to="/"
          className="mt-10 text-[10px] tracking-[0.3em] text-[#666666] transition-colors hover:text-[#c9a84c]"
        >
          ← BACK TO J4DENTV
        </Link>
      </main>
    </div>
  );
}
