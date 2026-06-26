import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AMENITIES, CONTRIB_POINTS, amenityDef } from "@/lib/gamify";
import { isBot, LIMITS, looksSpammy } from "@/lib/antispam";
import {
  addContribution,
  contributionsByLocation,
  countContributionsSince,
  getUserById,
  hasAmenityContribution,
} from "@/lib/store";

// GET /api/place-info?slug=... → agregované vybavení + tipy od komunity
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Chybí slug." }, { status: 400 });

  const contribs = await contributionsByLocation(slug);
  const amenities = AMENITIES.map((a) => ({
    ...a,
    count: contribs.filter((c) => c.kind === "amenity" && c.amenity === a.id).length,
  })).filter((a) => a.count > 0);
  const tips = contribs
    .filter((c) => c.kind === "tip")
    .map((c) => ({ nick: c.nick, text: c.text, createdAt: c.createdAt }));

  return NextResponse.json({ amenities, tips });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Pro přidání informace se přihlas." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  if (isBot(body)) return NextResponse.json({ error: "Detekován spam." }, { status: 400 });

  const slug = String(body.slug ?? "").trim();
  const kind = body.kind === "tip" ? "tip" : "amenity";
  if (!slug) return NextResponse.json({ error: "Chybí lokalita." }, { status: 400 });

  // Limit příspěvků za hodinu
  if ((await countContributionsSince(user.id, 3600_000)) >= LIMITS.contributionsPerHour) {
    return NextResponse.json({ error: "Příliš mnoho příspěvků za krátkou dobu. Zkus to za chvíli." }, { status: 429 });
  }

  let points: number;
  let amenity: string | undefined;
  let text: string | undefined;

  if (kind === "amenity") {
    amenity = String(body.amenity ?? "");
    if (!amenityDef(amenity)) return NextResponse.json({ error: "Neznámé vybavení." }, { status: 400 });
    // Zákaz farmení bodů: stejné vybavení může uživatel potvrdit jen jednou.
    if (await hasAmenityContribution(user.id, slug, amenity)) {
      return NextResponse.json({ error: "Tohle vybavení už jsi tu potvrdil." }, { status: 409 });
    }
    points = CONTRIB_POINTS.amenity;
  } else {
    text = String(body.text ?? "").trim().slice(0, 500);
    if (text.length < LIMITS.minTipLength) return NextResponse.json({ error: "Napiš aspoň pár slov." }, { status: 400 });
    if (looksSpammy(text)) return NextResponse.json({ error: "Text vypadá jako spam (odkazy)." }, { status: 400 });
    points = CONTRIB_POINTS.tip;
  }

  await addContribution(
    { locationSlug: slug, userId: user.id, nick: user.nick, kind, amenity, text },
    points,
  );

  const updated = await getUserById(user.id);
  return NextResponse.json({ ok: true, earned: points, points: updated?.points ?? 0 });
}
