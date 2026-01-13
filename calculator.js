/**
 * Calculator logic for Hotel Bahía Price Quoter
 */

// Tourist tax configuration for 2026
const TOURIST_TAX_RATES = {
    lowSeason: {
        start: new Date(2025, 10, 1),
        end: new Date(2026, 3, 30),
        rate: 0.85
    }
};

const HIGH_SEASON_RATE = 3.3;
const LOW_SEASON_RATE = 0.85;

/**
 * Initializes the page with default values
 */
document.addEventListener('DOMContentLoaded', function () {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    document.getElementById('checkIn').value = today.toISOString().split('T')[0];
    document.getElementById('checkOut').value = tomorrow.toISOString().split('T')[0];

    updateNights();

    // Listen for form submissions or enter keys
    document.getElementById('quotationForm')?.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            calculateQuotation();
        }
    });
});

/**
 * Calculates nights between dates
 */
function updateNights() {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;

    if (!checkIn || !checkOut) return;

    const d1 = new Date(checkIn + 'T00:00:00');
    const d2 = new Date(checkOut + 'T00:00:00');
    const timeDiff = d2 - d1;
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    document.getElementById('nights').value = nights > 0 ? nights : 0;
}

/**
 * Get rooms from the dynamic list
 */
function getRooms() {
    const rooms = [];
    document.querySelectorAll('.room-item').forEach(item => {
        const type = item.querySelector('.room-type').value;
        const qty = parseInt(item.querySelector('.room-qty').value) || 0;
        const price = parseFloat(item.querySelector('.room-price').value) || 0;
        if (type && qty > 0 && price > 0) {
            rooms.push({ type, qty, price });
        }
    });
    return rooms;
}

/**
 * Dynamic room UI management
 */
function addRoom() {
    const roomsList = document.getElementById('roomsList');
    const newRoom = document.createElement('div');
    newRoom.className = 'room-item';
    // Mobile-friendly layout logic is in CSS, we just need basic structure
    newRoom.innerHTML = `
        <select class="room-type yellow-input" onchange="updateDefaultDiscount()" required>
            <option value="">-- Seleccionar --</option>
            <option value="Doble">Doble</option>
            <option value="Doble Económica">Doble Económica</option>
            <option value="Triple">Triple</option>
            <option value="Individual">Individual</option>
        </select>
        <input type="number" class="room-qty yellow-input" min="1" value="1" required placeholder="Cant." onchange="updateDefaultDiscount()">
        <input type="number" class="room-price yellow-input" step="0.01" min="0" placeholder="€/noche" required onchange="updateDefaultDiscount()">
        <button type="button" onclick="removeRoom(this)" class="btn btn-secondary btn-remove" 
                style="background: #dc3545; padding: 12px; height: 100%;">
            <i class="fa-solid fa-trash"></i>
        </button>
    `;
    roomsList.appendChild(newRoom);
}

function removeRoom(button) {
    const roomsList = document.getElementById('roomsList');
    if (roomsList.querySelectorAll('.room-item').length > 1) {
        button.closest('.room-item').remove();
        updateDefaultDiscount();
    } else {
        alert('Debe haber al menos una habitación');
    }
}

/**
 * Weighted average for direct discount based on room settings
 */
function updateDefaultDiscount() {
    const items = document.querySelectorAll('.room-item');
    const settings = loadSettings();
    let totalWeightedDiscount = 0;
    let totalWeight = 0;
    let foundRoom = false;

    items.forEach(item => {
        const type = item.querySelector('.room-type').value;
        if (!type) return;

        const qty = parseFloat(item.querySelector('.room-qty').value) || 0;
        const price = parseFloat(item.querySelector('.room-price').value) || 0;
        const weight = qty * (price > 0 ? price : 1);

        let discount = 0;
        if (type === 'Doble') discount = settings.double;
        else if (type === 'Doble Económica') discount = settings.doubleEco;
        else if (type === 'Triple') discount = settings.triple;
        else if (type === 'Individual') discount = settings.individual;

        totalWeightedDiscount += (weight * discount);
        totalWeight += weight;
        foundRoom = true;
    });

    const directDiscountInput = document.getElementById('directDiscount');
    if (foundRoom && totalWeight > 0) {
        directDiscountInput.value = (totalWeightedDiscount / totalWeight).toFixed(1);
    }
}

/**
 * Settings management
 */
function loadSettings() {
    const defaults = {
        double: 7,
        doubleEco: 7,
        triple: 0,
        individual: 0,
        bookingDouble: 8,
        bookingDoubleEco: 8,
        bookingTriple: 8,
        bookingIndividual: 0
    };
    const saved = localStorage.getItem('hotelBahiaSettings');
    return saved ? JSON.parse(saved) : defaults;
}

