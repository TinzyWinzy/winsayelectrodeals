import { NextResponse } from "next/server";
import { initiatePayNowPayment } from "@/lib/payments";
import { getQuoteByQuoteId } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`payment:${ip}`, 10, 3600000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { quoteId, amount, email } = body;

    if (!quoteId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Validate quote and amount server-side to prevent tampering
    const quote = await getQuoteByQuoteId(quoteId);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const tolerance = 0.01;
    if (Math.abs(amount - quote.depositUsd) > tolerance) {
      return NextResponse.json(
        { error: "Amount does not match quote deposit" },
        { status: 400 }
      );
    }

    const result = await initiatePayNowPayment({
      reference: quoteId,
      amount,
      email: email || "customer@winsay.co.zw",
      description: `Solar payment - Quote ${quoteId}`,
    });

    if (result.status === "error") {
      return NextResponse.json(
        { error: result.error || "Payment initiation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.browserurl,
      pollurl: result.pollurl,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
