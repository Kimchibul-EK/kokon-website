-- Kokon: fem faktatjekkede arbejdsposter til live Supabase.
-- Kan køres igen: eksisterende rækker opdateres ud fra slug.

insert into public.udgivelser (
  slug,
  titel,
  forfatter,
  forfatter_beskrivelse,
  forfatter_kilde,
  oversaetter,
  oversaetter_beskrivelse,
  kort_beskrivelse,
  beskrivelse,
  kontekst,
  format_og_materialer,
  isbn,
  sidetal,
  format_bind,
  sprog,
  dansk_udgivelsesaar,
  originaludgivelsesaar,
  originaltitel,
  forside_sti,
  forside_alt,
  detaljebilleder,
  anmeldelser,
  udgivelsesdato,
  status,
  fremhaevet,
  eksterne_links
) values
  ('flaskepost-fra-helvede', 'Flaskepost fra Helvede', 'Kyūsaku Yumeno', 'Sugiyama Taidō (1889–1936) valgte Yumeno Kyūsaku som forfatternavn. På den lokale dialekt i Fukuoka betød navnet en ubesindig dagdrømmer.

Han skilte sig holdningsmæssigt ud fra mange samtidige forfattere. I 1960’erne blev hans eksperimenterende fortællinger og interesse for mysterier, psykologi og lukkede rum genopdaget. Før sin debut som 37-årig arbejdede han blandt andet i hæren, som bonde, daglejer, zenmunk og journalist.', 'Forfatterplanche leveret af Kokon og kontrolleret mod Gucca', 'Steffen Kloster Poulsen', null, 'Et søskendepar lever isoleret på en øde ø, indtil deres lukkede verden møder virkeligheden udenfor.', 'Et søskendepar tilbringer ti år på en øde ø med ganske få ejendele og en lille bibel. Fortællingen følger deres isolation og den verden, de opbygger langt fra andre mennesker.

Øens interne regler og orden bryder gradvist sammen i mødet med omverdenen. Novellen undersøger menneskets psyke og de begrænsninger, som langvarig isolation kan skabe.', null, 'Omslagsgrafik af Hakkiri og omslagsillustration af Klaus Tue Madsen.', null, null, 'Hæftet', 'Dansk', null, '1928', 'Binzume No Jigoku [瓶詰の地獄]', '/assets/images/udgivelser/flaskepost-fra-helvede/flaskepost-fra-helvede-front.webp', 'Forsiden af Flaskepost fra Helvede', '[{"src":"/assets/images/udgivelser/flaskepost-fra-helvede/flaskepost-fra-helvede-author-page.webp","alt":"Blå forfatterplanche med portræt og introduktion til Yumeno Kyūsaku fotograferet blandt grønne planter"},{"src":"/assets/images/udgivelser/flaskepost-fra-helvede/flaskepost-fra-helvede-back.webp","alt":"Bagsiden af Flaskepost fra Helvede placeret blandt grønne blade"}]'::jsonb, '[]'::jsonb, null, 'udkommet', true, '[{"label":"Gucca","url":"https://www.gucca.dk/flaskepost-fra-helvede-bog-p759089"}]'::jsonb),
  ('uegnet-som-menneske', 'Uegnet som menneske', 'Osamu Dazai', 'Osamu Dazai (1909–1948) regnes blandt de mest indflydelsesrige moderne japanske forfattere. Hans tekster kombinerer menneskelig indsigt og mørk humor, og Uegnet som menneske blev hans sidste færdiggjorte roman.', 'Guccas godkendte forhandlerside', 'Mads Schanz', null, 'Ōba Yōzō skjuler sin fremmedgjorthed og angst bag humor og påtagede roller.', 'Ōba Yōzō har siden barndommen følt sig fremmed over for andre mennesker. For at skjule sin angst spiller han komiske roller og forsøger at tilpasse sig de forventninger, han møder.

Som voksen fører hans flugt gennem rusmidler, mislykkede forhold og skyldfølelse ham længere væk fra omverdenen. Romanen skildrer med mørk humor den fortvivlelse, der gemmer sig bag hans smil.', null, 'Omslagsgrafik af Hakkiri. Offsettrykt på Munken Premium Cream 100 g/m².', '9788797404423', 112, 'Indbundet', 'Dansk', 2025, '1948', 'Ningen Shikkaku [人間失格]', '/assets/images/udgivelser/uegnet-som-menneske/uegnet-som-menneske-front.webp', 'Forsiden af Uegnet som menneske', '[{"src":"/assets/images/udgivelser/uegnet-som-menneske/uegnet-som-menneske-two-covers.webp","alt":"To udgaver af Uegnet som menneske opstillet på en træflade"},{"src":"/assets/images/udgivelser/uegnet-som-menneske/uegnet-som-menneske-open-book.webp","alt":"En åben udgave af Uegnet som menneske holdt foran en strand og blå himmel"},{"src":"/assets/images/udgivelser/uegnet-som-menneske/uegnet-som-menneske-author-page.webp","alt":"Forfattersiden om Osamu Dazai fotograferet ved siden af bogens mørke omslag"}]'::jsonb, '[]'::jsonb, null, 'udkommet', false, '[{"label":"Gucca","url":"https://www.gucca.dk/uegnet-som-menneske-bog-p718650"}]'::jsonb),
  ('ti-naetters-droemme', 'Ti nætters drømme', 'Natsume Sōseki', 'Natsume Sōseki (1867–1916) er en central skikkelse i japansk litteratur. Hans romaner og noveller kombinerer ofte japanske traditioner med vestlige litterære strømninger.

Han fik sit store gennembrud i 1905–1906 med føljetonen Vi er en kat, som udkom i det litterære tidsskrift Hototogisu.', 'Forlaget Kokons officielle website', 'Steffen Kloster Poulsen', null, 'Ti poetiske drømme kredser om kærlighed, død, skæbne og tidens forgængelighed.', 'Samlingen består af ti korte, poetiske fortællinger, der hver tager form som en drøm. Fortællingerne bevæger sig mellem genkendelige situationer og billeder, som følger drømmens egen logik.

På tværs af de ti nætter undersøger Natsume Sōseki blandt andet kærlighed, død, skæbne og tidens forgængelighed.', null, 'Mørkeblåt Geltex-omslag med kobber-orange prægning. Omslagsgrafik af Hakkiri og illustration af Emma Hvidbak Grouleff.', '9788797404416', 88, 'Indbundet', 'Dansk', null, '1908', 'Yumejūya [夢十夜]', '/assets/images/udgivelser/ti-naetters-droemme/ti-naetters-droemme-front.webp', 'Forsiden af Ti nætters drømme', '[{"src":"/assets/images/udgivelser/ti-naetters-droemme/ti-naetters-droemme-illustration.webp","alt":"En illustreret side fra tredje nat i Ti nætters drømme"},{"src":"/assets/images/udgivelser/ti-naetters-droemme/ti-naetters-droemme-back.webp","alt":"Bagsiden af Ti nætters drømme med orange tekst på mørkt omslag"}]'::jsonb, '[]'::jsonb, null, 'udkommet', false, '[{"label":"Gucca","url":"https://www.gucca.dk/ti-naetters-droemme-bog-p695087"}]'::jsonb),
  ('citronen', 'Citronen', 'Motojirō Kajii', 'Motojirō Kajii (1901–1932) var en japansk forfatter fra Osaka. Han skrev tyve poetiske og intellektuelle noveller. Citronen var hans første og er fortsat hans bedst kendte fortælling.', 'Guccas godkendte forhandlerside', 'Steffen Kloster Poulsen', null, 'En kølig citron giver et kort øjebliks lettelse under en melankolsk vandring gennem Kyoto.', 'En melankolsk fortæller med alvorlig lungesygdom vandrer gennem Kyotos gader på jagt efter det livsmod, han har mistet. En kølig citron fra en frugthandler giver for en stund ro i både krop og sind.

Da han senere træder ind i sin tidligere yndlingsbutik, Maruzen, ændres stemningen igen. Novellen undersøger identitet, sindstilstand og mødet mellem Østasien og Vesten.', null, 'Omslagsgrafik og omslagsillustration af Hakkiri.', null, null, 'Hæftet', 'Dansk', 2024, '1925', 'Remon [檸檬]', '/assets/images/udgivelser/citronen/citronen-front.webp', 'Forsiden af Citronen', '[{"src":"/assets/images/udgivelser/citronen/citronen-on-wool.webp","alt":"Citronen liggende i lyst uld"},{"src":"/assets/images/udgivelser/citronen/citronen-back.webp","alt":"Bagsiden af Citronen liggende i lyst uld"},{"src":"/assets/images/udgivelser/citronen/citronen-inside-page.webp","alt":"En åben side fra Citronen med dansk brødtekst og sidenummer fem"}]'::jsonb, '[]'::jsonb, null, 'udkommet', false, '[{"label":"Gucca","url":"https://www.gucca.dk/citronen-bog-p688199"}]'::jsonb),
  ('vi-er-en-kat-del-1', 'Vi er en kat · Del 1', 'Natsume Sōseki', 'Natsume Sōseki (1867–1916) er en central skikkelse i japansk litteratur. Hans romaner kombinerer ofte japanske traditioner med vestlige litterære strømninger.

Han fik sit store gennembrud i 1905–1906 med føljetonen Vi er en kat. Det japanske wagahai i titlen er et gammeldags og selvhøjtideligt førstepersonspronomen; på dansk er det gengivet med det majestætiske “vi”.', 'Forfatterplanche leveret af Kokon og Forlaget Kokons officielle website', 'Nicolai Lerche', null, 'En navnløs og selvhøjtidelig kat betragter menneskenes forfængelighed og sære vaner.', 'En navnløs kat bor hos en skolelærer i Tokyo i begyndelsen af 1900-tallet. Fra sin særlige plads i huset betragter den menneskene omkring sig med en selvsikker og satirisk stemme.

Katten kommenterer blandt andet menneskenes dovenskab, forfængelighed og tomme tale. Første del åbner dermed Sōsekis humoristiske blik på både hverdagslivet og det moderne japanske samfund.', null, 'Omslagsgrafik af Hakkiri og omslagsillustration af Emma Hvidbak Grouleff.', '9788797404461', 32, 'Paperback', 'Dansk', 2025, '1905–1906', 'Wagahai Wa Neko De Aru [吾輩は猫である]', '/assets/images/udgivelser/vi-er-en-kat-del-1/vi-er-en-kat-del-1-front.webp', 'Forsiden af Vi er en kat, del 1', '[{"src":"/assets/images/udgivelser/vi-er-en-kat-del-1/vi-er-en-kat-del-1-on-blue-fabric.webp","alt":"Vi er en kat, del 1 liggende på blåt tekstil"},{"src":"/assets/images/udgivelser/vi-er-en-kat-del-1/vi-er-en-kat-del-1-back.webp","alt":"Bagsiden af Vi er en kat, del 1 med et uddrag fra bogen"},{"src":"/assets/images/udgivelser/vi-er-en-kat-del-1/vi-er-en-kat-del-1-author-page.webp","alt":"Rosa forfatterplanche med portræt og introduktion til Natsume Sōseki lagt på et mønstret tekstil"}]'::jsonb, '[]'::jsonb, null, 'udkommet', false, '[{"label":"Gucca","url":"https://www.gucca.dk/vi-er-en-kat-bog-p743083"}]'::jsonb)
on conflict (slug) do update set
  titel = excluded.titel,
  forfatter = excluded.forfatter,
  forfatter_beskrivelse = excluded.forfatter_beskrivelse,
  forfatter_kilde = excluded.forfatter_kilde,
  oversaetter = excluded.oversaetter,
  oversaetter_beskrivelse = excluded.oversaetter_beskrivelse,
  kort_beskrivelse = excluded.kort_beskrivelse,
  beskrivelse = excluded.beskrivelse,
  kontekst = excluded.kontekst,
  format_og_materialer = excluded.format_og_materialer,
  isbn = excluded.isbn,
  sidetal = excluded.sidetal,
  format_bind = excluded.format_bind,
  sprog = excluded.sprog,
  dansk_udgivelsesaar = excluded.dansk_udgivelsesaar,
  originaludgivelsesaar = excluded.originaludgivelsesaar,
  originaltitel = excluded.originaltitel,
  forside_sti = excluded.forside_sti,
  forside_alt = excluded.forside_alt,
  detaljebilleder = excluded.detaljebilleder,
  anmeldelser = excluded.anmeldelser,
  udgivelsesdato = excluded.udgivelsesdato,
  status = excluded.status,
  fremhaevet = excluded.fremhaevet,
  eksterne_links = excluded.eksterne_links;
