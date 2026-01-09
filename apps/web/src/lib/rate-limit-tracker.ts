import { useSyncExternalStore } from "react";

const STORAGE_KEY = "rate-limit:events";
const MAX_EVENTS = 20;

type Listener = () => void;

export type RateLimitEvent = {
  id: string;
  timestamp: number;
  path: string;
  method?: string;
  status?: number;
  message?: string;
  meta?: Record<string, unknown>;
};

export type RateLimitEventInput = {
  path?: string | null;
  method?: string | null;
  status?: number | null;
  message?: string | null;
  meta?: Record<string, unknown>;
};

const listeners = new Set<Listener>();
let eventsCache: RateLimitEvent[] = readEventsFromStorage();
let fetchPatched = false;

function isBrowser() {
  return typeof window !== "undefined";
}

function readEventsFromStorage(): RateLimitEvent[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RateLimitEvent[];
  } catch {
    return [];
  }
}

function persistEvents(events: RateLimitEvent[]) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Ignore storage quota issues.
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return eventsCache;
}

if (isBrowser()) {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      eventsCache = readEventsFromStorage();
      emit();
    }
  });
}

function createEvent(input: RateLimitEventInput): RateLimitEvent {
  const now = Date.now();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${now}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    timestamp: now,
    path:
      input.path ??
      (isBrowser() ? window.location.pathname + window.location.search : "/"),
    method: input.method ?? undefined,
    status: input.status ?? 429,
    message: input.message ?? "Too many requests",
    meta: input.meta,
  };
}

export function recordRateLimitEvent(input: RateLimitEventInput = {}) {
  const event = createEvent(input);
  eventsCache = [event, ...eventsCache].slice(0, MAX_EVENTS);
  persistEvents(eventsCache);
  emit();
}

export function redirectToRateLimitPage() {
  if (
    typeof window !== "undefined" &&
    window.location.pathname !== "/rate-limit"
  ) {
    window.location.href = "/rate-limit";
  }
}

export function handleRateLimitEncounter(input: RateLimitEventInput = {}) {
  recordRateLimitEvent(input);
  redirectToRateLimitPage();
}

export function useRateLimitEvents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getLatestRateLimitEvent(): RateLimitEvent | undefined {
  return eventsCache[0];
}

function resolvePath(input: string | URL | Request | undefined) {
  if (!input) return undefined;
  try {
    if (typeof input === "string") {
      return new URL(input, window.location.origin).pathname;
    }
    if (input instanceof URL) {
      return input.pathname;
    }
    if (typeof Request !== "undefined" && input instanceof Request) {
      return new URL(input.url, window.location.origin).pathname;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function installRateLimitHandler() {
  if (!isBrowser() || fetchPatched) return;
  fetchPatched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const [input, init] = args;
    const method =
      (init && typeof init === "object" && "method" in init && init.method
        ? String(init.method).toUpperCase()
        : input instanceof Request
          ? input.method
          : undefined) ?? undefined;
    const response = await originalFetch(...args);
    if (response?.status === 429) {
      const path =
        resolvePath(response?.url) ??
        resolvePath(input as string | URL | Request);

      let message: string | undefined;
      try {
        const clone = response.clone();
        const data = await clone.json();
        message = data?.error?.message ?? data?.message;
      } catch {
        // ignore body parse errors
      }

      handleRateLimitEncounter({
        path,
        method,
        status: 429,
        message,
        meta: {
          source: "fetch",
          retryAfter: response?.headers?.get("retry-after") ?? undefined,
        },
      });
    }
    return response;
  };
}
