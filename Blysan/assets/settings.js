/*
  ELECTRO BLYSAN – GEGEVENS DIE DE ZAAK ZELF AANPAST
  ===================================================
  Dit is de enige plek voor de bereikbaarheidsuren, werkgebied en antwoordtermijn.
  Alle pagina's lezen hieruit (startpagina, contact, offerte-aanvraag, over ons).
  Naam, adres, telefoon, e-mail en btw-nummer staan bovenaan in build.py (SITE).

  Alles hieronder is nog een VOORBEELD en moet door Electro Blysan bevestigd worden.
*/
window.EB_SETTINGS = {

  /* Uren waarop de zaak telefonisch bereikbaar is (er is geen winkel of atelier om te bezoeken), per dag: [begin, einde] in "uu:mm".
     Meerdere blokken per dag mag (bv. middagpauze). Een lege lijst [] = gesloten.
     De live melding "Nu bereikbaar / Nu niet bereikbaar" rekent met de Belgische tijd. */
  hours: {
    monday:    [["08:00", "12:00"], ["13:00", "18:00"]],
    tuesday:   [["08:00", "12:00"], ["13:00", "18:00"]],
    wednesday: [["08:00", "12:00"], ["13:00", "18:00"]],
    thursday:  [["08:00", "12:00"], ["13:00", "18:00"]],
    friday:    [["08:00", "12:00"], ["13:00", "17:00"]],
    saturday:  [["09:00", "12:00"]],
    sunday:    []
  },
  hoursAreExample: true,          // zet op false zodra de uren kloppen (het label "example" verdwijnt dan)
  hoursNote: "Site visits by appointment · not reachable on public holidays",
  hoursNote_nl: "Plaatsbezoek op afspraak · niet bereikbaar op feestdagen",

  /* Binnen hoeveel werkdagen antwoordt de zaak op een offerte-aanvraag? (null = nog niet ingevuld) */
  replyWorkingDays: null,

  /* Werkgebied. kind: "home" = thuisbasis, "sub" = deelgemeente van Wielsbeke, "" = buurgemeente.
     note = uitleg in het Engels, note_nl = in het Nederlands (voor de pagina's in nl/).
     x en y = plaats op de schematische kaart (0–520 breed, 0–420 hoog), niet op schaal. */
  serviceAreaIsExample: true,
  towns: [
    { name: "Wielsbeke",        kind: "home", x: 260, y: 210, note: "Home base – together with Sint-Baafs-Vijve and Ooigem.", note_nl: "Thuisbasis – samen met Sint-Baafs-Vijve en Ooigem." },
    { name: "Sint-Baafs-Vijve", kind: "sub",  x: 318, y: 172, note: "Part of the municipality of Wielsbeke, on the River Leie.", note_nl: "Deelgemeente van Wielsbeke, aan de Leie." },
    { name: "Ooigem",           kind: "sub",  x: 200, y: 246, note: "Part of the municipality of Wielsbeke, on the River Leie.", note_nl: "Deelgemeente van Wielsbeke, aan de Leie." },
    { name: "Oostrozebeke",     kind: "",     x: 140, y: 150, note: "Neighbouring town.", note_nl: "Buurgemeente." },
    { name: "Ingelmunster",     kind: "",     x: 92,  y: 236, note: "Neighbouring town.", note_nl: "Buurgemeente." },
    { name: "Harelbeke",        kind: "",     x: 178, y: 344, note: "Neighbouring town.", note_nl: "Buurgemeente." },
    { name: "Waregem",          kind: "",     x: 332, y: 312, note: "Neighbouring town.", note_nl: "Buurgemeente." },
    { name: "Zulte",            kind: "",     x: 420, y: 196, note: "Neighbouring town (East Flanders).", note_nl: "Buurgemeente (Oost-Vlaanderen)." },
    { name: "Dentergem",        kind: "",     x: 294, y: 74,  note: "Neighbouring town.", note_nl: "Buurgemeente." }
  ]
};
