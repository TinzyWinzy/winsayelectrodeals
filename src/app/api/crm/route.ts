import { NextResponse } from "next/server";
import { getAllCustomers, getCustomerById, getCustomerNotes, createCustomerNote, getCommunicationLogs, createCommunicationLog } from "@/lib/crm-db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "customers";
  const customerId = url.searchParams.get("customerId");

  try {
    let data;
    switch (type) {
      case "customers": data = await getAllCustomers(); break;
      case "customer": if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 }); data = await getCustomerById(customerId); break;
      case "notes": if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 }); data = await getCustomerNotes(customerId); break;
      case "communications": if (!customerId) return NextResponse.json({ error: "customerId required" }, { status: 400 }); data = await getCommunicationLogs(customerId); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "note";
  const body = await request.json();

  try {
    let id: string | null = null;
    switch (type) {
      case "note": id = await createCustomerNote(body); break;
      case "communication": id = await createCommunicationLog(body); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