function openSettings() {
    const settings = loadSettings();
    const fields = {
        'cfg-discount-double': settings.double,
        'cfg-discount-double-eco': settings.doubleEco,
        'cfg-discount-triple': settings.triple,
        'cfg-discount-individual': settings.individual,
        'cfg-booking-double': settings.bookingDouble,
        'cfg-booking-double-eco': settings.bookingDoubleEco,
        'cfg-booking-triple': settings.bookingTriple,
        'cfg-booking-individual': settings.bookingIndividual
    };

    for (const [id, value] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.value = value;
    }

    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function saveSettings() {
    const getValue = (id, def) => {
        const el = document.getElementById(id);
        return el ? parseFloat(el.value) || 0 : def;
    };

    const current = loadSettings();
    const settings = {
        double: getValue('cfg-discount-double', current.double),
        doubleEco: getValue('cfg-discount-double-eco', current.doubleEco),
        triple: getValue('cfg-discount-triple', current.triple),
        individual: getValue('cfg-discount-individual', current.individual),
        bookingDouble: getValue('cfg-booking-double', current.bookingDouble),
        bookingDoubleEco: getValue('cfg-booking-double-eco', current.bookingDoubleEco),
        bookingTriple: getValue('cfg-booking-triple', current.bookingTriple),
        bookingIndividual: getValue('cfg-booking-individual', current.bookingIndividual)
    };

    localStorage.setItem('hotelBahiaSettings', JSON.stringify(settings));
    closeSettings();
    updateDefaultDiscount();
}

/**
 * Main calculation engine
 */
function calculateQuotation() {
    const nights = parseInt(document.getElementById('nights').value);
    const rooms = getRooms();
    const regime = document.getElementById('regime').value;
    const adults = parseInt(document.getElementById('adults').value) || 0;

    if (!nights || rooms.length === 0 || !regime) {
        alert('Por favor, completa los campos requeridos (*)');
        return;
    }

    let webBaseTotal = 0;
    let roomsDesc = [];
    rooms.forEach(r => {
        webBaseTotal += r.price * r.qty * nights;
        roomsDesc.push(`${r.qty}×${r.type}`);
    });

    const loyaltyDiscount = 0.05;
    const mobileDiscount = 0.10;
    const directDiscountPct = (parseFloat(document.getElementById('directDiscount').value) || 0) / 100;

    const loyaltyAmount = webBaseTotal * loyaltyDiscount;
    const afterLoyalty = webBaseTotal - loyaltyAmount;
    const mobileAmount = afterLoyalty * mobileDiscount;
    const roomPrice = afterLoyalty - mobileAmount;

    const directAmount = roomPrice * directDiscountPct;
    const clientPrice = roomPrice - directAmount;

    // Tourist Tax calculation
    const checkInDate = document.getElementById('checkIn').value;
    const taxInfo = getTouristTaxInfo(checkInDate);
    const taxRate = taxInfo.rate;
    const fullRateNights = Math.min(nights, 8);
    const halfRateNights = Math.max(nights - 8, 0);
    const touristTax = ((fullRateNights * taxRate) + (halfRateNights * taxRate * 0.5)) * adults;

    // Display results
    document.getElementById('resultWebBase').textContent = formatCurrency(webBaseTotal);
    document.getElementById('resultWebBaseNote').textContent = `${roomsDesc.join(', ')} (${nights} noches)`;
    document.getElementById('resultLoyaltyDiscount').textContent = formatCurrency(loyaltyAmount);
    document.getElementById('resultMobileDiscount').textContent = formatCurrency(mobileAmount);
    document.getElementById('resultRoomPrice').textContent = formatCurrency(roomPrice);
    document.getElementById('resultDirectDiscount').textContent = formatCurrency(directAmount);
    document.getElementById('resultDirectDiscountLabel').textContent = (directDiscountPct * 100).toFixed(0);
    document.getElementById('resultClientPriceBreakdown').textContent = formatCurrency(clientPrice);
    document.getElementById('resultTouristTax').textContent = formatCurrency(touristTax);

    // Detailed Tax Note
    let taxNoteText = `${taxInfo.season} / ${adults} ad.`;
    if (nights > 8) {
        taxNoteText += ` / +8n dto. 50%`;
    }
    document.getElementById('resultTaxNote').textContent = `(${taxNoteText})`;

    document.getElementById('resultClientPrice').textContent = formatCurrency(clientPrice);

    // Expected booking
    document.getElementById('resultBookingExpected').textContent = formatCurrency(roomPrice * 1.03);

    document.getElementById('resultsContainer').style.display = 'block';
    document.getElementById('noResultsMessage').style.display = 'none';

    // Auto-scroll to results on mobile
    if (window.innerWidth <= 600) {
        document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Save state for printing/comparing
    window.currentQuotation = {
        nights, adults, rooms, webBaseTotal, roomPrice, clientPrice, touristTax,
        loyaltyDiscountAmount: loyaltyAmount,
        mobileDiscountAmount: mobileAmount,
        directDiscountAmount: directAmount,
        directDiscountPercent: directDiscountPct * 100,
        checkIn: checkInDate,
        checkOut: document.getElementById('checkOut').value,
        roomType: roomsDesc.join(', '),
        regime,
        children: parseInt(document.getElementById('children').value) || 0,
        babies: parseInt(document.getElementById('babies').value) || 0
    };
}

function getTouristTaxInfo(dateStr) {
    const date = new Date(dateStr);
    const lowStart = TOURIST_TAX_RATES.lowSeason.start;
    const lowEnd = TOURIST_TAX_RATES.lowSeason.end;
    const isLow = (date >= lowStart && date <= lowEnd);
    return {
        rate: isLow ? LOW_SEASON_RATE : HIGH_SEASON_RATE,
        season: isLow ? 'Temp. Baja' : 'Temp. Alta'
    };
}

function showEmissionFields() {
    document.getElementById('emissionSection').style.display = 'block';
    document.getElementById('emissionSection').scrollIntoView({ behavior: 'smooth' });
}

function toggleDetails() {
    const content = document.getElementById('detailsContent');
    const btn = document.getElementById('detailsToggleBtn');
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        btn.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Ocultar desglose';
    } else {
        content.style.display = 'none';
        btn.innerHTML = '<i class="fa-solid fa-chevron-down"></i> Ver desglose';
    }
}

/**
 * Booking comparison calculation
 * Compares direct booking price with Booking.com price
 */
function calculateBookingComparison() {
    // 1. Validate that main quotation exists
    if (!window.currentQuotation) {
        alert('Por favor, calcula primero la cotización principal');
        return;
    }

    // 2. Get and validate Booking price input
    const bookingPriceInput = parseFloat(document.getElementById('bookingPrice').value);
    if (isNaN(bookingPriceInput) || bookingPriceInput <= 0) {
        alert('Por favor, introduce un precio válido de Booking (mayor que 0)');
        return;
    }

    // 2b. Validate booking price is greater than tourist tax (makes sense logically)
    const q = window.currentQuotation;
    if (bookingPriceInput <= q.touristTax) {
        alert('El precio de Booking debe ser mayor que la tasa turística (' + formatCurrency(q.touristTax) + ')');
        return;
    }

    // 3. Get mobile discount percentage (clamp to 0-100%)
    let bookingMobileDiscountRaw = parseFloat(document.getElementById('bookingMobileDiscount').value);
    if (isNaN(bookingMobileDiscountRaw)) {
        bookingMobileDiscountRaw = 10; // Default to 10%
    }
    bookingMobileDiscountRaw = Math.max(0, Math.min(100, bookingMobileDiscountRaw));
    const bookingMobileDiscountPct = bookingMobileDiscountRaw / 100;

    // 4. Get booking differential percentage from settings based on room type
    const settings = loadSettings();
    const rooms = q.rooms || getRooms();

    // Calculate weighted average booking differential based on room types
    let totalWeightedDiff = 0;
    let totalWeight = 0;
    rooms.forEach(r => {
        const weight = r.qty * r.price;
        let diff = 0;
        if (r.type === 'Doble') diff = settings.bookingDouble;
        else if (r.type === 'Doble Económica') diff = settings.bookingDoubleEco;
        else if (r.type === 'Triple') diff = settings.bookingTriple;
        else if (r.type === 'Individual') diff = settings.bookingIndividual;
        totalWeightedDiff += (weight * diff);
        totalWeight += weight;
    });
    const bookingDiffPct = totalWeight > 0 ? (totalWeightedDiff / totalWeight) / 100 : 0.08;

    // 5. Subtract tourist tax from Booking price to get base
    const bookingBase = bookingPriceInput - q.touristTax;

    // 6. Calculate Booking breakdown
    const bookingMobileDiscount = bookingBase * bookingMobileDiscountPct;
    const bookingAfterMobile = bookingBase - bookingMobileDiscount;
    const bookingDifferential = bookingAfterMobile * bookingDiffPct;
    const bookingTotal = bookingAfterMobile - bookingDifferential;

    // 7. Get Direct values from currentQuotation
    const directBase = q.webBaseTotal;
    const directLoyalty = q.loyaltyDiscountAmount;
    const directMobile = q.mobileDiscountAmount;
    const directDiscount = q.directDiscountAmount;
    const directTotal = q.clientPrice;

    // 8. Calculate difference (positive = Direct is cheaper/better for hotel)
    const difference = bookingTotal - directTotal;

    // 9. Update all DOM elements with results
    document.getElementById('comp-direct-base').textContent = formatCurrency(directBase);
    document.getElementById('comp-direct-loyalty').textContent = formatCurrency(directLoyalty);
    document.getElementById('comp-direct-mobile').textContent = formatCurrency(directMobile);
    document.getElementById('comp-direct-discount').textContent = formatCurrency(directDiscount);
    document.getElementById('comp-direct-discount-label').textContent = q.directDiscountPercent.toFixed(0);
    document.getElementById('comp-direct-total').textContent = formatCurrency(directTotal);

    document.getElementById('comp-booking-base').textContent = formatCurrency(bookingBase);
    document.getElementById('comp-booking-mobile').textContent = formatCurrency(bookingMobileDiscount);
    document.getElementById('comp-booking-8pct').textContent = formatCurrency(bookingDifferential);
    document.getElementById('comp-booking-8pct-label').textContent = (bookingDiffPct * 100).toFixed(0);
    document.getElementById('comp-booking-total').textContent = formatCurrency(bookingTotal);

    // Update difference display
    document.getElementById('comp-difference').textContent = formatCurrency(Math.abs(difference));

    const differenceBox = document.getElementById('comparisonDifferenceBox');
    const differenceNote = document.getElementById('comp-difference-note');
    const differenceLabel = document.getElementById('comp-difference-label');

    if (difference >= 0) {
        // Direct is cheaper or equal - good for hotel
        differenceBox.style.background = '#e8f5e9';
        differenceBox.style.borderColor = '#4caf50';
        differenceLabel.textContent = 'Ahorro con Cliente Directo';
        differenceLabel.style.color = '#2e7d32';
        differenceNote.textContent = difference > 0 ? 'El hotel gana más con reserva directa' : 'Mismo resultado';
        differenceNote.style.color = '#2e7d32';
    } else {
        // Booking is cheaper - warning
        differenceBox.style.background = '#fff3e0';
        differenceBox.style.borderColor = '#ff9800';
        differenceLabel.textContent = 'Diferencia a favor de Booking';
        differenceLabel.style.color = '#e65100';
        differenceNote.textContent = 'Booking genera más ingreso neto';
        differenceNote.style.color = '#e65100';
    }

    // 10. Show comparison results container
    document.getElementById('bookingComparisonResults').style.display = 'block';

    // 11. Store comparison data in window.currentQuotation for printing
    window.currentQuotation.comparisonPerformed = true;
    window.currentQuotation.bookingPrice = bookingPriceInput;
    window.currentQuotation.bookingBase = bookingBase;
    window.currentQuotation.bookingMobileDiscount = bookingMobileDiscount;
    window.currentQuotation.bookingDifferential = bookingDifferential;
    window.currentQuotation.bookingDiffPercent = bookingDiffPct * 100;
    window.currentQuotation.bookingTotal = bookingTotal;
    window.currentQuotation.comparisonDifference = difference;

    // Auto-scroll to comparison results on mobile
    if (window.innerWidth <= 600) {
        document.getElementById('bookingComparisonResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Print and save to history
 */
function printQuotation() {
    const guestName = document.getElementById('guestName').value;
    if (!guestName) {
        alert('Por favor, indica el nombre del huésped');
        return;
    }

    const q = window.currentQuotation;
    q.guestName = guestName;

    // Safely get optional fields
    const getValue = (id) => document.getElementById(id) ? document.getElementById(id).value : '';

    q.guestEmail = getValue('guestEmail');
    q.guestPhone = getValue('guestPhone');
    q.reservationNumber = getValue('reservationNumber');
    q.language = getValue('quotationLanguage') || 'es';

    // Identifiers
    const now = new Date();
    q.id = `QUOT-${now.getTime()}`;
    q.dateEmitted = now.toISOString();

    // Save to history
    const history = JSON.parse(localStorage.getItem('hotelBahiaQuotationHistory') || '[]');
    history.push({ ...q, totalPrice: q.clientPrice, roomsSummary: q.roomType });
    localStorage.setItem('hotelBahiaQuotationHistory', JSON.stringify(history));

    // Print
    const printHTML = generatePrintHTML(q, q.language);
    const win = window.open('', '_blank');
    win.document.write(printHTML);
    win.document.close();
    setTimeout(() => win.print(), 500);
}

function clearForm() {
    window.location.reload(); // Simple clear
}
