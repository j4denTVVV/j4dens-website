import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import profileAsset from "@/assets/j4dentv-pfp.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "J4DENTV — Official Links" },
      {
        name: "description",
        content:
          "J4DENTV — FOUR THA VISION. Official links to Twitch, YouTube, TikTok, Instagram, X and the 4TV community Discord.",
      },
      { property: "og:title", content: "J4DENTV — Official Links" },
      {
        property: "og:description",
        content: "J4DENTV — FOUR THA VISION. All platforms, one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

// "THE RETURN" countdown target — 6 Oct 2026, 18:00 London time
const TARGET = new Date("2026-10-06T18:00:00+01:00").getTime();

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

const pad = (n: number) => String(n).padStart(2, "0");

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#fe2c55]">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .6.05.88.13V9.4a6.33 6.33 0 0 0-1-.05A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#5865F2]">
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.93-1.51 13.8 13.8 0 0 0-.64 1.28 18.3 18.3 0 0 0-5.5 0 13.8 13.8 0 0 0-.64-1.28c-1.71.29-3.37.8-4.93 1.51A20.3 20.3 0 0 0 .1 18.06a19.9 19.9 0 0 0 6.07 3.03c.49-.66.93-1.37 1.3-2.1a12.9 12.9 0 0 1-2.05-.98c.17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.16 0c.16.13.33.26.5.38-.65.39-1.34.72-2.05.98.37.73.81 1.44 1.3 2.1a19.9 19.9 0 0 0 6.07-3.03 20.3 20.3 0 0 0-3.58-13.69ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#FF0000]">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
    </svg>
  );
}

function TwitchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#9146FF]">
      <path d="M11.57 2.14 2.14 6.86v13.71h4.29v2.86h2.86l2.85-2.86h4.29l5.43-5.43V2.14H11.57Zm8.57 12.29-3.07 3.07h-4.86l-2.86 2.86v-2.86H6.5V4.07h13.64v10.36ZM17 7.5v5.43h-2.14V7.5H17Zm-5.36 0v5.43H9.5V7.5h2.14Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-[#E1306C]">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07-3.2 0-3.58-.01-4.85-.07-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85 0-3.2.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.18 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.41-11.85a1.44 1.44 0 1 0 1.43 1.44 1.44 1.44 0 0 0-1.43-1.44Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-foreground">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

const LINKS = [
  { name: "TIKTOK", handle: "@j4dentv_", href: "https://www.tiktok.com/@j4dentv_", icon: <TikTokIcon /> },
  { name: "DISCORD", handle: "discord.gg/wBkU3kvvv", href: "https://discord.gg/wBkU3kvvv", icon: <DiscordIcon /> },
  { name: "YOUTUBE", handle: "@j4dentv", href: "https://www.youtube.com/@j4denTV", icon: <YouTubeIcon /> },
  { name: "TWITCH", handle: "@j4dentv", href: "https://www.twitch.tv/j4denTV", icon: <TwitchIcon /> },
  { name: "INSTAGRAM", handle: "@j4dentv", href: "https://www.instagram.com/j4denTV", icon: <InstagramIcon /> },
  { name: "X / TWITTER", handle: "@j4dentv", href: "https://x.com/j4denTV", icon: <XIcon /> },
];

function CountdownBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 border border-[#2a2a2a] bg-[#0d0d0d] px-4 py-3">
      <span className="font-display text-3xl tracking-wide text-[#f5f5f5]">{value}</span>
      <span className="text-[9px] font-semibold tracking-[0.25em] text-[#c9a84c]">{label}</span>
    </div>
  );
}

function Landing() {
  const { days, hours, minutes, seconds } = useCountdown();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-14">
      <main className="animate-page flex w-full max-w-md flex-col items-center">
        {/* Profile */}
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

        {/* Countdown */}
        <section className="mt-8 w-full border border-[#252525] bg-[#0b0b0b] px-6 py-7">
          <p className="flex items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.35em] text-[#c9a84c]">
            <span className="h-px w-6 bg-[#c9a84c]/50" aria-hidden />
            THE RETURN
            <span className="h-px w-6 bg-[#c9a84c]/50" aria-hidden />
          </p>
          <p className="mt-2.5 text-center text-[10px] tracking-[0.3em] text-[#666666]">
            NEW CONTENT LOADING...
          </p>
          <div className="mt-5 grid grid-cols-4 gap-2.5">
            <CountdownBox value={pad(days)} label="DAYS" />
            <CountdownBox value={pad(hours)} label="HRS" />
            <CountdownBox value={pad(minutes)} label="MIN" />
            <CountdownBox value={pad(seconds)} label="SEC" />
          </div>
        </section>

        {/* Links */}
        <p className="mt-10 text-[11px] font-semibold tracking-[0.35em] text-[#9a9a9a]">
          ALL PLATFORMS
        </p>
        <nav className="mt-5 flex w-full flex-col gap-3" aria-label="Social platforms">
          {LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 border border-[#252525] bg-[#0b0b0b] px-4 py-3.5 transition-colors duration-300 hover:border-[#c9a84c]/40 hover:bg-[#101010]"
            >
              <span className="flex h-9 w-9 items-center justify-center border border-[#2a2a2a] bg-[#101010]">
                {link.icon}
              </span>
              <span className="flex flex-col">
                <span className="text-xs font-bold tracking-[0.15em] text-[#f5f5f5]">
                  {link.name}
                </span>
                <span className="text-[11px] text-[#666666]">{link.handle}</span>
              </span>
              <span
                className="ml-auto text-sm text-[#c9a84c] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              >
                ↗
              </span>
            </a>
          ))}
        </nav>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-4">
          <p className="text-[10px] tracking-[0.3em] text-[#666666]">
            © 2026 J4DENTV — OFFICIAL LINKS
          </p>
          <Link
            to="/hq"
            aria-label="Private Creator HQ sign in"
            className="flex h-8 w-8 items-center justify-center border border-[#252525] text-[#666666] transition-colors duration-300 hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
          >
            <Lock className="h-3.5 w-3.5" />
          </Link>
        </footer>
      </main>
    </div>
  );
}
