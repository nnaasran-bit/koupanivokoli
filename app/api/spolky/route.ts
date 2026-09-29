import { NextResponse } from "next/server";
import { addSpolekSubmission, countSpolekSubmissionsSince } from "@/lib/store";
import { isBot, looksSpammy } from "@/lib/antispam";
import { ipHash } from "@/lib/ip";
import { REGIONS } from "@/lib/regions";

export const dynamic = "force-dynamic";

const MAX_PER_DAY = 3; // na IP – bez registrace musí antispam stát jinde než na účtu

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Neplatný požadavek." }, { status: 400 });
  }

  if (isBot(body)) return NextResponse.json({ error: "Detekován spam." }, { status: 400 });

  const name = String(body.name ?? "").trim().slice(0, 120);
  const city = String(body.city ?? "").trim().slice(0, 80);
  const region = String(body.region ?? "").trim();
  const schedule = String(body.schedule ?? "").trim().slice(0, 120) || undefined;
  const place = String(body.place ?? "").trim().slice(0, 160) || undefined;
  const desc = String(body.desc ?? "").trim().slice(0, 500) || undefined;
  const contact = String(body.contact ?? "").trim().slice(0, 200) || undefined;

  if (!name || !city) {
    return NextResponse.json({ error: "Vyplň aspoň název a město." }, { status: 400 });
  }
  if (!REGIONS.some((r) => r.name === region)) {
    return NextResponse.json({ error: "Vyber platný kraj." }, { status: 400 });
  }
  if (looksSpammy(desc) || looksSpammy(contact)) {
    return NextResponse.json({ error: "Text vypadá jako spam (odkazy)." }, { status: 400 });
  }

  const ip = ipHash(req);
  if ((await countSpolekSubmissionsSince(ip, 24 * 3600_000)) >= MAX_PER_DAY) {
    return NextResponse.json({ error: "Z této sítě už dnes přišlo víc návrhů. Zkus to zítra." }, { status: 429 });
  }

  const submission = await addSpolekSubmission({ name, city, region, schedule, place, desc, contact }, ip);
  return NextResponse.json({ submission });
}
