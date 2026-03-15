// Automaattilinja – Lead Distribution Dashboard

// Sample data (in production: fetch from backend/database)
const DEMO_CONTRACTORS = [
    { id: 1, name: 'LVI Kruunu', contact: 'Joonas Lehtinen', phone: '050 586 4771', area: 'Tampere, Pirkanmaa', type: 'lvi', leadPrice: 65, maxLeads: 30, leadsThisMonth: 8 },
    { id: 2, name: 'SavoMega Service', contact: 'Pekka S.', phone: '040 XXX XXXX', area: 'Siilinjärvi, Kuopio', type: 'sahko', leadPrice: 55, maxLeads: 20, leadsThisMonth: 5 },
    { id: 3, name: 'Sähkö Virtanen', contact: 'Virtanen', phone: '044 XXX XXXX', area: 'Helsinki', type: 'sahko', leadPrice: 80, maxLeads: 15, leadsThisMonth: 12 },
];

const DEMO_LEADS = [
    { id: 1, name: 'Matti Korhonen', phone: '040 111 2222', city: 'Tampere', type: 'lvi', urgency: 'kiireellinen', desc: 'Lämminvesikiertopumppu rikki, tarvitaan vaihto.', price: 65, status: 'sent', sentTo: 'LVI Kruunu', time: '10 min sitten' },
    { id: 2, name: 'Anna Virtanen', phone: '044 333 4444', city: 'Kuopio', type: 'sahko', urgency: 'normaali', desc: 'Sähkösaneeraus, koko talo. Rakennusvuosi 1978.', price: 80, status: 'sent', sentTo: 'SavoMega Service', time: '45 min sitten' },
    { id: 3, name: 'Juhani Mäkinen', phone: '050 555 6666', city: 'Tampere', type: 'tarkastus', urgency: 'normaali', desc: 'Kodin kuntotarkastus ennen myyntiä.', price: 45, status: 'pending', sentTo: null, time: '1 h sitten' },
    { id: 4, name: 'Liisa Järvinen', phone: '040 777 8888', city: 'Pirkkala', type: 'lvi', urgency: 'paivystys', desc: 'Putki vuotaa, kylpyhuone vesi lattialla!', price: 120, status: 'sent', sentTo: 'LVI Kruunu', time: '2 h sitten' },
    { id: 5, name: 'Timo Saloinen', phone: '044 999 0000', city: 'Siilinjärvi', type: 'sahko', urgency: 'normaali', desc: 'Aurinkopaneelijärjestelmä, 20 paneelia.', price: 70, status: 'new', sentTo: null, time: '3 h sitten' },
];

const DEMO_LOG = [
    { type: 'success', message: 'Liidi #4 (Järvinen) lähetetty automaattisesti → LVI Kruunu', time: '2 h sitten' },
    { type: 'success', message: 'Liidi #2 (Virtanen) lähetetty → SavoMega Service', time: '45 min sitten' },
    { type: 'info', message: 'Liidi #3 (Mäkinen) odottaa urakoitsijaa – ei sopivaa alueella', time: '1 h sitten' },
    { type: 'success', message: 'Liidi #1 (Korhonen) lähetetty → LVI Kruunu', time: '10 min sitten' },
    { type: 'warn', message: 'Liidi #5 (Saloinen) – tarkistetaan alueen urakoitsijat...', time: '3 h sitten' },
];

let leads = [...DEMO_LEADS];
let contractors = [...DEMO_CONTRACTORS];
let filter = 'all';

const typeIcons = { lvi: '🔧', sahko: '⚡', tarkastus: '🏠' };
const typeNames = { lvi: 'LVI', sahko: 'Sähkö', tarkastus: 'Tarkastus' };
const urgencyLabels = { normaali: 'Normaali', kiireellinen: 'Kiireellinen', paivystys: '⚠ Päivystys' };
const statusLabels = { sent: 'Lähetetty', pending: 'Odottaa', new: 'Uusi' };

function renderStats() {
    const total = leads.length;
    const sent = leads.filter(l => l.status === 'sent').length;
    const pending = leads.filter(l => l.status === 'pending' || l.status === 'new').length;
    const revenue = leads.filter(l => l.status === 'sent').reduce((sum, l) => sum + l.price, 0);
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statSent').textContent = sent;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statRevenue').textContent = revenue + ' €';
}

