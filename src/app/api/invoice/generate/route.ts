import { NextResponse } from "next/server";
import { getQuoteByQuoteId, getPackageById } from "@/lib/db";
import { formatUsd } from "@/lib/utils";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 32);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quoteId");

    if (!quoteId || !/^[a-zA-Z0-9_-]+$/.test(quoteId)) {
      return NextResponse.json(
        { error: "Invalid quoteId parameter" },
        { status: 400 }
      );
    }

    const quote = await getQuoteByQuoteId(quoteId);
    if (!quote) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      );
    }

    const pkg = await getPackageById(quote.packageId);

    const safeQuoteId = escapeHtml(quoteId);
    const safePkgName = escapeHtml(pkg?.name || "Solar Package");
    const safeStatus = escapeHtml(quote.status);
    const dateStr = new Date(quote.createdAt).toLocaleDateString();

    const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${safeQuoteId}</title>
  <style>
    body {
      font-family: 'Inter', Arial, sans-serif;
      margin: 40px;
      color: #020066;
    }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { font-size: 24px; margin: 0; }
    .header p { color: #6b7280; margin: 4px 0; }
    .details { margin-bottom: 30px; }
    .details table { width: 100%; }
    .details td { padding: 4px 0; font-size: 14px; }
    .details td:last-child { text-align: right; }
    .items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items th { background: #020066; color: white; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
    .items td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .items td:last-child { text-align: right; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>WINSAY ELECTRODEALS</h1>
    <p>Solar Instant Quote - Invoice</p>
    <p>Quote ID: ${safeQuoteId}</p>
  </div>

  <div class="details">
    <table>
      <tr><td>Quote ID</td><td><strong>${safeQuoteId}</strong></td></tr>
      <tr><td>Date</td><td>${dateStr}</td></tr>
      <tr><td>Status</td><td>${safeStatus}</td></tr>
    </table>
  </div>

  <table class="items">
    <tr>
      <th>Description</th>
      <th>Amount (USD)</th>
    </tr>
    <tr>
      <td>${safePkgName} (${pkg?.kvaRating || ""} kVA)</td>
      <td>${formatUsd(quote.totalUsd)}</td>
    </tr>
    <tr>
      <td><strong>Deposit Due</strong></td>
      <td><strong>${formatUsd(quote.depositUsd)}</strong></td>
    </tr>
  </table>

  <div class="total">
    Total: ${formatUsd(quote.totalUsd)}
  </div>

  <div class="footer">
    <p>Winsay Electrodeals | Harare, Zimbabwe</p>
    <p>Thank you for choosing solar energy!</p>
  </div>
</body>
</html>`;

    const safeFilename = sanitizeFilename(quoteId);

    return new NextResponse(invoiceHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="invoice-${safeFilename}.html"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
