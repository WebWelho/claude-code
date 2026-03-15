// Kuntotarkastus – Inspection App

const state = {
    checks: {}, // { elementId: { value, note } }
    overall: null,
    totalItems: 0
};

// Initialize all check items
function initCheckItems() {
    const items = document.querySelectorAll('.check-item');
    state.totalItems = items.length;

    items.forEach((item, idx) => {
        item.dataset.id = idx;
        const buttons = item.querySelectorAll('.rating-btn');
        const noteArea = item.querySelector('.check-note');
        const title = item.querySelector('.check-title').textContent;

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Clear active state
                buttons.forEach(b => b.className = 'rating-btn');
                // Set active
                btn.classList.add(`active-${btn.dataset.value}`);
                // Update item state
                item.className = `check-item state-${btn.dataset.value}`;
                // Store
                state.checks[idx] = {
                    title,
                    value: btn.dataset.value,
                    note: noteArea ? noteArea.value : '',
                    category: item.dataset.category
                };
                updateProgress();
                updateSectionStatus(item.dataset.category);
            });
        });

        if (noteArea) {
            noteArea.addEventListener('input', () => {
                if (state.checks[idx]) {
                    state.checks[idx].note = noteArea.value;
                }
                if (noteArea.value) {
                    item.classList.add('has-note');
                } else {
                    item.classList.remove('has-note');
                }
            });
        }
    });
}

// Update progress bar and text
function updateProgress() {
    const done = Object.keys(state.checks).length;
    const pct = Math.round((done / state.totalItems) * 100);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = `${done} / ${state.totalItems} tarkastettu`;

    const generateBtn = document.getElementById('generateBtn');
    if (done >= state.totalItems * 0.5) {
        generateBtn.disabled = false;
    }

    // Update summary counts
    let ok = 0, huomio = 0, korjaus = 0;
    Object.values(state.checks).forEach(c => {
        if (c.value === 'ok') ok++;
        else if (c.value === 'huomio') huomio++;
        else if (c.value === 'korjaus') korjaus++;
    });
    document.getElementById('countOk').textContent = ok;
    document.getElementById('countHuomio').textContent = huomio;
    document.getElementById('countKorjaus').textContent = korjaus;
}

// Update section status badges
function updateSectionStatus(category) {
    const sectionMap = {
        lvi: 'status-lvi',
        sahko: 'status-sahko',
        rakenne: 'status-rakenne',
        markatilat: 'status-markatilat',
        turvallisuus: 'status-turvallisuus'
    };
    if (!sectionMap[category]) return;

    const sectionItems = [...document.querySelectorAll(`[data-category="${category}"]`)];
    const done = sectionItems.filter(i => i.classList.contains('state-ok') ||
        i.classList.contains('state-huomio') ||
        i.classList.contains('state-korjaus') ||
        i.classList.contains('state-na')).length;

    const statusEl = document.getElementById(sectionMap[category]);
    if (!statusEl) return;

    if (done === 0) {
        statusEl.textContent = 'Tarkastamatta';
        statusEl.className = 'card-status';
    } else if (done < sectionItems.length) {
        statusEl.textContent = `${done}/${sectionItems.length} tarkastettu`;
        statusEl.className = 'card-status partial';
    } else {
        statusEl.textContent = 'Valmis ✓';
        statusEl.className = 'card-status done';
    }
}

// Overall rating buttons
function initOverallRating() {
    document.querySelectorAll('.overall-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.overall-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.overall = btn.dataset.val;
        });
    });
}

