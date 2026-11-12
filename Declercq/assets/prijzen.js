/*
  PRIJZEN EN GRENZEN VAN DE CONFIGURATOR (Metaal Declercq)
  =========================================================
  Alles wat de configurator rekent, staat in dit ene object.
  ALLE BEDRAGEN HIERONDER ZIJN VOORBEELDEN. Hier komt de echte prijstabel van Olivier.

  - Bedragen in euro, inclusief 21 % btw.
  - Maten in millimeter.
  - "basis" = vaste prijs, "perM2" = per vierkante meter deur, "perMeter" = per lopende meter.
  - Een optie verwijderen = de regel weghalen. Een optie toevoegen = een regel kopiëren en aanpassen.
  - Het id (bv. 'draai') niet wijzigen als er al bestellingen mee gebeurd zijn.
*/
window.DECLERCQ = {
  voorbeeld: true,            // true = overal "voorbeeldprijzen" tonen
  btw: 21,                    // btw-percentage dat in de prijzen zit

  /* ---------------------------------------------------------------- STALEN DEUREN */
  deur: {
    types: [
      { id: 'draai',  naam: 'Draaideur',  uitleg: 'Klassieke deur op scharnieren.',          basis: 520, perM2: 410, dubbel: true  },
      { id: 'schuif', naam: 'Schuifdeur', uitleg: 'Hangt aan een rail boven de opening.',    basis: 640, perM2: 390, dubbel: true  },
      { id: 'taats',  naam: 'Taatsdeur',  uitleg: 'Draait rond een as in vloer en plafond.', basis: 760, perM2: 430, dubbel: false }
    ],
    // breedte = totale breedte van de opening (bij dubbel: beide vleugels samen)
    grenzen: {
      enkel:  { breedteMin: 600,  breedteMax: 1200, hoogteMin: 1900, hoogteMax: 2600 },
      dubbel: { breedteMin: 1100, breedteMax: 2400, hoogteMin: 1900, hoogteMax: 2600 }
    },
    standaard: { breedte: 900, hoogte: 2150 },
    dubbelToeslag: 180,       // extra hang- en sluitwerk voor de tweede vleugel
    draairichting: [
      { id: 'links',  naam: 'Links',  uitleg: 'Scharnieren of as links, gezien vanaf de kant waar de deur opendraait.' },
      { id: 'rechts', naam: 'Rechts', uitleg: 'Scharnieren of as rechts, gezien vanaf de kant waar de deur opendraait.' }
    ],
    glas: [
      { id: 'helder',  naam: 'Helder glas',          perM2: 0,   kleur: '#cfe0e3', dekking: 0.22, ruw: 0.05 },
      { id: 'mat',     naam: 'Mat glas',             perM2: 45,  kleur: '#eef1f1', dekking: 0.82, ruw: 0.9  },
      { id: 'ribbel',  naam: 'Ribbelglas',           perM2: 85,  kleur: '#dfe8e8', dekking: 0.6,  ruw: 0.4, ribbel: true },
      { id: 'rook',    naam: 'Rookglas (grijs)',     perM2: 60,  kleur: '#3d4246', dekking: 0.62, ruw: 0.05 },
      { id: 'geen',    naam: 'Geen glas (staalplaat)', perM2: 30, plaat: true }
    ],
    // aantal vakken in de hoogte en in de breedte (per vleugel); elke extra roede kost per meter
    vakken: { hoogteMin: 1, hoogteMax: 6, breedteMin: 1, breedteMax: 3, standaardHoogte: 4, standaardBreedte: 1 },
    roedePerMeter: 38,
    grepen: [
      { id: 'staaf40',  naam: 'Staafgreep 40 cm',   prijs: 45 },
      { id: 'staaf100', naam: 'Staafgreep 100 cm',  prijs: 85 },
      { id: 'klink',    naam: 'Klink met rozet',    prijs: 55, nietVoor: ['schuif'] },
      { id: 'kom',      naam: 'Komgreep (inbouw)',  prijs: 35 },
      { id: 'geen',     naam: 'Geen greep',         prijs: 0 }
    ]
  },

  /* ---------------------------------------------------------------- TRAPLEUNINGEN */
  leuning: {
    modellen: [
      { id: 'rond',       naam: 'Muurleuning rond',     uitleg: 'Ronde buis Ø 42 mm op muursteunen.',      basis: 95,  perMeter: 68,  soort: 'muur' },
      { id: 'plat',       naam: 'Muurleuning plat',     uitleg: 'Platte strip 50 x 10 mm op muursteunen.', basis: 95,  perMeter: 74,  soort: 'muur' },
      { id: 'spijlen',    naam: 'Balustrade spijlen',   uitleg: 'Verticale spijlen met handlijst.',        basis: 220, perMeter: 245, soort: 'balustrade' },
      { id: 'horizontaal',naam: 'Balustrade staven',    uitleg: 'Vijf horizontale staven met handlijst.',  basis: 220, perMeter: 215, soort: 'balustrade' }
    ],
    // lengte gemeten langs de trap (schuin), zie de meetgids
    grenzen: { lengteMin: 1000, lengteMax: 6000 },
    standaard: { lengte: 3200 },
    lak: [
      { id: 'mat',      naam: 'Poedercoating mat',            factor: 1.00, glans: 0.85 },
      { id: 'structuur',naam: 'Structuurlak (fijn)',          factor: 1.06, glans: 0.95 },
      { id: 'zijde',    naam: 'Poedercoating zijdeglans',     factor: 1.04, glans: 0.45 },
      { id: 'buiten',   naam: 'Gemetalliseerd + lak (buiten)',factor: 1.22, glans: 0.8  }
    ],
    // bevestiging: welke opties bij welk soort model, prijs per steun of post
    bevestiging: [
      { id: 'muursteun',  naam: 'Muursteunen',             voor: 'muur',       perStuk: 14, afstand: 900 },
      { id: 'verdekt',    naam: 'Verdekte muursteunen',    voor: 'muur',       perStuk: 26, afstand: 900 },
      { id: 'bovenop',    naam: 'Bovenop de treden',       voor: 'balustrade', perStuk: 32, afstand: 1000 },
      { id: 'zijkant',    naam: 'Tegen de zijkant van de trap', voor: 'balustrade', perStuk: 44, afstand: 1000 }
    ],
    richting: [
      { id: 'rechts', naam: 'Rechtsopgaand', uitleg: 'Onderaan de trap staand loopt de trap naar rechts omhoog.' },
      { id: 'links',  naam: 'Linksopgaand',  uitleg: 'Onderaan de trap staand loopt de trap naar links omhoog.' }
    ],
    extras: [
      { id: 'eindkappen', naam: 'Gebogen eindstukken naar de muur', prijs: 48 },
      { id: 'overloop',   naam: 'Horizontaal stuk bovenaan (50 cm)', prijs: 75 },
      { id: 'montageset', naam: 'Montageset (pluggen en schroeven)', prijs: 18 },
      { id: 'reserve',    naam: 'Spuitbus in dezelfde kleur',        prijs: 22 }
    ]
  },

  /* ---------------------------------------------------------------- KLEUREN (voor beide) */
  kleuren: [
    { id: '9005', naam: 'Gitzwart',      ral: 'RAL 9005', hex: '#17181a', toeslag: 0 },
    { id: '7021', naam: 'Zwartgrijs',    ral: 'RAL 7021', hex: '#2c3033', toeslag: 0 },
    { id: '7016', naam: 'Antraciet',     ral: 'RAL 7016', hex: '#383e42', toeslag: 0 },
    { id: '9010', naam: 'Zuiver wit',    ral: 'RAL 9010', hex: '#f1ede1', toeslag: 0 },
    { id: 'db703',naam: 'IJzerglimmer',  ral: 'DB 703',   hex: '#4e5152', toeslag: 60 },
    { id: 'brons',naam: 'Brons',         ral: 'Metallic', hex: '#5a4a3a', toeslag: 90 }
  ],

  /* ---------------------------------------------------------------- LEVERING */
  // pakket: 'deur' = deurpakket, 'kort' = leuning tot en met 3 m, 'lang' = leuning langer dan 3 m
  levering: {
    zones: [
      { id: 'be',  naam: 'België',                        deur: 95,  kort: 45, lang: 75 },
      { id: 'nl',  naam: 'Nederland',                     deur: 145, kort: 65, lang: 110 },
      { id: 'fr',  naam: 'Noord-Frankrijk (Hauts-de-France)', deur: 125, kort: 55, lang: 95 },
      { id: 'lu',  naam: 'Luxemburg',                     deur: 135, kort: 60, lang: 105 },
      { id: 'af',  naam: 'Afhalen in Dottenijs',          deur: 0,   kort: 0,  lang: 0 }
    ],
    langVanaf: 3000,
    levertermijn: '4 tot 6 weken'
  }
};
