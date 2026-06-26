// Vygeneruje optimalizované ikony a OG náhled z dodaných originálů.
// Spuštění: node scripts/gen-assets.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const ICON_SRC = join(root, "ico.png"); // čtvercová značka (pin)
const SQUARE_SRC = join(root, "čtvercové.png"); // čtvercové logo s textem
const LOGO_SRC = join(root, "logo (2).png"); // vodorovné logo

async function run() {
  // Ikona záložky (Next konvence app/icon.png) – ostrá, malá
  await sharp(ICON_SRC).resize(256, 256, { fit: "contain", background: "#ffffff" }).png({ quality: 90 }).toFile(join(root, "app", "icon.png"));
  // Apple touch icon
  await sharp(ICON_SRC).resize(180, 180, { fit: "contain", background: "#ffffff" }).png({ quality: 90 }).toFile(join(root, "app", "apple-icon.png"));
  // PWA ikony do public
  await sharp(ICON_SRC).resize(192, 192, { fit: "contain", background: "#ffffff" }).png().toFile(join(root, "public", "icon-192.png"));
  await sharp(ICON_SRC).resize(512, 512, { fit: "contain", background: "#ffffff" }).png().toFile(join(root, "public", "icon-512.png"));
  await sharp(ICON_SRC).resize(512, 512, { fit: "contain", background: "#ffffff" }).png().toFile(join(root, "public", "icon.png"));

  // OG / náhled při sdílení 1200×630 (čtvercové logo vycentrované na bílé)
  const og = sharp({ create: { width: 1200, height: 630, channels: 4, background: "#ffffff" } });
  const sq = await sharp(SQUARE_SRC).resize(560, 560, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  await og.composite([{ input: sq, gravity: "center" }]).png({ quality: 90 }).toFile(join(root, "app", "opengraph-image.png"));
  await sharp(join(root, "app", "opengraph-image.png")).toFile(join(root, "app", "twitter-image.png"));

  // Logo do hlavičky – zmenšit šířku, zachovat poměr
  await sharp(LOGO_SRC).resize({ width: 520 }).png({ quality: 90 }).toFile(join(root, "public", "logo.png"));

  console.log("Hotovo: ikony, apple-icon, PWA ikony, OG náhled a logo vygenerovány.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
