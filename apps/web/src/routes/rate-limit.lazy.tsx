import { Link, createLazyFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  Clock4,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";

import {
  useRateLimitEvents,
  type RateLimitEvent,
} from "@/lib/rate-limit-tracker";

export const Route = createLazyFileRoute("/rate-limit")({
  component: RateLimitPage,
});

function RateLimitPage() {
  const events = useRateLimitEvents();
  const latest = events[0];

  const uniquePaths = new Set(events.map((event) => event.path));

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
        <div className="absolute inset-0 backdrop-blur-3xl bg-[rgba(6,11,25,0.85)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-400">
            Error 429
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
            You&apos;re on fire! 🔥
          </h1>
          <p className="mt-3 text-base text-slate-300 md:text-lg">
            We&apos;ve temporarily paused requests because the system detected a
            spike in traffic from your session. Take a breather, then try
            again—your progress is safe.
          </p>
        </header>

        {latest ? (
          <div className="grid gap-6 md:grid-cols-2">
            <HeroCard
              event={latest}
              totalHits={events.length}
              unique={uniquePaths.size}
            />
            <TimelineCard events={events} />
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-200">
            <p className="text-lg font-semibold">No rate limit events yet</p>
            <p className="mt-2 text-sm text-slate-400">
              When a 429 error happens we&apos;ll capture the details here so
              you can share them with support.
            </p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to safety
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
            Retry request
          </button>
        </div>
      </div>
    </div>
  );
}

function HeroCard({
  event,
  totalHits,
  unique,
}: {
  event: RateLimitEvent;
  totalHits: number;
  unique: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300">
          <TriangleAlert className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-300">
            Latest spike
          </p>
          <p className="text-xl font-semibold text-white">
            {new Date(event.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <DetailItem label="Endpoint" value={event.path} mono />
        <DetailItem label="Method" value={event.method ?? "UNKNOWN"} badge />
        <DetailItem
          label="Message"
          value={event.message ?? "Too many requests"}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
        <Stat
          label="Hits this session"
          value={totalHits.toString()}
          icon={Activity}
        />
        <Stat
          label="Unique endpoints"
          value={unique.toString()}
          icon={Clock4}
        />
      </div>
    </div>
  );
}

function TimelineCard({ events }: { events: RateLimitEvent[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-lg font-semibold text-white">Recent activity</h2>
      <p className="text-sm text-slate-400">
        Latest 429 responses captured from this browser.
      </p>

      <div className="mt-4 space-y-4">
        {events.slice(0, 6).map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border border-white/5 bg-slate-900/40 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-white">
                {event.method ?? "REQUEST"} · {event.status ?? 429}
              </div>
              <div className="text-xs text-slate-400">
                {formatRelativeTime(event.timestamp)}
              </div>
            </div>
            <div className="mt-1 text-xs font-mono text-slate-300">
              {event.path}
            </div>
            {event.message ? (
              <p className="mt-2 text-sm text-slate-400">{event.message}</p>
            ) : null}
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-slate-400">
            You&apos;re all clear—no rate limiting has been detected.
          </p>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
  badge = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      {badge ? (
        <span className="mt-1 inline-flex items-center rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
          {value}
        </span>
      ) : (
        <p
          className={`mt-1 text-sm text-white ${
            mono ? "font-mono tracking-tight" : ""
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Icon className="h-4 w-4 text-sky-300" />
        {label}
      </div>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes <= 0) return "just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
