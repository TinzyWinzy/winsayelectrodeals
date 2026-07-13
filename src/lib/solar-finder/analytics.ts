import type { AnalyticsEvent } from "@/types/solar-finder";

const EVENTS_STORAGE_KEY = "winsay_solar_finder_analytics";

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function storeEvents(events: AnalyticsEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch {}
}

export function trackEvent(name: string, data?: Record<string, unknown>): void {
  const event: AnalyticsEvent = {
    name,
    timestamp: new Date().toISOString(),
    data,
  };

  const events = getStoredEvents();
  events.push(event);
  storeEvents(events);

  if (process.env.NODE_ENV === "development") {
    console.debug("[Solar Finder Analytics]", name, data);
  }
}

export function getTrackedEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

export function clearEvents(): void {
  storeEvents([]);
}

export function getEventsSummary(): Record<string, number> {
  const events = getStoredEvents();
  const summary: Record<string, number> = {};
  for (const event of events) {
    summary[event.name] = (summary[event.name] || 0) + 1;
  }
  return summary;
}
