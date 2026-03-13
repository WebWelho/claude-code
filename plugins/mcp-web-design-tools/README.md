# MCP Web Design Tools

MCP-palvelimet verkkosivujen suunnitteluun, tuottavuuteen ja automaatioihin.

## Sisaltyvat MCP-palvelimet

### Notion (`@notionhq/notion-mcp-server`)
Notion-sivujen, tietokantojen ja tehtavien hallinta suoraan Claudesta.
- Sivujen luonti, muokkaus ja haku
- Tietokantojen kyselyt (Data Sources API v2)
- Tehtavien ja projektien hallinta
- Kommentit ja lohkojen hallinta

**Vaatii:** `NOTION_API_KEY` - [Luo integraatio Notion Developer -portaalissa](https://www.notion.so/my-integrations)

### Figma (`figma-developer-mcp`)
Figma-designtiedostojen lukeminen ja analysointi (Framelink Community Server).
- Tiedostojen ja komponenttien haku
- Layout- ja tyylitietojen poiminta
- Design-to-code -tyonkulut
- Yksinkertaistaa Figma-dataa ennen mallille syottoa

**Vaatii:** `FIGMA_ACCESS_TOKEN` - [Luo Personal Access Token Figman asetuksissa](https://www.figma.com/developers/api#access-tokens)

### Playwright (`@playwright/mcp`)
Microsoftin Playwright-pohjainen selainautomaatio (28k+ GitHub-tahtea).
- Verkkosivujen navigointi ja kuvakaappaukset
- Klikkaukset, lomakkeiden taytto, vuorovaikutus
- Accessibility snapshot -pohjainen elementtien tunnistus
- Tuki Chromium, Firefox ja WebKit -selaimille
- Mukautetun Playwright-koodin suoritus

**Ei vaadi API-avainta** - toimii paikallisesti.

### GitHub (`@modelcontextprotocol/server-github`)
GitHub-repojen, PR:ien ja issueiden hallinta.
- Koodihaku ja tiedostojen selaus
- Pull requestien ja issueiden kasittely
- Repojen hallinta

**Vaatii:** `GITHUB_TOKEN` - [Luo Personal Access Token](https://github.com/settings/tokens)

### Filesystem (`@modelcontextprotocol/server-filesystem`)
Turvallinen tiedostojärjestelmän käyttö sallituissa hakemistoissa.
- Tiedostojen luku ja kirjoitus
- Hakemistojen selaus
- Rajattu sallittuihin polkuihin

**Ei vaadi API-avainta.**

### Vercel (`@open-mcp/vercel`)
Vercel-projektien, deploymenttien ja domainien hallinta.
- Projektien listaus ja hallinta
- Deploymenttien tila ja uudelleendeployaus
- Domainien ja ymparistomuuttujien hallinta
- Logien tarkastelu

**Vaatii:** `VERCEL_TOKEN` - [Luo token Vercelin asetuksissa](https://vercel.com/account/tokens)

### Next.js DevTools (`next-devtools-mcp`)
Next.js-kehitystyokalut koodausagenteille.
- Reittien ja komponenttien tarkastelu
- Next.js-konfiguraation analysointi
- Kehityspalvelimen integraatio (Next.js 16+ sisaltaa MCP:n oletuksena)

**Ei vaadi API-avainta** - toimii paikallisesti kehityspalvelimen kanssa.

## Asennus

1. Aseta tarvittavat ymparistomuuttujat:

```bash
export NOTION_API_KEY="ntn_xxxxxxxxxxxx"
export FIGMA_ACCESS_TOKEN="figd_xxxxxxxxxxxx"
export GITHUB_TOKEN="ghp_xxxxxxxxxxxx"
export VERCEL_TOKEN="xxxxxxxxxxxx"
```

2. Plugin aktivoituu automaattisesti kun se on marketplace.json:ssa.

3. Tarkista palvelimien tila: `/mcp`

## Kayttoesimerkkeja

- "Hae Notionista kaikki avoimet tehtavat"
- "Ota kuvakaappaus sivusta https://example.com mobiili- ja desktop-koossa"
- "Analysoi Figma-tiedoston komponenttirakenne ja luo React-komponentit"
- "Luo uusi GitHub issue bugiraportille"
- "Listaa projektin tiedostot ja etsi konfiguraatiot"
- "Nayta Vercelin viimeisimmat deploymentit ja niiden tila"
- "Tarkista Next.js-projektin reittirakenne"

## Lisapalvelimia harkittavaksi

Naita voi lisata `.mcp.json`-tiedostoon tarpeen mukaan:

| Palvelin | Paketti | Kayttotarkoitus |
|----------|---------|-----------------|
| PostgreSQL | `@modelcontextprotocol/server-postgres` | Tietokantakyselyt |
| Slack | Slack MCP | Viestinta ja ilmoitukset |
| Stripe | Stripe MCP | Maksut ja tilaukset |
| Firecrawl | `firecrawl` MCP | Web scraping |
| Chrome DevTools | `chrome-devtools-mcp` | Selaimen debuggaus |
