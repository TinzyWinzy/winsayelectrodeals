import { get, set, del, keys } from "idb-keyval";

const CACHE_PREFIX = "winsay_";

export async function cacheData<T>(key: string, data: T): Promise<void> {
  await set(`${CACHE_PREFIX}${key}`, {
    data,
    timestamp: Date.now(),
  });
}

export async function getCachedData<T>(key: string, maxAgeMs?: number): Promise<T | null> {
  const entry: { data: T; timestamp: number } | undefined = await get(`${CACHE_PREFIX}${key}`);
  if (!entry) return null;

  if (maxAgeMs && Date.now() - entry.timestamp > maxAgeMs) {
    await del(`${CACHE_PREFIX}${key}`);
    return null;
  }

  return entry.data;
}

export async function clearCache(): Promise<void> {
  const allKeys = await keys();
  const winsayKeys = allKeys.filter((k) => String(k).startsWith(CACHE_PREFIX));
  await Promise.all(winsayKeys.map((k) => del(k)));
}

export async function cachePackageData<T>(packages: T): Promise<void> {
  await cacheData("packages", packages);
}

export async function getCachedPackages<T>(): Promise<T | null> {
  return getCachedData<T>("packages", 60 * 60 * 1000);
}

export async function cacheQuoteFormData<T>(data: T): Promise<void> {
  await cacheData("quote_form", data);
}

export async function getCachedQuoteFormData<T>(): Promise<T | null> {
  return getCachedData<T>("quote_form");
}

export async function clearQuoteFormData(): Promise<void> {
  await del(`${CACHE_PREFIX}quote_form`);
}
