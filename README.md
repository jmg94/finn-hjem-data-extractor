# Finn.no & Hjem.no Data Extractor

Chrome/Brave-utvidelse som kopierer eiendomsdata fra Finn.no og Hjem.no til utklippstavlen, klar til å limes inn i Excel.

## Installering

1. Åpne `chrome://extensions` (eller `brave://extensions`)
2. Slå på **Utviklermodus** (øverst til høyre)
3. Klikk **Last inn upakket utvidelse**
4. Velg mappen `Finn_Hjem_eiendom_data_extension v2`

## Bruk

1. Gå til en eiendomsannonse på Finn.no eller Hjem.no
2. Klikk den blå (Finn) eller oransje (Hjem) sirkelknappen nederst til høyre
3. Dataen kopieres til utklippstavlen som tab-separerte verdier
4. Lim inn i Excel med `Ctrl+V` — feltene havner i riktige kolonner

## Felter som hentes (30 stk)

| # | Felt | Excel-kolonne |
|---|------|---------------|
| 1 | Link | BC |
| 2 | Tittel | BD |
| 3 | Adresse | BE |
| 4-10 | Prisantydning, Totalpris, Omkostninger, Fellesgjeld, Felleskostnader, Kommunale avgifter, Eiendomsskatt | BF-BL |
| 11-22 | Boligtype, Eieform, Soverom, Intern bruksareal, Bruksareal, Eksternt bruksareal, Etasje, Byggeår, Energimerking, Rom, Tomteareal, Fellekost beskrivelse | BM-BX |
| 23-25 | Visning, Sist endret, Info hentet | BY-CA |
| 26-30 | Kommunenr, Gårdsnr, Bruksnr, Seksjonsnr, Megler | CB-CF |

Se `Eiendom Bergen_template.xlsx` for eksempel på Excel-oppsett.
