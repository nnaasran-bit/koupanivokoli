import type { Metadata } from "next";
import ContentLayout from "@/components/ContentLayout";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Podmínky použití",
  description: "Podmínky použití služby Koupání v okolí – pravidla, odpovědnost a komunitní obsah.",
  alternates: { canonical: "/podminky" },
};

export default function PodminkyPage() {
  return (
    <ContentLayout>
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Podmínky použití</h1>
      <p className="mt-2 text-sm text-slate-500">Poslední aktualizace: {new Date().toLocaleDateString("cs-CZ")}</p>

      <div className="prose-sm mt-6 space-y-5 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-base font-bold text-slate-900">1. O službě</h2>
          <p>
            {SITE_NAME} (dále „služba“) je informační webová aplikace zobrazující místa ke koupání v
            České republice spolu s orientačními údaji o kvalitě vody, přístupu a rizicích. Služba je
            poskytována zdarma.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">2. Orientační charakter informací</h2>
          <p>
            Veškeré údaje jsou orientační. Rozhodující jsou vždy oficiální zdroje (krajské hygienické
            stanice, Státní zdravotní ústav, Ministerstvo zdravotnictví). U nesledovaných lokalit je
            koupání na vlastní riziko. Provozovatel neodpovídá za škody vzniklé v souvislosti s
            využitím informací ze služby.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">3. Zákazy a omezení</h2>
          <p>
            U míst se zákazem koupání nebo vstupu zobrazujeme pouze informaci a důvod omezení. Služba
            nenavádí k porušování zákazů a nezveřejňuje návody, jak zákaz obejít. Respektuj prosím
            zákazy vstupu, soukromé pozemky a ochranná pásma.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">4. Komunitní obsah</h2>
          <p>
            Registrovaní uživatelé mohou přidávat hlášení, tipy, návrhy nových míst a fotografie.
            Komunitní obsah je orientační, je moderován a nikdy nemění oficiální kvalitu vody –
            vytváří pouze upozornění „čeká na ověření“. Zavazuješ se nevkládat nezákonný, urážlivý
            nebo zavádějící obsah ani obsah porušující práva třetích osob. Provozovatel může obsah
            bez náhrady odstranit a účet při porušení pravidel zrušit.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">5. Účet</h2>
          <p>
            Pro přidávání obsahu je nutná registrace. Odpovídáš za aktivitu pod svým účtem a za
            ochranu přihlašovacích údajů. Body, úrovně a odznaky jsou nepřenosné a bez peněžní
            hodnoty.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">6. Zdroje dat a licence</h2>
          <p>
            Kvalita vody: EEA, SZÚ, krajské hygienické stanice. Místa: © OpenStreetMap přispěvatelé
            (licence ODbL). Hranice krajů: INSPIRE (CC-BY). U převzatých údajů uvádíme zdroj.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-900">7. Změny podmínek</h2>
          <p>
            Podmínky můžeme přiměřeně měnit; o podstatných změnách budeme informovat ve službě.
            Zpracování osobních údajů upravuje samostatný dokument{" "}
            <a href="/ochrana-udaju" className="text-brand hover:underline">Ochrana osobních údajů</a>.
          </p>
        </section>

        <p className="text-xs text-slate-400">
          Tento dokument je vzorový a doporučujeme jej před ostrým provozem nechat zkontrolovat
          právníkem.
        </p>
      </div>
    </ContentLayout>
  );
}
