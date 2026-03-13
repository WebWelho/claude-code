# MCP Web Design Tools

MCP-palvelimet verkkosivujen suunnitteluun, tuottavuuteen ja automaatioihin.

## Sisältyvat MCP-palvelimet

### Notion
Notion-sivujen, tietokantojen ja tehtavien hallinta suoraan Claudesta.
- Sivujen luonti, muokkaus ja haku
- Tietokantojen kyselyt
- Tehtavien ja projektien hallinta

**Vaatii:** `NOTION_API_KEY` - [Luo integraatio Notion Developer -portaalissa](https://www.notion.so/my-integrations)

### Figma
Figma-designtiedostojen lukeminen ja analysointi.
- Tiedostojen ja komponenttien haku
- Design tokenien ja tyylien poiminta
- Asettelujen ja elementtien tarkastelu

**Vaatii:** `FIGMA_ACCESS_TOKEN` - [Luo token Figman asetuksissa](https://www.figma.com/developers/api#access-tokens)

### Puppeteer
Selainautomaatio ja kuvakaappaukset.
- Verkkosivujen kuvakaappaukset
- DOM-elementtien tarkastelu
- Lomakkeiden taytto ja klikkaukset
- Responsiivisen suunnittelun testaus

**Ei vaadi API-avainta** - toimii paikallisesti.

### Context7
Ajantasainen dokumentaatio kirjastoille ja frameworkeille.
- Hakee tuoreimmat dokumentit npm-paketeille
- React, Next.js, Tailwind, jne.
- Ei vanhentuneita API-viittauksia

**Ei vaadi API-avainta.**

### Sequential Thinking
Strukturoitu ongelmanratkaisu monimutkaisiin tehtaviin.
- Vaiheittainen ajattelu
- Arkkitehtuuripaatokset
- Monimutkaisten ongelmien purkaminen

**Ei vaadi API-avainta.**

## Asennus

1. Aseta tarvittavat ymparistomuuttujat:

```bash
export NOTION_API_KEY="ntn_xxxxxxxxxxxx"
export FIGMA_ACCESS_TOKEN="figd_xxxxxxxxxxxx"
```

2. Plugin aktivoituu automaattisesti kun se on marketplace.json:ssa.

3. Tarkista palvelimien tila: `/mcp`

## Kayttoesimerkkeja

- "Hae Notionista kaikki avoimet tehtavat"
- "Ota kuvakaappaus sivusta https://example.com"
- "Analysoi Figma-tiedoston komponenttirakenne"
- "Hae Tailwind CSS:n dokumentaatio grid-layoutille"
- "Mieti vaiheittain, miten toteuttaa kayttajien autentikointi"
