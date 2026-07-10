const PAYNOW_INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID!;
const PAYNOW_INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY!;
const PAYNOW_RESULT_URL = process.env.PAYNOW_RESULT_URL!;
const PAYNOW_RETURN_URL = process.env.PAYNOW_RETURN_URL!;

interface PayNowInitiateResponse {
  status: "success" | "error";
  browserurl?: string;
  pollurl?: string;
  hash?: string;
  error?: string;
}

export async function initiatePayNowPayment(params: {
  reference: string;
  amount: number;
  email: string;
  description: string;
}): Promise<PayNowInitiateResponse> {
  const formData = new URLSearchParams();
  formData.append("id", PAYNOW_INTEGRATION_ID);
  formData.append("reference", params.reference);
  formData.append("amount", params.amount.toFixed(2));
  formData.append("additionalinfo", params.description);
  formData.append("returnurl", `${PAYNOW_RETURN_URL}?ref=${params.reference}`);
  formData.append("resulturl", PAYNOW_RESULT_URL);
  formData.append("authemail", params.email);

  const response = await fetch("https://www.paynow.co.zw/interface/initiate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const text = await response.text();

  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    return { status: "error", error: "Invalid response from PayNow" };
  }

  const parsed = parsePayNowResponse(text);

  if (parsed.status === "error") {
    return {
      status: "error",
      error: parsed.error || "PayNow transaction failed",
    };
  }

  if (parsed.browserurl) {
    return {
      status: "success",
      browserurl: parsed.browserurl,
      pollurl: parsed.pollurl,
      hash: parsed.hash,
    };
  }

  return { status: "error", error: "No payment URL returned" };
}

export async function verifyPayNowTransaction(pollurl: string): Promise<{
  status: "paid" | "pending" | "failed";
  reference?: string;
  amount?: number;
}> {
  const response = await fetch(pollurl);
  const text = await response.text();
  const parsed = parsePayNowResponse(text);

  if (parsed.status === "paid") {
    return {
      status: "paid",
      reference: parsed.reference,
      amount: parsed.amount ? parseFloat(parsed.amount) : undefined,
    };
  }

  if (parsed.status === "failed" || parsed.status === "error" || parsed.status === "cancelled") {
    return { status: "failed" };
  }

  return { status: "pending" };
}

export function parsePayNowResponse(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split("\n");
  for (const line of lines) {
    const eqIndex = line.indexOf("=");
    if (eqIndex > 0) {
      const key = line.substring(0, eqIndex).trim().toLowerCase();
      const value = line.substring(eqIndex + 1).trim();
      result[key] = value;
    }
  }
  return result;
}

export async function verifyPayNowWebhook(body: string, signature: string): Promise<boolean> {
  const crypto = await import("node:crypto");
  const hash = crypto
    .createHash("sha512")
    .update(body + PAYNOW_INTEGRATION_KEY)
    .digest("hex")
    .toUpperCase();

  return hash === signature.toUpperCase();
}
