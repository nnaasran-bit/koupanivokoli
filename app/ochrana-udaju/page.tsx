import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů a souhlas (GDPR)",
  description:
    "Jak Koupání v okolí zpracovává osobní údaje podle GDPR: jaké údaje sbíráme, proč, jak dlouho, souhlas se zasíláním obchodních sdělení a tvá práva.",
  alternates: { canonical: "/ochrana-udaju" },
};

export default function OchranaUdajuPage() {
  return (
    <ContentLayout>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Ochrana osobních údajů a souhlas
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Zásady zpracování osobních údajů (GDPR) · Poslední aktualizace: {new Date().toLocaleDateString("cs-CZ")}
      </p>

      <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-base font-bold text-slate-900">1. Správce údajů</h2>
          <p>
            Správcem osobních údajů je provozovatel služby {SITE_NAME} (kontakt:{" "}
            <a href="mailto:info@koupanivokoli.cz" className="text-brand hover:underline">info@koupanivokoli.cz</a>).
            Zpracováváme jen údaje nezbytné pro fungování služby.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">2. Jaké údaje zpracováváme</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Registrace:</strong> přezdívka, e-mail a heslo (ukládáme jen zabezpečený otisk hesla).</li>
            <li><strong>Komunitní obsah:</strong> tvá hlášení, tipy, návrhy míst, případně fotografie a poloha, kterou dobrovolně přidáš.</li>
            <li><strong>Provozní údaje:</strong> přihlašovací relace (cookie) a základní technické logy.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">3. Účel a právní základ</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Provoz účtu a komunitních funkcí</strong> – plnění služby (čl. 6 odst. 1 písm. b GDPR).</li>
            <li><strong>Zasílání novinek a obchodních sdělení</strong> – pouze na základě tvého <strong>souhlasu</strong> (čl. 6 odst. 1 písm. a GDPR), který udělíš při registraci a můžeš ho kdykoli odvolat.</li>
            <li><strong>Zabezpečení a prevence zneužití</strong> – oprávněný zájem (čl. 6 odst. 1 písm. f GDPR).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">4. Souhlas se zasíláním zpráv</h2>
          <p>
            Při registraci můžeš udělit samostatný, dobrovolný souhlas se zasíláním novinek, tipů a
            obchodních sdělení (např. o nových funkcích, partnerech či vybavení k vodě) e-mailem nebo
            formou zpráv ze serveru. Tento souhlas <strong>není podmínkou</strong> používání služby a
            můžeš ho kdykoli odvolat – v každém e-mailu (odkaz pro odhlášení) nebo napsáním na náš
            kontaktní e-mail. Odvoláním souhlasu není dotčena zákonnost předchozího zpracování.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">5. Doba uložení</h2>
          <p>
            Údaje uchováváme po dobu existence účtu. Po jeho zrušení je smažeme nebo anonymizujeme,
            s výjimkou údajů, které musíme uchovat ze zákona. Zamítnutý komunitní obsah a fotografie
            mažeme v krátké lhůtě.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">6. Příjemci a zpracovatelé</h2>
          <p>
            Pro provoz využíváme poskytovatele hostingu a databáze (Vercel, Neon). Údaje nepředáváme
            třetím stranám pro jejich marketing. Fotografie procházejí kontrolou; nezveřejňujeme
            podobu osob ani SPZ bez souhlasu.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">7. Tvá práva</h2>
          <p>
            Máš právo na přístup k údajům, jejich opravu, výmaz, omezení zpracování, přenositelnost,
            vznesení námitky a odvolání souhlasu. Můžeš též podat stížnost u Úřadu pro ochranu
            osobních údajů (uoou.gov.cz). Žádosti vyřizujeme na kontaktním e-mailu.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">8. Cookies</h2>
          <p>
            Používáme nezbytné cookie pro přihlášení. Analytické či marketingové cookie nasazujeme
            jen s tvým souhlasem.
          </p>
        </section>

        <p className="text-xs text-slate-400">
          Tento dokument je vzorový a doporučujeme jej před ostrým provozem nechat zkontrolovat
          právníkem či pověřencem pro ochranu osobních údajů.
        </p>
      </div>
    </ContentLayout>
  );
}
