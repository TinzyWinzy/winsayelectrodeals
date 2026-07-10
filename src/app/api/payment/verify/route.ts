import { NextResponse } from "next/server";
import { verifyPayNowWebhook } from "@/lib/payments";
import { getQuoteByQuoteId, updateQuote, createPayment } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paynow-signature") || "";

    const isValid = await verifyPayNowWebhook(body, signature);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const params = new URLSearchParams(body);
    const reference = params.get("reference") || "";
    const status = params.get("status") || "";
    const amount = parseFloat(params.get("amount") || "0");
    const paynowRef = params.get("paynowreference") || "";

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    if (status === "paid") {
      const quote = await getQuoteByQuoteId(reference);
      if (!quote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }

      // Validate amount matches the expected deposit (allow small float tolerance)
      const expectedAmount = quote.depositUsd;
      const tolerance = 0.01;
      if (Math.abs(amount - expectedAmount) > tolerance) {
        return NextResponse.json(
          { error: "Amount mismatch" },
          { status: 400 }
        );
      }

      // Idempotency: treat duplicate notifications for the same PayNow ref as accepted
      if (paynowRef && quote.status !== "pending") {
        return NextResponse.json({ received: true, idempotent: true });
      }

      await createPayment({
        quoteId: quote.id,
        amountUsd: amount,
        amountZig: null,
        method: "paynow",
        transactionRef: paynowRef || reference,
        status: "completed",
      });

      await updateQuote(quote.id, {
        status: "deposit_paid",
        paymentMethod: "paynow",
      } as Record<string, unknown>);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
