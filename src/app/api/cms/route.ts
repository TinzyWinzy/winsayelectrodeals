import { NextResponse } from "next/server";
import { getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, getSiteContent, updateSiteContent, getBrands, createBrand, updateBrand, deleteBrand, getSiteSettings, updateSiteSetting } from "@/lib/cms-db";
import { getAdminUser, unauthorizedResponse } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await getAdminUser("MARKETING");
  if (!admin) return unauthorizedResponse();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "hero";

  try {
    let data;
    switch (type) {
      case "hero": data = await getHeroSlides(); break;
      case "testimonials": data = await getTestimonials(); break;
      case "content": data = await getSiteContent(); break;
      case "brands": data = await getBrands(); break;
      case "settings": data = await getSiteSettings(); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser("MARKETING");
  if (!admin) return unauthorizedResponse();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "hero";
  const body = await request.json();

  try {
    let id: string | null = null;
    switch (type) {
      case "hero": id = await createHeroSlide(body); break;
      case "testimonials": id = await createTestimonial(body); break;
      case "brands": id = await createBrand(body); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const admin = await getAdminUser("MARKETING");
  if (!admin) return unauthorizedResponse();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "hero";
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await request.json();

  try {
    switch (type) {
      case "hero": await updateHeroSlide(id, body); break;
      case "testimonials": await updateTestimonial(id, body); break;
      case "content": await updateSiteContent(id, body); break;
      case "brands": await updateBrand(id, body); break;
      case "settings": await updateSiteSetting(id, body.value); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await getAdminUser("MANAGER");
  if (!admin) return unauthorizedResponse();

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "hero";
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    switch (type) {
      case "hero": await deleteHeroSlide(id); break;
      case "testimonials": await deleteTestimonial(id); break;
      case "brands": await deleteBrand(id); break;
      default: return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
