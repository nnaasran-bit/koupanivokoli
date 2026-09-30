// Sauny a wellness u přírodní vody – přirozený doplněk k otužování (kontrastní
// koupel). Na rozdíl od otužileckých part nejde o jednotný veřejný katalog –
// ručně kurátorovaný výběr reálných, dohledatelných míst z několika zdrojů
// (kudyznudy.cz, mujaltan.cz a oficiální stránky provozovatelů, viz sourceUrl).
export interface Sauna {
  name: string;
  city: string;
  desc: string;
  sourceUrl: string;
  sourceName: string;
}

export const SAUNY: Sauna[] = [
  {
    name: "Hidden Retreat",
    city: "Lipnice nad Sázavou (lom Hranice), Vysočina",
    desc: "Plovoucí dřevěná sauna se střešní terasou na hladině zatopeného lomu.",
    sourceUrl: "https://www.kudyznudy.cz/aktuality/15-tipu-kde-si-uzit-saunu",
    sourceName: "kudyznudy.cz",
  },
  {
    name: "NUUK",
    city: "Hradec Králové",
    desc: "Soukromý klub s přírodní pojízdnou saunou se vstupem přímo do Labe.",
    sourceUrl: "https://www.kudyznudy.cz/aktuality/15-tipu-kde-si-uzit-saunu",
    sourceName: "kudyznudy.cz",
  },
  {
    name: "Sauna Spot Dvorce",
    city: "Praha (u Vltavy, Žluté lázně)",
    desc: "Saunový svět v přírodě kousek od centra, přímo u řeky.",
    sourceUrl: "https://www.kudyznudy.cz/aktuality/15-tipu-kde-si-uzit-saunu",
    sourceName: "kudyznudy.cz",
  },
  {
    name: "Horská sauna u potoka",
    city: "Jelení louky, Krkonoše",
    desc: "Horská sauna s ochlazením přímo v horském potoce z přírodního pramene.",
    sourceUrl: "https://www.kudyznudy.cz/aktuality/15-tipu-kde-si-uzit-saunu",
    sourceName: "kudyznudy.cz",
  },
  {
    name: "Infinit Maximus – Saunový svět",
    city: "Brno (Brněnská přehrada)",
    desc: "Venkovní wellness s výhledem na přehradu, 11 druhů saun a venkovní bazény.",
    sourceUrl: "https://maximus.infinit.cz/cs/saunovy-svet",
    sourceName: "maximus.infinit.cz",
  },
  {
    name: "Kayak Beach Bar",
    city: "Praha",
    desc: "Plovoucí sauna a vířivka na pontonu s výhledem na Pražský hrad.",
    sourceUrl: "https://www.kudyznudy.cz/aktuality/15-tipu-kde-si-uzit-saunu",
    sourceName: "kudyznudy.cz",
  },
  {
    name: "Sauna Kontejner",
    city: "Vysočina",
    desc: "Sauna v přestavěném přepravním kontejneru na netradičním místě v přírodě.",
    sourceUrl: "https://www.kudyznudy.cz/aktuality/15-tipu-kde-si-uzit-saunu",
    sourceName: "kudyznudy.cz",
  },
  {
    name: "Wellness vagón",
    city: "Třeboňsko",
    desc: "Přestavěný vagón z Legio vlaku s vířivkou, venkovním sudem a finskou saunou.",
    sourceUrl: "https://mujaltan.cz/magazin/nejkrasnejsi-sauny-v-cechach/",
    sourceName: "mujaltan.cz",
  },
  {
    name: "Sauna na Poděbradech",
    city: "Poděbrady, Středočeský kraj",
    desc: "Přestavěná maringotka obložená severským smrkem u jezera, ochlazení přímo v jezeře.",
    sourceUrl: "https://mujaltan.cz/magazin/nejkrasnejsi-sauny-v-cechach/",
    sourceName: "mujaltan.cz",
  },
  {
    name: "Pod šumavskou lípou",
    city: "Lešišov, Šumava",
    desc: "Srubová sauna pod korunami stromů pár kroků od průzračného rybníka.",
    sourceUrl: "https://mujaltan.cz/magazin/nejkrasnejsi-sauny-v-cechach/",
    sourceName: "mujaltan.cz",
  },
  {
    name: "Dobčické rybníčky",
    city: "Dobčice",
    desc: "Sauna na ostrůvku uprostřed rybníka, k chatkám na hladině se pluje na raftu.",
    sourceUrl: "https://mujaltan.cz/magazin/nejkrasnejsi-sauny-v-cechach/",
    sourceName: "mujaltan.cz",
  },
];