// Generate report
function generateReport() {
    const address = document.getElementById('address').value || 'Ei määritetty';
    const buildYear = document.getElementById('buildYear').value || '-';
    const buildType = document.getElementById('buildType').value || '-';
    const area = document.getElementById('area').value || '-';
    const inspector = document.getElementById('inspector').value || 'Tarkastaja';
    const inspDate = document.getElementById('inspDate').value || new Date().toISOString().split('T')[0];
    const urgentFixes = document.getElementById('urgentFixes').value;
    const additionalNotes = document.getElementById('additionalNotes').value;
    const costImmediate = document.getElementById('costImmediate').value;
    const costShort = document.getElementById('costShort').value;
    const costLong = document.getElementById('costLong').value;

    let ok = 0, huomio = 0, korjaus = 0, na = 0;
    const categories = {
        lvi: { name: '🔧 LVI-järjestelmät', items: [] },
        sahko: { name: '⚡ Sähköjärjestelmät', items: [] },
        rakenne: { name: '🏗️ Rakennustekniikka', items: [] },
        markatilat: { name: '🚿 Märkätilat', items: [] },
        turvallisuus: { name: '🛡️ Turvallisuus', items: [] }
    };

    Object.values(state.checks).forEach(c => {
        if (c.value === 'ok') ok++;
        else if (c.value === 'huomio') huomio++;
        else if (c.value === 'korjaus') korjaus++;
        else if (c.value === 'na') na++;
        if (categories[c.category]) {
            categories[c.category].items.push(c);
        }
    });

    const overallLabels = { hyva: 'Hyvä kunto', tyydyttava: 'Tyydyttävä kunto', heikko: 'Heikko kunto', kriittinen: 'Kriittinen – välitön toimenpide' };
    const overallColors = { hyva: '#f0fdf4', tyydyttava: '#fffbeb', heikko: '#fff7ed', kriittinen: '#fef2f2' };
    const overallText = state.overall ? overallLabels[state.overall] : 'Ei arvioitu';
    const overallBg = state.overall ? overallColors[state.overall] : '#f8fafc';

    const badgeMap = { ok: '<span class="report-badge badge-ok">OK</span>', huomio: '<span class="report-badge badge-huomio">Huomio</span>', korjaus: '<span class="report-badge badge-korjaus">Korjaus</span>', na: '<span class="report-badge badge-na">N/A</span>' };

    let sectionsHtml = '';
    Object.entries(categories).forEach(([key, cat]) => {
        if (cat.items.length === 0) return;
        sectionsHtml += `<div class="report-section">
            <h2>${cat.name}</h2>
            ${cat.items.map(item => `
                <div class="report-item">
                    <div>
                        <div class="report-item-title">${item.title}</div>
                        ${item.note ? `<div class="report-item-note">${item.note}</div>` : ''}
                    </div>
                    ${badgeMap[item.value] || ''}
                </div>
            `).join('')}
        </div>`;
    });

    const reportHtml = `
        <div class="report-header">
            <h1>Kuntotarkastusraportti</h1>
            <p style="color:#64748b;font-size:0.9rem;">${address}</p>
            <div class="report-meta">
                <div class="report-meta-item"><strong>Tarkastuspäivä</strong><span>${inspDate}</span></div>
                <div class="report-meta-item"><strong>Tarkastaja</strong><span>${inspector}</span></div>
                <div class="report-meta-item"><strong>Rakennusvuosi</strong><span>${buildYear} | ${buildType !== '-' ? buildType : ''} ${area !== '-' ? area + ' m²' : ''}</span></div>
            </div>
        </div>

        <div class="report-summary">
            <h2>Yhteenveto</h2>
            <div class="summary-grid">
                <div class="summary-card ok"><strong>${ok}</strong><span>OK</span></div>
                <div class="summary-card warn"><strong>${huomio}</strong><span>Huomio</span></div>
                <div class="summary-card error"><strong>${korjaus}</strong><span>Korjaus</span></div>
            </div>
            <div class="report-overall" style="background:${overallBg}">Yleisarvio: <strong>${overallText}</strong></div>
        </div>

        ${sectionsHtml}

        ${urgentFixes ? `<div class="report-section">
            <h2>⚠️ Kiireelliset korjaussuositukset</h2>
            <p style="font-size:0.875rem;white-space:pre-line;">${urgentFixes}</p>
        </div>` : ''}

        ${(costImmediate || costShort || costLong) ? `<div class="report-section">
            <h2>💰 Arvioidut korjauskustannukset</h2>
            <table class="report-cost-table">
                ${costImmediate ? `<tr><td>Välittömät korjaukset</td><td>${parseInt(costImmediate).toLocaleString('fi-FI')} €</td></tr>` : ''}
                ${costShort ? `<tr><td>1-3 vuoden sisällä</td><td>${parseInt(costShort).toLocaleString('fi-FI')} €</td></tr>` : ''}
                ${costLong ? `<tr><td>3-10 vuoden sisällä</td><td>${parseInt(costLong).toLocaleString('fi-FI')} €</td></tr>` : ''}
                ${(costImmediate || costShort || costLong) ? `<tr style="font-weight:700;border-top:2px solid #e2e8f0;">
                    <td>Yhteensä arvio</td>
                    <td>${((parseInt(costImmediate)||0)+(parseInt(costShort)||0)+(parseInt(costLong)||0)).toLocaleString('fi-FI')} €</td>
                </tr>` : ''}
            </table>
        </div>` : ''}

        ${additionalNotes ? `<div class="report-section">
            <h2>📝 Tarkastajan lisähuomiot</h2>
            <p style="font-size:0.875rem;white-space:pre-line;">${additionalNotes}</p>
        </div>` : ''}

        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:0.75rem;color:#94a3b8;text-align:center;">
            Raportti generoitu: ${new Date().toLocaleDateString('fi-FI')} | Tarkastaja: ${inspector} | UrakoitsijaHub Kuntotarkastus
        </div>
    `;

    document.getElementById('reportContent').innerHTML = reportHtml;
    document.getElementById('reportModal').style.display = 'flex';
    document.getElementById('reportModal').scrollTop = 0;
}

// Close modal
function initModal() {
    ['modalClose', 'modalClose2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => {
            document.getElementById('reportModal').style.display = 'none';
        });
    });
    document.getElementById('reportModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('reportModal')) {
            document.getElementById('reportModal').style.display = 'none';
        }
    });
}

// Set default date
function setDefaultDate() {
    const dateEl = document.getElementById('inspDate');
    if (dateEl) {
        dateEl.value = new Date().toISOString().split('T')[0];
    }
}

// Generate buttons
function initGenerateButtons() {
    ['generateBtn', 'generateBtnBottom'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', generateReport);
    });
}

// Validation indicator for basic info
function initBasicInfoValidation() {
    const fields = ['address', 'buildYear'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                const address = document.getElementById('address').value;
                const buildYear = document.getElementById('buildYear').value;
                const status = document.getElementById('status-kohde');
                if (address && buildYear) {
                    status.textContent = 'Täytetty ✓';
                    status.className = 'card-status done';
                } else {
                    status.textContent = 'Täytä';
                    status.className = 'card-status';
                }
            });
        }
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initCheckItems();
    initOverallRating();
    initModal();
    initGenerateButtons();
    setDefaultDate();
    initBasicInfoValidation();
});
