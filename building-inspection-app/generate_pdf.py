#!/usr/bin/env python3
"""Generate KuntotarkastusAI sales PDF."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table as _Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)

_DEFAULT_CELL_STYLE = None  # set after styles are defined

def Table(data, **kwargs):
    """Wrap Table so plain str cells become Paragraphs automatically."""
    global _DEFAULT_CELL_STYLE
    if _DEFAULT_CELL_STYLE is None:
        from reportlab.lib.styles import getSampleStyleSheet
        _DEFAULT_CELL_STYLE = getSampleStyleSheet()["Normal"]
        _DEFAULT_CELL_STYLE.fontSize = 9
        _DEFAULT_CELL_STYLE.leading = 13
    converted = []
    for row in data:
        new_row = []
        for cell in row:
            if isinstance(cell, str):
                cell = Paragraph(cell, _DEFAULT_CELL_STYLE)
            new_row.append(cell)
        converted.append(new_row)
    return _Table(converted, **kwargs)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── Colors ──────────────────────────────────────────────────────────────────
BRAND_BLUE   = colors.HexColor("#1E3A5F")
ACCENT_BLUE  = colors.HexColor("#2563EB")
ACCENT_GREEN = colors.HexColor("#059669")
ACCENT_RED   = colors.HexColor("#DC2626")
LIGHT_GRAY   = colors.HexColor("#F1F5F9")
MID_GRAY     = colors.HexColor("#94A3B8")
DARK_GRAY    = colors.HexColor("#334155")
WHITE        = colors.white
BLACK        = colors.black

W, H = A4
ML = 1.8*cm  # margin left
MR = 1.8*cm
MT = 2.0*cm
MB = 2.0*cm

# ── Document ─────────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    "KuntotarkastusAI_Myyntimateriaalit.pdf",
    pagesize=A4,
    leftMargin=ML, rightMargin=MR,
    topMargin=MT, bottomMargin=MB,
    title="KuntotarkastusAI – Myyntimateriaalit",
    author="KuntotarkastusAI",
)

# ── Styles ────────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

def S(name, parent="Normal", **kw):
    return ParagraphStyle(name, parent=base[parent], **kw)

cover_title   = S("cover_title",   fontSize=34, leading=42, textColor=WHITE,
                  spaceAfter=8, alignment=TA_CENTER, fontName="Helvetica-Bold")
cover_sub     = S("cover_sub",     fontSize=14, leading=20, textColor=colors.HexColor("#BFD7FF"),
                  spaceAfter=4, alignment=TA_CENTER)
cover_tagline = S("cover_tagline", fontSize=11, leading=16, textColor=colors.HexColor("#E2F0FF"),
                  alignment=TA_CENTER)

h1  = S("h1",  fontSize=18, leading=24, textColor=WHITE, fontName="Helvetica-Bold",
        spaceBefore=0, spaceAfter=6, alignment=TA_LEFT)
h2  = S("h2",  fontSize=13, leading=18, textColor=BRAND_BLUE, fontName="Helvetica-Bold",
        spaceBefore=14, spaceAfter=4)
h3  = S("h3",  fontSize=11, leading=15, textColor=ACCENT_BLUE, fontName="Helvetica-Bold",
        spaceBefore=10, spaceAfter=3)
body = S("body", fontSize=9.5, leading=14, textColor=DARK_GRAY, spaceAfter=5)
body_sm = S("body_sm", fontSize=8.5, leading=13, textColor=DARK_GRAY, spaceAfter=4)
bullet = S("bullet", fontSize=9.5, leading=14, textColor=DARK_GRAY,
           leftIndent=12, firstLineIndent=-10, spaceAfter=3)
quote  = S("quote", fontSize=10, leading=15, textColor=BRAND_BLUE,
            leftIndent=18, rightIndent=18, spaceBefore=6, spaceAfter=6,
            fontName="Helvetica-Oblique")
label  = S("label", fontSize=8, leading=10, textColor=MID_GRAY, spaceAfter=1)
section_num = S("section_num", fontSize=9, leading=12, textColor=MID_GRAY,
                fontName="Helvetica-Bold", spaceAfter=2)

story = []

# ══════════════════════════════════════════════════════════════════════════════
# COVER PAGE
# ══════════════════════════════════════════════════════════════════════════════
def cover_bg(canvas, doc):
    """Draw cover background only on page 1."""
    canvas.saveState()
    if doc.page == 1:
        # Full-page gradient-ish background
        canvas.setFillColor(BRAND_BLUE)
        canvas.rect(0, 0, W, H, fill=1, stroke=0)
        # Decorative bottom band
        canvas.setFillColor(ACCENT_BLUE)
        canvas.rect(0, 0, W, 3.5*cm, fill=1, stroke=0)
        # Top stripe
        canvas.setFillColor(colors.HexColor("#162D4A"))
        canvas.rect(0, H-2*cm, W, 2*cm, fill=1, stroke=0)
    canvas.restoreState()


def later_pages(canvas, doc):
    """Header + footer for pages 2+."""
    canvas.saveState()
    # Header bar
    canvas.setFillColor(BRAND_BLUE)
    canvas.rect(0, H-1.5*cm, W, 1.5*cm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(ML, H-1.0*cm, "KuntotarkastusAI")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(W-MR, H-1.0*cm, "Myyntimateriaalit 2026")
    # Footer
    canvas.setFillColor(LIGHT_GRAY)
    canvas.rect(0, 0, W, 1.1*cm, fill=1, stroke=0)
    canvas.setFillColor(MID_GRAY)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(ML, 0.4*cm, "Luottamuksellinen — vain sisäiseen käyttöön")
    canvas.drawRightString(W-MR, 0.4*cm, f"Sivu {doc.page}")
    canvas.restoreState()


# Cover content (will render on a page with cover_bg template)
story.append(Spacer(1, 3.5*cm))
story.append(Paragraph("KuntotarkastusAI", cover_title))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph("Myyntimateriaalit 2026", cover_sub))
story.append(Spacer(1, 0.6*cm))
story.append(Paragraph(
    "Tarkastus kentällä. Raportti valmiina ennen kuin istut autoon.",
    cover_tagline
))
story.append(Spacer(1, 5.5*cm))

# Cover summary box
cover_items = [
    ["1", "Arvolupaus & One-liner"],
    ["2", "One-pager myyntisivu"],
    ["3", "Kylmäsähköpostiketju"],
    ["4", "LinkedIn-viestit & postaukset"],
    ["5", "Myyntipuhelinskripti"],
    ["6", "Demo-skripti (15 min)"],
    ["7", "Hinnoittelustrategia"],
    ["8", "Kohdeyleisö & segmentit"],
    ["9", "Kilpailuedut"],
    ["10", "FAQ myyntitilanteeseen"],
    ["11", "Mittarit & seuranta"],
]
cover_tbl = Table(
    cover_items,
    colWidths=[1.2*cm, 14*cm],
    rowHeights=[0.62*cm]*len(cover_items)
)
cover_tbl.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), colors.HexColor("#162D4A")),
    ("TEXTCOLOR",    (0,0), (0,-1),  ACCENT_BLUE),
    ("TEXTCOLOR",    (1,0), (1,-1),  WHITE),
    ("FONTNAME",     (0,0), (0,-1),  "Helvetica-Bold"),
    ("FONTNAME",     (1,0), (1,-1),  "Helvetica"),
    ("FONTSIZE",     (0,0), (-1,-1), 10),
    ("ALIGN",        (0,0), (0,-1),  "CENTER"),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING",  (0,0), (-1,-1), 10),
    ("RIGHTPADDING", (0,0), (-1,-1), 10),
    ("ROWBACKGROUNDS", (0,0), (-1,-1),
     [colors.HexColor("#162D4A"), colors.HexColor("#1A3560")]),
    ("LINEBELOW",    (0,0), (-1,-2), 0.3, colors.HexColor("#2A4A7A")),
]))
story.append(cover_tbl)
story.append(PageBreak())


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def section_header(num, title):
    """Blue banner with section number + title."""
    tbl = Table(
        [[Paragraph(f"#{num}", ParagraphStyle("sn", fontSize=11, textColor=ACCENT_BLUE,
                    fontName="Helvetica-Bold", leading=14)),
          Paragraph(title, h1)]],
        colWidths=[1.4*cm, None],
        rowHeights=[1.0*cm]
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BRAND_BLUE),
        ("VALIGN",     (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING",(0,0), (-1,-1), 12),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING",(0,0),(-1,-1),0),
        ("ROUNDEDCORNERS", [4]),
    ]))
    story.append(KeepTogether([tbl, Spacer(1, 0.4*cm)]))

def B(text):
    story.append(Paragraph(f"• {text}", bullet))

def P(text, style=None):
    story.append(Paragraph(text, style or body))

def H2(text):
    story.append(Paragraph(text, h2))

def H3(text):
    story.append(Paragraph(text, h3))

def SP(h=0.3):
    story.append(Spacer(1, h*cm))

def HR():
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_GRAY,
                             spaceAfter=6, spaceBefore=4))

def info_box(text, bg=None, text_color=DARK_GRAY):
    bg = bg or LIGHT_GRAY
    t = Table([[Paragraph(text, ParagraphStyle("ib", fontSize=9.5, leading=14,
                          textColor=text_color, fontName="Helvetica-Oblique"))]],
              colWidths=[W - ML - MR - 1*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("TOPPADDING",    (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LINEBEFORESTROKE", (0,0), (0,-1), 3.5),
        ("LINEBEFORE",    (0,0), (0,-1), 3.5, ACCENT_BLUE),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.2*cm))

def simple_table(headers, rows, col_widths=None, highlight_col=None):
    # headers may be a flat list ["A","B"] or list-of-one-list [["A","B"]]
    if headers and isinstance(headers[0], list):
        headers = headers[0]
    data = [headers] + rows
    cw = col_widths or [W/(len(headers)+0.5) - ML - MR] * len(headers)
    t = Table(data, colWidths=cw, repeatRows=1)
    style = [
        ("BACKGROUND",   (0,0), (-1,0),  BRAND_BLUE),
        ("TEXTCOLOR",    (0,0), (-1,0),  WHITE),
        ("FONTNAME",     (0,0), (-1,0),  "Helvetica-Bold"),
        ("FONTSIZE",     (0,0), (-1,-1), 8.5),
        ("ALIGN",        (0,0), (-1,-1), "LEFT"),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING",   (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",(0,0), (-1,-1), 5),
        ("ROWBACKGROUNDS",(0,1),(-1,-1), [WHITE, LIGHT_GRAY]),
        ("GRID",         (0,0), (-1,-1), 0.3, colors.HexColor("#CBD5E1")),
        ("TEXTCOLOR",    (0,1), (-1,-1), DARK_GRAY),
    ]
    if highlight_col is not None:
        style.append(("FONTNAME", (highlight_col,1), (highlight_col,-1), "Helvetica-Bold"))
        style.append(("TEXTCOLOR", (highlight_col,1), (highlight_col,-1), ACCENT_BLUE))
    t.setStyle(TableStyle(style))
    story.append(t)
    SP(0.3)

def email_block(subject, body_text):
    """Render an email card."""
    rows = [
        [Paragraph("<b>Aihe:</b>", ParagraphStyle("aih", fontSize=8.5, textColor=MID_GRAY, leading=12)),
         Paragraph(subject, ParagraphStyle("sub", fontSize=9, fontName="Helvetica-Bold",
                   textColor=DARK_GRAY, leading=12))],
        [Paragraph("", body_sm),
         Paragraph(body_text.replace("\n","<br/>"),
                   ParagraphStyle("eb", fontSize=9, leading=13.5, textColor=DARK_GRAY))],
    ]
    t = Table(rows, colWidths=[1.6*cm, W-ML-MR-2.6*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), LIGHT_GRAY),
        ("BACKGROUND",    (0,0), (-1,0),  colors.HexColor("#E0E9F5")),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
        ("LINEBELOW",     (0,0), (-1,0),  0.5, colors.HexColor("#BFD0E8")),
        ("BOX",           (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("LINEBEFORE",    (0,0), (0,-1),  3.5, ACCENT_BLUE),
    ]))
    story.append(t)
    SP(0.4)

def objection_table(items):
    rows = [[Paragraph(f"<b>\"{q}\"</b>", ParagraphStyle("q", fontSize=9, leading=13,
                       textColor=BRAND_BLUE)),
             Paragraph(a, body_sm)]
            for q,a in items]
    t = Table(rows, colWidths=[5.5*cm, W-ML-MR-6.5*cm])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [WHITE, LIGHT_GRAY]),
        ("GRID",    (0,0), (-1,-1), 0.3, colors.HexColor("#CBD5E1")),
        ("VALIGN",  (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("TOPPADDING",   (0,0), (-1,-1), 6),
        ("BOTTOMPADDING",(0,0), (-1,-1), 6),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#E0E9F5")),
        ("LINEBELOW", (0,0), (-1,0), 0.5, colors.HexColor("#BFD0E8")),
    ]))
    story.append(t)
    SP(0.3)


# ══════════════════════════════════════════════════════════════════════════════
# 1. ARVOLUPAUS
# ══════════════════════════════════════════════════════════════════════════════
section_header(1, "Arvolupaus & One-liner")

P("Valitse tilanteen mukaan. Käytä aina vain yhtä kerrallaan.")
SP(0.2)

slogans = [
    ["A", "Kentällä-fokus",
     "\"Tarkastus kentällä, raportti valmis ennen kuin istut autoon.\""],
    ["B", "AI-fokus",
     "\"Tekoäly kirjoittaa kuntotarkastusraporttisi — sinä vain tarkistat.\""],
    ["C", "Vapautus-fokus",
     "\"Lopeta raporttien kirjoittaminen. Aloita tarkastusten tekeminen.\""],
]
t = Table(slogans, colWidths=[0.8*cm, 3.2*cm, W-ML-MR-5*cm])
t.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), LIGHT_GRAY),
    ("BACKGROUND",   (0,0), (0,-1), ACCENT_BLUE),
    ("TEXTCOLOR",    (0,0), (0,-1), WHITE),
    ("TEXTCOLOR",    (1,0), (1,-1), BRAND_BLUE),
    ("TEXTCOLOR",    (2,0), (2,-1), DARK_GRAY),
    ("FONTNAME",     (0,0), (-1,-1), "Helvetica"),
    ("FONTNAME",     (0,0), (0,-1), "Helvetica-Bold"),
    ("FONTNAME",     (2,0), (2,-1), "Helvetica-Oblique"),
    ("FONTSIZE",     (0,0), (-1,-1), 10),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ("ALIGN",        (0,0), (0,-1), "CENTER"),
    ("LEFTPADDING",  (0,0), (-1,-1), 10),
    ("TOPPADDING",   (0,0), (-1,-1), 8),
    ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ("LINEBELOW",    (0,0), (-1,-2), 0.5, colors.HexColor("#CBD5E1")),
    ("BOX",          (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
]))
story.append(t)
SP(0.4)
info_box("Vinkki: One-liner B toimii parhaiten kylmässä sähköpostissa. A toimii LinkedInissä ja puheluissa. C toimii mainoksissa.", LIGHT_GRAY)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 2. ONE-PAGER
# ══════════════════════════════════════════════════════════════════════════════
section_header(2, "One-pager myyntisivu")

H2("ONGELMA")
P("Kuntotarkastaja käyttää keskimäärin <b>3–5 tuntia raportin kirjoittamiseen</b> jokaisen tarkastuksen jälkeen.")
for b in [
    "Kenttämuistiinpanot pitää muuttaa ammattikieleksi",
    "RT-kortit ja RakMK-viittaukset pitää etsiä erikseen",
    "Valokuviin pitää kirjoittaa kuvatekstit manuaalisesti",
    "Kiireellisyysluokitukset pitää miettiä ja kirjata",
    "Loppuyhteenveto kirjoitetaan aina alusta",
]:
    B(b)

SP(0.3)
info_box("Tulos: Yksi tarkastaja tekee 2–3 tarkastusta viikossa, vaikka aikaa olisi 5–6:een.", LIGHT_GRAY)

H2("RATKAISU — KuntotarkastusAI")

comp_data = [
    ["Ennen", "KuntotarkastusAI:n kanssa"],
    ["Kirjoitat raporttia 4h illalla", "Raportti valmis tarkastuksen aikana"],
    ["Etsit RT-kortteja käsin", "Tekoäly lisää viittaukset automaattisesti"],
    ["Kirjoitat kuvatekstit itse", "AI tunnistaa vaurion kuvasta ja kirjoittaa"],
    ["Yhteenveto alusta joka kerta", "Yksi nappi — valmis taulukko + loppuyhteenveto"],
    ["Diktaatti → kirjoittaminen erikseen", "Sanelussa suoraan ammattitekstiksi"],
]
simple_table(comp_data[0:1], comp_data[1:],
             col_widths=[(W-ML-MR)/2-0.1*cm, (W-ML-MR)/2-0.1*cm])

H2("OMINAISUUDET")
cols = [
    ("Kentällä", [
        "Puhediktaatti suomeksi (fi-FI)",
        "Kamerakuvaus automaattikategoriaan",
        "iOS, Android ja selain",
    ]),
    ("Tekoäly tekee", [
        "Ammatillinen havaintoteksti",
        "RT-kortit + RakMK automaattisesti",
        "Valokuville AI-kuvatekstit",
    ]),
    ("Raportointi", [
        "13 tarkastuskategoriaa valmiina",
        "Kiireellisyysluokitus automaattisesti",
        "PDF-vienti yhdellä klikkauksella",
    ]),
]
feat_data = [[Paragraph(f"<b>{h}</b>", ParagraphStyle("fh", fontSize=9, textColor=WHITE,
                         fontName="Helvetica-Bold", leading=12))
              for h,_ in cols]]
feat_data += [[Paragraph(f"✓ {i}", ParagraphStyle("fi", fontSize=8.5, textColor=DARK_GRAY,
                          leading=13))
               for _,items in cols for i in [item]]
              for item in zip(*[items for _,items in cols])]
t = Table(feat_data, colWidths=[(W-ML-MR)/3]*3)
t.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,0),  BRAND_BLUE),
    ("BACKGROUND",   (0,1), (-1,-1), LIGHT_GRAY),
    ("ROWBACKGROUNDS",(0,1),(-1,-1), [LIGHT_GRAY, WHITE]),
    ("VALIGN",       (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING",  (0,0), (-1,-1), 10),
    ("TOPPADDING",   (0,0), (-1,-1), 7),
    ("BOTTOMPADDING",(0,0), (-1,-1), 7),
    ("GRID",         (0,0), (-1,-1), 0.3, colors.HexColor("#CBD5E1")),
]))
story.append(t)
SP(0.3)

H2("HINNOITTELU")
price_data = [
    ["Paketti", "Hinta", "Sisältää"],
    ["Starter",    "49 €/kk",  "1 tarkastaja · 10 raporttia/kk"],
    ["Pro",        "99 €/kk",  "1 tarkastaja · rajaton + mobiili"],
    ["Toimisto",   "249 €/kk", "5 tarkastajaa · rajaton · tiimipaneeli"],
    ["Vuosi (Pro)","890 €/v",  "Säästät 298 € — vastaa 3 kk ilmaiseksi"],
]
simple_table(price_data[0:1], price_data[1:],
             col_widths=[3.2*cm, 2.8*cm, W-ML-MR-7*cm],
             highlight_col=1)

info_box("ROI-laskelma: 15 tarkastusta/kk × 3h säästö/raportti = 45h/kk = yksi lisätarkastusviikko. Pro-paketti (99€) maksaa itsensä takaisin yhdellä lisätarkastuksella.")

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 3. KYLMÄSÄHKÖPOSTIKETJU
# ══════════════════════════════════════════════════════════════════════════════
section_header(3, "Kylmäsähköpostiketju")
P("Lähetä sähköpostit maanantaina tai tiistaina klo 8–9. Odota 3 päivää ennen follow-upia.")
SP(0.2)

H3("Sähköposti 1 — Avaus")
email_block(
    "Kuntotarkastusraportti kirjoitettuna ennen kuin lähdät kohteelta",
    "Hei [Etunimi],\n\nYksi kysymys: kuinka kauan käytät aikaa yhden kuntotarkastusraportin kirjoittamiseen?\n\nJos vastaus on enemmän kuin tunti — olemme rakentaneet jotain sinulle.\n\nKuntotarkastusAI muuttaa puhediktaattisi ammattimaiseksi raportiksi kentällä. RT-kortit ja rakennusmääräysviittaukset tulevat automaattisesti. Valokuville generoidaan kuvatekstit tekoälyllä. PDF lähtee tilaajalle kun istut autoon.\n\nEi enää iltoja raporttien kanssa.\n\nSopiiko 15 minuuttia ensi viikolla?\n\n[Sinun nimesi]\n\np.s. Jos teet 10+ tarkastusta kuukaudessa, säästät tällä helposti 30–40 tuntia."
)

H3("Sähköposti 2 — Follow-up (3 pv myöhemmin)")
email_block(
    "Re: Kuntotarkastusraportti kirjoitettuna ennen kuin lähdät kohteelta",
    "Hei [Etunimi],\n\nVarmistelen vain, näitkö viestini.\n\nYmmärrän jos aihe ei satu kohdalle juuri nyt — mutta jos raportointiin menee yli tunti per tarkastus, kannattaa katsoa 2-minuuttinen demo:\n\n[LINKKI DEMOON]\n\nTekoäly kirjoittaa. Sinä tarkistat. PDF lähtee.\n\n[Sinun nimesi]"
)

H3("Sähköposti 3 — Break-up (7 pv myöhemmin)")
email_block(
    "Viimeinen viesti — lupaan",
    "Hei [Etunimi],\n\nEn häiritse enää tämän jälkeen.\n\nLähetän vain, koska tiedän että kuntotarkastajat käyttävät massiivisesti aikaa raportointiin — ja meillä on siihen ratkaisu.\n\nJos aihe on ajankohtainen tulevaisuudessa: [LINKKI]\n\nJos ei — ei hätää. Menestystä tarkastuksiin!\n\n[Sinun nimesi]"
)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 4. LINKEDIN
# ══════════════════════════════════════════════════════════════════════════════
section_header(4, "LinkedIn-viestit & postaukset")

H2("Yhteyspyyntö (max 300 merkkiä)")
info_box("Hei [Etunimi]! Rakensin tekoälypohjaisen kuntotarkastusraportoinnin — muuttaa puhediktaatin ammattiraportiksi, RT-kortit automaattisesti. Ajattelin, että saattaa kiinnostaa. Liitytään verkkoon?")

H2("DM-viesti yhteyden jälkeen")
info_box("Hei [Etunimi], kiitos yhteyksistä!\n\nRakensin KuntotarkastusAI:n koska huomasin, että tarkastajat käyttävät valtavasti aikaa raportointiin — 3–5h per tarkastus on normaali.\n\nMeillä raportti valmistuu tarkastuksen aikana. Tekoäly kirjoittaa ammattitekstit, lisää RT-kortit ja generoi PDF:n.\n\nOnko sinulla 15 min ensi viikolla? Näytän liven miten toimii — ei myyntipuheita, vain demo.")

H2("Orgaaniset postaukset")

post_topics = [
    ("Postaus 1 — Kipupiste (alkuviikko)",
     "Kuntotarkastaja X teki laskelman:\n\n• 15 tarkastusta kuukaudessa\n• 3,5h raportointi per tarkastus\n= 52,5 tuntia kuukaudessa pelkkää raportointia\n\nSe on yli viikon työaika. Joka kuukausi.\n\nRakensimme KuntotarkastusAI:n tähän ongelmaan.\n\nPuhediktaatti → ammattimainen teksti automaattisesti.\nRT-kortit → lisätään automaattisesti.\nValokuvat → kuvatekstit tekoälyllä.\nLoppuyhteenveto → yksi nappi.\n\nJos teet kuntotarkastuksia: kommentoi tai DM, näytän miten toimii."),
    ("Postaus 2 — Ennen/jälkeen (keskiviikko)",
     "Kuntotarkastajan kenttämuistiinpano:\n\"ikkunassa halkeama alanurkassa, tiiviste huono, vedentulomahdollisuus\"\n\nSama 3 sekunnin jälkeen KuntotarkastusAI:ssa:\n\"Ikkunan alanurkassa on havaittu halkeama sekä puutteellinen tiivistys. Vauriokohdassa on kosteusvaurioriski. Suositellaan tiivistysten uusimista. (RT 41-10726)\"\n\nTekoäly lisäsi: ammatillisen kielen, riskiarvion, RT-kortin, toimenpidesuosituksen.\n\nDiktoit. Tekoäly kirjoittaa. Sinä tarkistat.\nLinkki demoon kommenteissa."),
    ("Postaus 3 — ROI-numero (perjantai)",
     "Kuntotarkastaja, laske tämä:\n\n12 tarkastusta/kk × 3h raportointi = 36h/kk\nJos KuntotarkastusAI puolittaa sen = säästät 18h/kk\n18h = 2–3 lisätarkastusta kuukaudessa\nLisätarkastukset tuovat 800–1800€ lisää\n\nPro-paketti maksaa 99€/kk.\nROI: 8–18x.\n\nOletko kiinnostunut? DM tai linkki biossa."),
]
for title, content in post_topics:
    H3(title)
    t = Table([[Paragraph(content.replace("\n","<br/>"),
                ParagraphStyle("pt", fontSize=9, leading=14, textColor=DARK_GRAY))]],
              colWidths=[W-ML-MR-1*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), LIGHT_GRAY),
        ("LEFTPADDING",   (0,0), (-1,-1), 14),
        ("RIGHTPADDING",  (0,0), (-1,-1), 14),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("BOX",           (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("LINEBEFORE",    (0,0), (0,-1),  4, ACCENT_BLUE),
    ]))
    story.append(t)
    SP(0.3)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 5. MYYNTIPUHELINSKRIPTI
# ══════════════════════════════════════════════════════════════════════════════
section_header(5, "Myyntipuhelinskripti")

H2("Avaus (30 sekuntia)")
info_box('"Hei [Etunimi], tässä [Sinun nimesi] KuntotarkastusAI:lta. Soitan lyhyesti — onko hetki?\n\nRakensin työkalun kuntotarkastajille, joka automatisoi raportoinnin — tekoäly muuttaa puhediktaatin ammattiraportiksi kentällä, RT-kortit tulevat automaattisesti. Ajattelin, että saattaa kiinnostaa.\n\nKuinka paljon sinulta menee aikaa yhden raportin kirjoittamiseen?"')

info_box("→ Kuuntele vastaus. Jos yli 1h, jatka:\n\n\"Okei — meillä se vie yleensä neljäsosan siitä. Onko sinulla 15 minuuttia ensi viikolla, näyttäisin liven?\"")

H2("Vastaväitteiden käsittely")
objection_table([
    ("Ei ole aikaa",
     "\"Ymmärrän täysin — siksi soitin. Ajan säästäminen on se pointti. Voidaanko sopia 15 min joskus ensi viikolla?\""),
    ("Meillä on jo oma systeemi",
     "\"Hyvä! Mikä se on? [...] Okei — integroiko se automaattiset RT-kortit ja puhediktaatin? Jos ei, kannattaa katsoa demo.\""),
    ("Liian kallis",
     "\"Laske näin: jos säästät 2h per raportti ja teet 10 raporttia/kk — se on 20h. Mikä on tuntisi arvo? [...] Suhteessa 99€/kk on nopea takaisinmaksu.\""),
    ("Pitää miettiä",
     "\"Totta kai. Mitä sinulle pitäisi olla selvillä päätöksentekoon? [...] Entä jos kokeillaan 14 päivää ilmaiseksi, niin ei tarvitse päättää ennen kuin olet kokeillut?\""),
])

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 6. DEMO-SKRIPTI
# ══════════════════════════════════════════════════════════════════════════════
section_header(6, "Demo-skripti (15 minuuttia)")

demo_steps = [
    ("0–2 min", "Kysy", [
        "\"Kuinka monta tarkastusta teet kuukaudessa?\"",
        "\"Kuinka kauan raportointiin menee?\"",
        "\"Mikä siinä vie eniten aikaa?\"",
    ]),
    ("2–10 min", "Näytä", [
        "Avaa sovellus, luo uusi tarkastus",
        "Täytä kohdetiedot (näytä nopeus)",
        "Valitse kategoria (esim. Märkätilat)",
        "Diktoi lyhyt muistiinpano — paina 'Käsittele tekoälyllä'",
        "Lataa kuva — näytä automaattinen kuvateksti",
        "Paina 'Luo yhteenveto' — kiireellisyystaulukko",
        "Paina 'Loppuyhteenveto' — ammattimainen teksti",
        "Paina 'Vie PDF' — näytä valmis raportti",
    ]),
    ("10–13 min", "Kysy reaktio", [
        "\"Mitä ajattelet?\"",
        "\"Missä kohtaa näet eniten hyötyä omassa työssäsi?\"",
        "\"Mitä kysyttävää?\"",
    ]),
    ("13–15 min", "Ehdota seuraava askel", [
        "\"Haluatko kokeilla 14 päivää ilmaiseksi?\"",
        "\"Voidaanko sopia seuranta 2 viikon päähän?\"",
    ]),
]

for time, title, items in demo_steps:
    row = [[
        Paragraph(time, ParagraphStyle("dt", fontSize=8, textColor=WHITE,
                  fontName="Helvetica-Bold", leading=11, alignment=TA_CENTER)),
        Paragraph(f"<b>{title}</b>", ParagraphStyle("dtitle", fontSize=10,
                  textColor=BRAND_BLUE, fontName="Helvetica-Bold", leading=13)),
        Paragraph("<br/>".join(f"→ {i}" for i in items),
                  ParagraphStyle("di", fontSize=9, textColor=DARK_GRAY, leading=13)),
    ]]
    t = Table(row, colWidths=[1.8*cm, 2.6*cm, W-ML-MR-5.4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (0,-1), ACCENT_BLUE),
        ("BACKGROUND",   (1,0), (-1,-1), LIGHT_GRAY),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING",   (0,0), (-1,-1), 8),
        ("BOTTOMPADDING",(0,0), (-1,-1), 8),
        ("BOX",          (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("LINEBELOW",    (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
    ]))
    story.append(t)
    SP(0.2)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 7. HINNOITTELUSTRATEGIA
# ══════════════════════════════════════════════════════════════════════════════
section_header(7, "Hinnoittelustrategia")

H2("Psykologinen hinnoittelu")
P("<b>Älä myy ohjelmistoa. Myy lisätarkastuksia.</b>")
t = Table([
    [Paragraph("VÄÄRIN", ParagraphStyle("w", fontSize=9, textColor=ACCENT_RED, fontName="Helvetica-Bold")),
     Paragraph("OIKEIN", ParagraphStyle("r", fontSize=9, textColor=ACCENT_GREEN, fontName="Helvetica-Bold"))],
    [Paragraph("\"99€/kk ohjelmistosta\"", ParagraphStyle("wp", fontSize=9.5, textColor=DARK_GRAY,
                fontName="Helvetica-Oblique")),
     Paragraph("\"99€/kk = 3 lisätarkastusta kuukaudessa = 1200–1800€ lisää liikevaihtoa\"",
               ParagraphStyle("rp", fontSize=9.5, textColor=DARK_GRAY, fontName="Helvetica-Oblique"))],
], colWidths=[(W-ML-MR)/2-0.2*cm, (W-ML-MR)/2-0.2*cm])
t.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,-1), colors.HexColor("#FEE2E2")),
    ("BACKGROUND", (1,0), (1,-1), colors.HexColor("#D1FAE5")),
    ("TOPPADDING",   (0,0), (-1,-1), 8),
    ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ("LEFTPADDING",  (0,0), (-1,-1), 12),
    ("GRID",  (0,0), (-1,-1), 0.5, WHITE),
    ("VALIGN",(0,0), (-1,-1), "MIDDLE"),
]))
story.append(t)
SP(0.3)

H2("Ankkurointi")
info_box("Esitä aina VUOSIHINTA ensin:\n\n\"Vuosipaketti on 890€ — se on alle 75€/kk. Tai kuukausittain 99€.\"\n\nIhmiset arvioivat hinnan ensimmäisen numeron mukaan. 890€ tekee 99€:sta halvan.")

H2("Freemium → Maksava polku")
funnel = [
    ["Vaihe", "Toimenpide", "Tavoite"],
    ["1", "Ilmainen kokeilu 14 pv (ei luottokorttia)", "Madalla kynnys"],
    ["2", "In-app muistutus päivänä 7", "Herätä kiinnostus"],
    ["3", "Sähköposti päivänä 12: \"Vielä 2 päivää\"", "Luo kiireellisyys"],
    ["4", "Konvertointi Starter/Pro", "Maksuasiakas"],
    ["5", "Upsell Toimisto-pakettiin kk 3+", "Kasvata MRR"],
]
simple_table(funnel[0:1], funnel[1:],
             col_widths=[0.8*cm, 9*cm, 4.2*cm])

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 8. KOHDERYHMÄT
# ══════════════════════════════════════════════════════════════════════════════
section_header(8, "Kohdeyleisö & segmentit")

segments = [
    ("PRIMAARI", "Itsenäiset kuntotarkastajat", ACCENT_GREEN,
     "2 000–3 000 aktiivia Suomessa",
     "Raportointi vie liikaa aikaa, ei kone-avustusta",
     "LinkedIn · Alan FB-ryhmät · Rakennustarkastusyhdistys ry",
     "Ajan säästö + lisää tarkastuksia"),
    ("SEKUNDAARI", "Kiinteistönvälitystoimistot", ACCENT_BLUE,
     "~1 500 toimistoa Suomessa",
     "Tarvitsevat laadukkaita tarkastuksia nopeasti asiakkaalle",
     "KVKL · Alan messut · Suorat B2B-kontaktit",
     "Laatu, nopeus, ammattimainen ulkoasu"),
    ("TERTIÄRI", "Rakennusliikkeet & isännöinti", MID_GRAY,
     "Iso markkina, pidempi myyntisykli",
     "Rakennusvirheet, vastuukysymykset, dokumentointi",
     "Suora myynti · Toimistokohtaiset sopimukset",
     "Dokumentointi, vastuunrajaus, tehokkuus"),
]

for pri, name, color, koko, kipupiste, kanava, viesti in segments:
    row = [[
        Paragraph(pri, ParagraphStyle("pri", fontSize=8, textColor=WHITE,
                  fontName="Helvetica-Bold", alignment=TA_CENTER)),
        Paragraph(f"<b>{name}</b><br/><font size=8 color='#94A3B8'>Koko: {koko}</font>",
                  ParagraphStyle("sname", fontSize=10, textColor=BRAND_BLUE, leading=14)),
        Paragraph(f"<b>Kipupiste:</b> {kipupiste}<br/><b>Kanava:</b> {kanava}<br/><b>Viesti:</b> {viesti}",
                  ParagraphStyle("sdet", fontSize=8.5, textColor=DARK_GRAY, leading=13)),
    ]]
    t = Table(row, colWidths=[2.0*cm, 4.2*cm, W-ML-MR-7.2*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (0,-1), color),
        ("BACKGROUND",   (1,0), (-1,-1), LIGHT_GRAY),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("TOPPADDING",   (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
        ("BOX",          (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("LINEBELOW",    (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("FONTSIZE",     (0,0), (-1,-1), 8.5),
    ]))
    story.append(t)
    SP(0.25)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 9. KILPAILUEDUT
# ══════════════════════════════════════════════════════════════════════════════
section_header(9, "Kilpailuedut")

def cp(text, **kw):
    return Paragraph(text, ParagraphStyle("cp_"+text[:4], fontSize=9, **kw))

comp_rows = [
    [cp("Suomen kieli (fi-FI) natiivi", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Usein ei tai heikko", textColor=DARK_GRAY)],
    [cp("RT-kortit automaattisesti", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Ei", textColor=ACCENT_RED)],
    [cp("Puhediktaatti kentalla", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Harvoin", textColor=DARK_GRAY)],
    [cp("AI-kuvatekstit (Claude Vision)", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Ei", textColor=ACCENT_RED)],
    [cp("Mobiiliapp (iOS + Android)", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Vaihtelee", textColor=DARK_GRAY)],
    [cp("PDF-vienti ilman lisamaksua", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Usein lisamaksu", textColor=ACCENT_RED)],
    [cp("Data omalla laitteella (GDPR-safe)", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Pilvi = GDPR-riski", textColor=ACCENT_RED)],
    [cp("13 valmista tarkastuskategoriaa", textColor=DARK_GRAY),
     cp("Kylla", textColor=ACCENT_GREEN, fontName="Helvetica-Bold"),
     cp("Yleinen rakenne", textColor=DARK_GRAY)],
]
data = [[Paragraph("Ominaisuus", ParagraphStyle("h_o", fontSize=9, textColor=WHITE, fontName="Helvetica-Bold")),
         Paragraph("KuntotarkastusAI", ParagraphStyle("h_k", fontSize=9, textColor=WHITE, fontName="Helvetica-Bold")),
         Paragraph("Kilpailijat", ParagraphStyle("h_ki", fontSize=9, textColor=WHITE, fontName="Helvetica-Bold"))]] + comp_rows
t = Table(data, colWidths=[8.5*cm, 3.5*cm, 4.2*cm], repeatRows=1)
t.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0),  BRAND_BLUE),
    ("TEXTCOLOR",     (0,0), (-1,0),  WHITE),
    ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
    ("TEXTCOLOR",     (1,1), (1,-1),  ACCENT_GREEN),
    ("FONTNAME",      (1,1), (1,-1),  "Helvetica-Bold"),
    ("TEXTCOLOR",     (2,1), (2,-1),  ACCENT_RED),
    ("FONTSIZE",      (0,0), (-1,-1), 9),
    ("ALIGN",         (1,0), (-1,-1), "CENTER"),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING",   (0,0), (-1,-1), 10),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GRAY]),
    ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#CBD5E1")),
]))
story.append(t)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 10. FAQ
# ══════════════════════════════════════════════════════════════════════════════
section_header(10, "FAQ myyntitilanteeseen")

faqs = [
    ("Onko data turvassa?",
     "Kaikki raporttidata tallennetaan sinun omalle laitteellesi — ei pilvipalvelimelle. Ainoastaan tekoälykäsittelyssä havaintoteksti lähetetään Anthropicin API:lle (sama kuin Claude.ai), joka on GDPR-yhteensopivaa."),
    ("Toimiiko ilman nettiä?",
     "Raportin luominen ja muokkaaminen toimii offline. Tekoälykäsittely vaatii verkkoyhteyden."),
    ("Miten se eroaa ChatGPT:stä?",
     "ChatGPT on yleistyökalu — joudut kirjoittamaan promptit itse joka kerta. KuntotarkastusAI on rakennettu spesifisti suomalaiseen kuntotarkastukseen: kategoriat, RT-kortit, kiireellisyysluokitus ja raporttiformaatti ovat valmiina."),
    ("Voinko muokata tekstejä?",
     "Kyllä, kaikki tekoälyn tuottamat tekstit ovat täysin muokattavissa. Tekoäly on lähtökohta, sinä olet asiantuntija."),
    ("Miten pääsen alkuun?",
     "14 päivän ilmainen kokeilu, ei luottokorttia. Olet tuottava ensimmäisellä tarkastuksella."),
    ("Kuinka kauan kouluttautuminen kestää?",
     "Keskimäärin 20 minuuttia. Ensimmäinen raportti tehdään live-demon aikana yhdessä."),
]

for q, a in faqs:
    faq_t = Table([
        [Paragraph(f"Q: {q}", ParagraphStyle("fq", fontSize=9.5, textColor=BRAND_BLUE,
                   fontName="Helvetica-Bold", leading=13))],
        [Paragraph(f"A: {a}", ParagraphStyle("fa", fontSize=9, textColor=DARK_GRAY, leading=13))],
    ], colWidths=[W-ML-MR-1*cm])
    faq_t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (0,0), colors.HexColor("#EFF6FF")),
        ("BACKGROUND",    (0,1), (0,1), WHITE),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("BOX",           (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ("LINEBEFORE",    (0,0), (0,-1), 3.5, ACCENT_BLUE),
    ]))
    story.append(faq_t)
    SP(0.2)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# 11. MITTARIT
# ══════════════════════════════════════════════════════════════════════════════
section_header(11, "Mittarit & seuranta")

H2("Liidigenerointi — tavoitteet")
kpi_data = [
    ["Mittari", "Tavoite", "Toimenpide jos alle tavoitteen"],
    ["Kylmäsähköpostin avausprosentti", ">40%", "Testaa eri aiherivejä (A/B-testi)"],
    ["Vastaamisprosentti", ">8%", "Lyhennä sähköpostia, fokusoi arvolupaus"],
    ["Demo-booking rate (vastaajista)", ">25%", "Selkeämpi CTA, lyhyempi linkki"],
    ["Demo → ilmainen kokeilu", ">60%", "Paranna demo-skriptiä (kohta 6)"],
    ["Kokeilu → maksava asiakas", ">30%", "Lisää in-app onboarding"],
]
simple_table(kpi_data[0:1], kpi_data[1:],
             col_widths=[5.5*cm, 2.5*cm, W-ML-MR-9*cm])

H2("LinkedIn — tavoitteet")
li_data = [
    ["Toimenpide", "Tavoite"],
    ["Postauksia viikossa", "3 (ma/ke/pe)"],
    ["Kommentteihin vastaaminen", "Alle 2h"],
    ["DM-viesti uusille yhteyksille", "24h sisällä"],
    ["Yhteyspyynföjen hyväksymisprosentti", ">35%"],
]
simple_table(li_data[0:1], li_data[1:],
             col_widths=[7*cm, W-ML-MR-8*cm])

H2("Kuukausittainen seuranta")
monthly_data = [
    ["Mittari", "Selitys"],
    ["MRR (Monthly Recurring Revenue)", "Maksuasiakkaiden kuukausitulot yhteensä"],
    ["Churn rate", "Peruuttaneiden % kuukaudessa — tavoite alle 5%"],
    ["NPS (Net Promoter Score)", "Suosittelisitko? — tavoite yli 50"],
    ["Raportteja per käyttäjä/kk", "Engagement — tavoite yli 8"],
    ["Aktivoitu / rekisteröitynyt", "Onboarding-onnistuminen — tavoite yli 70%"],
]
simple_table(monthly_data[0:1], monthly_data[1:],
             col_widths=[6.5*cm, W-ML-MR-7.5*cm])

SP(0.4)
info_box("Tärkeintä: Seuraa Demo → Kokeilu → Maksava -konversioputkea viikoittain. Se paljastaa nopeimmin missä on pullonkaula.")

# ── Back cover strip ──────────────────────────────────────────────────────────
SP(0.5)
t = Table([[
    Paragraph("KuntotarkastusAI", ParagraphStyle("bc1", fontSize=12, textColor=WHITE,
              fontName="Helvetica-Bold", leading=16)),
    Paragraph("Tarkastus kentällä. Raportti valmiina ennen autolle istumista.",
              ParagraphStyle("bc2", fontSize=9, textColor=colors.HexColor("#BFD7FF"),
              leading=13, alignment=TA_RIGHT)),
]], colWidths=[(W-ML-MR)/2, (W-ML-MR)/2])
t.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,-1), BRAND_BLUE),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ("LEFTPADDING",  (0,0), (-1,-1), 16),
    ("RIGHTPADDING", (0,0), (-1,-1), 16),
    ("TOPPADDING",   (0,0), (-1,-1), 12),
    ("BOTTOMPADDING",(0,0), (-1,-1), 12),
]))
story.append(t)

# ── Build ─────────────────────────────────────────────────────────────────────
doc.build(
    story,
    onFirstPage=cover_bg,
    onLaterPages=later_pages,
)
print("PDF created: KuntotarkastusAI_Myyntimateriaalit.pdf")
