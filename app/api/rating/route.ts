import { NextResponse } from "next/server";
import { ipHash } from "@/lib/ip";
import { addRating, getRating } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Chybí slug." }, { status: 400 });
  const r = await getRating(slug, ipHash(req));
  return NextResponse.json(r);
}

export async function POST(req: Request) {
  let body: { slug?: string; value?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }
  const slug = String(body.slug ?? "");
  const value = Number(body.value);
  if (!slug || !(value >= 1 && value <= 5)) {
    return NextResponse.json({ error: "Neplatné hodnocení." }, { status: 400 });
  }
  await addRating(slug, ipHash(req), value);
  const r = await getRating(slug, ipHash(req));
  return NextResponse.json({ ok: true, ...r });
}
