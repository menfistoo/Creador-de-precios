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
    document.getElementById('cfg-discount-double').value = settings.double;
    document.getElementById('cfg-discount-double-eco').value = settings.doubleEco;
    document.getElementById('cfg-discount-triple').value = settings.triple;
    document.getElementById('cfg-discount-individual').value = settings.individual;
    document.getElementById('cfg-booking-double').value = settings.bookingDouble;
    document.getElementById('cfg-booking-double-eco').value = settings.bookingDoubleEco;
    document.getElementById('cfg-booking-triple').value = settings.bookingTriple;
    document.getElementById('cfg-booking-individual').value = settings.bookingIndividual;

    document.getElementById('settingsModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

function saveSettings() {
    const settings = {
        double: parseFloat(document.getElementById('cfg-discount-double').value) || 0,
        doubleEco: parseFloat(document.getElementById('cfg-discount-double-eco').value) || 0,
        triple: parseFloat(document.getElementById('cfg-discount-triple').value) || 0,
        individual: parseFloat(document.getElementById('cfg-discount-individual').value) || 0,
        bookingDouble: parseFloat(document.getElementById('cfg-booking-double').value) || 0,
        bookingDoubleEco: parseFloat(document.getElementById('cfg-booking-double-eco').value) || 0,
        bookingTriple: parseFloat(document.getElementById('cfg-booking-triple').value) || 0,
        bookingIndividual: parseFloat(document.getElementById('cfg-booking-individual').value) || 0
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
    const taxRate = getTouristTaxRate(checkInDate);
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
    document.getElementById('resultClientPrice').textContent = formatCurrency(clientPrice);

    // Expected booking
    document.getElementById('resultBookingExpected').textContent = formatCurrency(roomPrice * 1.03);

    document.getElementById('resultsContainer').style.display = 'block';
    document.getElementById('noResultsMessage').style.display = 'none';

    // Save state for printing/comparing
    window.currentQuotation = {
        nights, adults, rooms, webBaseTotal, roomPrice, clientPrice, touristTax,
        loyaltyAmount, mobileAmount, directAmount,
        directDiscountPercent: directDiscountPct * 100,
        checkIn: checkInDate,
        checkOut: document.getElementById('checkOut').value,
        roomType: roomsDesc.join(', '),
        regime,
        children: parseInt(document.getElementById('children').value) || 0,
        babies: parseInt(document.getElementById('babies').value) || 0
    };
}

function getTouristTaxRate(dateStr) {
    const date = new Date(dateStr);
    const lowStart = TOURIST_TAX_RATES.lowSeason.start;
    const lowEnd = TOURIST_TAX_RATES.lowSeason.end;
    return (date >= lowStart && date <= lowEnd) ? LOW_SEASON_RATE : HIGH_SEASON_RATE;
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
    q.guestEmail = document.getElementById('guestEmail').value;
    q.guestPhone = document.getElementById('guestPhone').value;
    q.reservationNumber = document.getElementById('reservationNumber').value;
    q.language = document.getElementById('quotationLanguage').value;

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
