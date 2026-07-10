import { NextResponse } from "next/server";
import { quoteSubmissionSchema } from "@/types";
import {
  createCustomer,
  getCustomerByPhone,
  createQuote,
  getPackageById,
} from "@/lib/db";
import { calculateQuotePricing } from "@/lib/pricing";
import { generateQuoteId } from "@/lib/utils";
import { getUsdToZigRate } from "@/lib/currency";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = await checkRateLimit(`quote:${ip}`, 10, 3600000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = quoteSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const pkg = await getPackageById(data.packageId);
    if (!pkg) {
      return NextResponse.json(
        { error: "Selected package not found" },
        { status: 400 }
      );
    }

    const quoteId = generateQuoteId();

    let customerId: string;
    const existing = await getCustomerByPhone(data.phone);
    if (existing) {
      customerId = existing.id;
    } else {
      customerId = await createCustomer({
        name: data.customerName,
        phone: data.phone,
        email: data.email,
        province: data.province,
        city: data.city,
        suburb: data.suburb,
      });
    }

    const zigRate = await getUsdToZigRate();
    const pricing = calculateQuotePricing({
      pkg,
      roofType: data.roofType,
      province: data.province,
      payAfterInstall: data.payAfterInstall,
      zigRate,
    });

    const docId = await createQuote({
      customerId,
      packageId: data.packageId,
      roofType: data.roofType,
      location: `${data.suburb}, ${data.city}, ${data.province}`,
      meterPhotoUrl: data.meterPhotoUrl,
      totalUsd: pricing.totalUsd,
      totalZig: pricing.totalZig,
      depositUsd: pricing.depositUsd,
      depositZig: pricing.depositZig,
      paymentMethod: data.paymentMethod,
      status: "pending",
      quoteId,
      payAfterInstall: data.payAfterInstall,
    });

    return NextResponse.json(
      { success: true, quoteId, docId, pricing },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