function renderLeads() {
    const list = document.getElementById('leadsList');
    let filtered = leads;
    if (filter === 'lvi') filtered = leads.filter(l => l.type === 'lvi');
    else if (filter === 'sahko') filtered = leads.filter(l => l.type === 'sahko');
    else if (filter === 'pending') filtered = leads.filter(l => l.status === 'pending' || l.status === 'new');

    if (filtered.length === 0) {
        list.innerHTML = '<div class="leads-empty">Ei liidejä tässä kategoriassa.</div>';
        return;
    }
    list.innerHTML = filtered.map(lead => `
        <div class="lead-item" data-id="${lead.id}">
            <div class="lead-type-badge ${lead.type}">${typeIcons[lead.type] || '📋'}</div>
            <div class="lead-info">
                <div class="lead-name">${lead.name}</div>
                <div class="lead-details">${typeNames[lead.type]} · ${lead.city} · ${urgencyLabels[lead.urgency]}${lead.sentTo ? ' → ' + lead.sentTo : ''}</div>
            </div>
            <div class="lead-meta">
                <span class="lead-status status-${lead.status}">${statusLabels[lead.status]}</span>
                <span class="lead-price">${lead.price} €</span>
                <span class="lead-time">${lead.time}</span>
            </div>
        </div>
    `).join('');
}

function renderContractors() {
    const list = document.getElementById('contractorsList');
    list.innerHTML = contractors.map(c => `
        <div class="contractor-item">
            <div class="contractor-avatar">${c.name.substring(0, 2).toUpperCase()}</div>
            <div class="contractor-info">
                <div class="contractor-name">${c.name}</div>
                <div class="contractor-area">${c.area}</div>
            </div>
            <div class="contractor-leads">${c.leadsThisMonth} liidiä</div>
            <div class="contractor-status"></div>
        </div>
    `).join('');
}

function renderLog() {
    const log = document.getElementById('activityLog');
    log.innerHTML = DEMO_LOG.map(item => `
        <div class="log-item">
            <div class="log-dot ${item.type}"></div>
            <div class="log-message">${item.message}</div>
            <div class="log-time">${item.time}</div>
        </div>
    `).join('');
}

// Filter buttons
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filter = btn.dataset.filter;
            renderLeads();
        });
    });
}

// Lead form
function initLeadModal() {
    const modal = document.getElementById('leadModal');
    document.getElementById('btnAddLead').addEventListener('click', () => modal.style.display = 'flex');
    document.getElementById('leadModalClose').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('leadForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('leadType').value;
        const urgency = document.getElementById('leadUrgency').value;
        const autoSend = document.getElementById('leadAutoSend').value;

        // Find best contractor for auto-send
        let sentTo = null;
        let status = 'pending';
        if (autoSend === 'yes') {
            const matching = contractors.filter(c => c.type === type || c.type === 'molemmat');
            if (matching.length > 0) {
                sentTo = matching[0].name;
                status = 'sent';
                // Add to log
                DEMO_LOG.unshift({ type: 'success', message: `Uusi liidi lähetetty automaattisesti → ${sentTo}`, time: 'juuri nyt' });
            }
        }

        const newLead = {
            id: leads.length + 1,
            name: document.getElementById('leadName').value,
            phone: document.getElementById('leadPhone').value,
            city: document.getElementById('leadCity').value || '-',
            type,
            urgency,
            desc: document.getElementById('leadDesc').value,
            price: parseInt(document.getElementById('leadPrice').value) || 65,
            status,
            sentTo,
            time: 'juuri nyt'
        };
        leads.unshift(newLead);
        modal.style.display = 'none';
        e.target.reset();
        renderStats();
        renderLeads();
        renderLog();
        showToast(status === 'sent' ? `Liidi lähetetty → ${sentTo}` : 'Liidi lisätty, odottaa jakelulistaa');
    });
}

// Contractor form
function initContractorModal() {
    const modal = document.getElementById('contractorModal');
    document.getElementById('btnAddContractor').addEventListener('click', () => modal.style.display = 'flex');
    document.getElementById('contractorModalClose').addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('contractorForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newContractor = {
            id: contractors.length + 1,
            name: document.getElementById('contractorName').value,
            contact: document.getElementById('contractorContact').value,
            phone: document.getElementById('contractorPhone').value,
            area: document.getElementById('contractorArea').value || '-',
            type: document.getElementById('contractorType').value,
            leadPrice: parseInt(document.getElementById('contractorLeadPrice').value) || 65,
            maxLeads: parseInt(document.getElementById('contractorMaxLeads').value) || 20,
            leadsThisMonth: 0
        };
        contractors.push(newContractor);
        modal.style.display = 'none';
        e.target.reset();
        renderContractors();
        showToast(`Urakoitsija ${newContractor.name} lisätty!`);
    });
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1e293b;color:white;padding:12px 20px;border-radius:10px;font-size:0.875rem;font-weight:600;z-index:999;box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:slideIn 0.3s ease;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderLeads();
    renderContractors();
    renderLog();
    initFilters();
    initLeadModal();
    initContractorModal();
});
