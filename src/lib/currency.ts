import { getRbzRate, setRbzRate } from "./db";

const RBZ_API_URL = "https://www.rbz.co.zw/api/rates";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000;

export async function getUsdToZigRate(): Promise<number> {
  const cached = await getRbzRate();

  if (cached) {
    const age = Date.now() - cached.updatedAt.getTime();
    if (age < CACHE_DURATION_MS) {
      return cached.usdToZig;
    }
  }

  try {
    const rate = await fetchRbzRate();
    if (rate > 0) {
      await setRbzRate(rate);
    }
    return rate;
  } catch {
    if (cached) {
      return cached.usdToZig;
    }
    const fallback = process.env.NEXT_PUBLIC_FALLBACK_ZIG_RATE;
    return fallback ? parseFloat(fallback) : 26;
  }
}

async function fetchRbzRate(): Promise<number> {
  const response = await fetch(RBZ_API_URL, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`RBZ API returned ${response.status}`);
  }

  const data = await response.json();
  const rate = data?.usdToZig || data?.rate || data?.interbank_rate;
  if (typeof rate !== "number" || rate <= 0) {
    throw new Error("Invalid rate from RBZ API");
  }

  return rate;
}

export function convertUsdToZig(usdAmount: number, rate: number): number {
  return Math.round(usdAmount * rate * 100) / 100;
}
