import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { kindDef } from "@/lib/gamify";
import { addReport, getUserById, recentReports, reportsByLocation } from "@/lib/store";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const reports = slug ? reportsByLocation(slug) : recentReports(30);
  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Pro hlášení se musíš přihlásit." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  const def = kindDef(String(body.kind ?? ""));
  if (!def) return NextResponse.json({ error: "Neznámý typ hlášení." }, { status: 400 });

  const locationName = String(body.locationName ?? "").trim();
  const newPlaceName = String(body.newPlaceName ?? "").trim();
  const locationSlug = body.locationSlug ? String(body.locationSlug) : undefined;

  if (def.isNewPlace && !newPlaceName) {
    return NextResponse.json({ error: "Zadej název nového místa." }, { status: 400 });
  }
  if (!def.isNewPlace && !locationName && !locationSlug) {
    return NextResponse.json({ error: "Uveď, kterého místa se hlášení týká." }, { status: 400 });
  }

  const report = addReport({
    userId: user.id,
    nick: user.nick,
    kind: def.id,
    points: def.points,
    locationName: locationName || undefined,
    locationSlug,
    newPlaceName: newPlaceName || undefined,
    lat: typeof body.lat === "number" ? body.lat : undefined,
    lng: typeof body.lng === "number" ? body.lng : undefined,
    text: body.text ? String(body.text).slice(0, 500) : undefined,
  });

  const updated = getUserById(user.id);
  return NextResponse.json({ report, points: updated?.points ?? 0, earned: def.points });
}
