/**
 * History page logic for Hotel Bahía
 */

let fullHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

/**
 * Loads history from localStorage
 */
function loadHistory() {
    const saved = localStorage.getItem('hotelBahiaQuotationHistory');
    fullHistory = saved ? JSON.parse(saved) : [];

    // Sort by date descending
    fullHistory.sort((a, b) => new Date(b.dateEmitted) - new Date(a.dateEmitted));

    renderHistory(fullHistory);
}

/**
 * Renders the history list items
 */
function renderHistory(items) {
    const list = document.getElementById('historyList');
    const empty = document.getElementById('emptyState');

    if (items.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    list.innerHTML = items.map((item, index) => {
        const date = new Date(item.dateEmitted);
        const day = date.getDate();
        const month = date.toLocaleString('es', { month: 'short' }).replace('.', '');

        return `
            <div class="history-item">
                <div class="date-badge">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="client-info">
                    <h3>${item.guestName || 'Sin Nombre'}</h3>
                    <p><i class="fa-solid fa-envelope"></i> ${item.guestEmail || 'N/A'}</p>
                    <p><i class="fa-solid fa-hashtag"></i> <small>${item.id}</small></p>
                </div>
                <div class="stay-info">
                    <div><strong>${item.roomsSummary}</strong></div>
                    <div><i class="fa-solid fa-calendar"></i> ${item.nights} noches (${item.regime})</div>
                </div>
                <div class="price-info">
                    <span class="total">€ ${formatCurrency(item.clientPrice)}</span>
                    <div class="actions" style="margin-top: 10px;">
                        <button class="action-btn btn-view" onclick="viewQuotation('${item.id}')" title="Ver">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="deleteHistoryItem('${item.id}')" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filtering logic
 */
function filterHistory() {
    const getValue = (id) => document.getElementById(id) ? document.getElementById(id).value : '';

    const query = getValue('searchInput').toLowerCase();
    const dateFrom = getValue('filterDateFrom');
    const dateTo = getValue('filterDateTo');
    const roomType = getValue('filterRoomType');
    const lang = getValue('filterLanguage');
    const maxPrice = parseFloat(getValue('filterMaxPrice'));

    const filtered = fullHistory.filter(item => {
        const matchesQuery = !query ||
            (item.guestName || '').toLowerCase().includes(query) ||
            (item.guestEmail || '').toLowerCase().includes(query) ||
            (item.id || '').toLowerCase().includes(query);

        const itemDate = new Date(item.dateEmitted).toISOString().split('T')[0];
        const matchesDateFrom = !dateFrom || itemDate >= dateFrom;
        const matchesDateTo = !dateTo || itemDate <= dateTo;

        const matchesRoom = !roomType || (item.roomsSummary || '').includes(roomType);
        const matchesLang = !lang || item.language === lang;
        const matchesPrice = isNaN(maxPrice) || item.clientPrice <= maxPrice;

        return matchesQuery && matchesDateFrom && matchesDateTo && matchesRoom && matchesLang && matchesPrice;
    });

    renderHistory(filtered);
}

function clearFilters() {
    const ids = ['searchInput', 'filterDateFrom', 'filterDateTo', 'filterRoomType', 'filterLanguage', 'filterMaxPrice'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    renderHistory(fullHistory);
}

/**
 * Actions
 */
function viewQuotation(id) {
    const item = fullHistory.find(h => h.id === id);
    if (!item) return;

    const printHTML = generatePrintHTML(item, item.language);
    const win = window.open('', '_blank');
    win.document.write(printHTML);
    win.document.close();
}

function deleteHistoryItem(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cotización?')) return;

    fullHistory = fullHistory.filter(h => h.id !== id);
    localStorage.setItem('hotelBahiaQuotationHistory', JSON.stringify(fullHistory));
    renderHistory(fullHistory);
}
