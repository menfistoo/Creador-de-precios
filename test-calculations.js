// Simple verification test for calculation logic
// Simulating the test scenario: Doble room, 100€/night, 2 nights, 2 adults

// Helper function from shared.js
function formatCurrency(val) {
    return parseFloat(val).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Simulate calculation flow
const testCase = {
    roomType: 'Doble',
    pricePerNight: 100,
    nights: 2,
    adults: 2,
    directDiscountPct: 7, // 7%
    bookingPrice: 200, // Entered Booking price with tourist tax
    bookingMobileDiscountPct: 10 // 10%
};

// Step 1: Calculate main quotation
const webBaseTotal = testCase.pricePerNight * 1 * testCase.nights; // 100 * 1 * 2 = 200

const loyaltyDiscount = 0.05;
const mobileDiscount = 0.10;
const directDiscountPct = testCase.directDiscountPct / 100;

const loyaltyAmount = webBaseTotal * loyaltyDiscount; // 200 * 0.05 = 10
const afterLoyalty = webBaseTotal - loyaltyAmount; // 200 - 10 = 190
const mobileAmount = afterLoyalty * mobileDiscount; // 190 * 0.10 = 19
const roomPrice = afterLoyalty - mobileAmount; // 190 - 19 = 171

const directAmount = roomPrice * directDiscountPct; // 171 * 0.07 = 11.97
const clientPrice = roomPrice - directAmount; // 171 - 11.97 = 159.03

// Tourist tax (High season = 3.3 per adult/day, max 8 days at full rate)
const taxRate = 3.3; // High season
const fullRateNights = Math.min(testCase.nights, 8); // 2
const touristTax = fullRateNights * taxRate * testCase.adults; // 2 * 3.3 * 2 = 13.2

console.log('=== MAIN QUOTATION ===');
console.log('Web Base Total: ' + formatCurrency(webBaseTotal));
console.log('Loyalty Discount (5%): ' + formatCurrency(loyaltyAmount));
console.log('Mobile Discount (10%): ' + formatCurrency(mobileAmount));
console.log('Room Price: ' + formatCurrency(roomPrice));
console.log('Direct Discount (' + testCase.directDiscountPct + '%): ' + formatCurrency(directAmount));
console.log('Client Price (TOTAL): ' + formatCurrency(clientPrice));
console.log('Tourist Tax (Informative): ' + formatCurrency(touristTax));

// Step 2: Calculate Booking comparison with CORRECT commission formula
const bookingBase = testCase.bookingPrice - touristTax; // 200 - 13.2 = 186.8
const bookingMobileDiscountPctVal = testCase.bookingMobileDiscountPct / 100; // 0.10

const bookingMobileDiscount = bookingBase * bookingMobileDiscountPctVal; // 186.8 * 0.10 = 18.68
const bookingAfterMobile = bookingBase - bookingMobileDiscount; // 186.8 - 18.68 = 168.12

// NEW CORRECT COMMISSION FORMULA:
// effectiveCommission = baseCommission - bookingPays (NOT a simple discount!)
const baseCommissionPct = 0.17; // 17% base Booking.com commission
const bookingPaysPct = 0.08; // 8% that Booking pays for Doble room type
const effectiveCommissionPct = baseCommissionPct - bookingPaysPct; // 0.17 - 0.08 = 0.09 (9%)
const commissionAmount = bookingAfterMobile * effectiveCommissionPct; // 168.12 * 0.09 = 15.1308
const hotelNetRevenue = bookingAfterMobile - commissionAmount; // 168.12 - 15.1308 = 152.9892

// Direct booking net revenue = clientPrice (hotel keeps 100% of direct bookings)
const directNetRevenue = clientPrice; // 159.03

// Calculate percentage differential: ((directNet - bookingNet) / bookingNet) × 100
const percentageGain = ((directNetRevenue - hotelNetRevenue) / hotelNetRevenue) * 100; // ~3.95%

// Calculate raw difference
const difference = hotelNetRevenue - directNetRevenue; // 152.99 - 159.03 = -6.04

console.log('\n=== BOOKING COMPARISON (CORRECT COMMISSION FORMULA) ===');
console.log('Booking Price Input: ' + formatCurrency(testCase.bookingPrice));
console.log('Booking Base (minus tourist tax): ' + formatCurrency(bookingBase));
console.log('Booking Mobile Discount (' + testCase.bookingMobileDiscountPct + '%): ' + formatCurrency(bookingMobileDiscount));
console.log('Booking After Mobile: ' + formatCurrency(bookingAfterMobile));
console.log('Base Commission: ' + (baseCommissionPct * 100) + '%');
console.log('Booking Pays: ' + (bookingPaysPct * 100) + '%');
console.log('Effective Commission: ' + (effectiveCommissionPct * 100) + '% (= ' + (baseCommissionPct * 100) + '% - ' + (bookingPaysPct * 100) + '%)');
console.log('Commission Amount: ' + formatCurrency(commissionAmount));
console.log('Hotel Net Revenue (Booking): ' + formatCurrency(hotelNetRevenue));

console.log('\n=== COMPARISON RESULT (NET HOTEL REVENUE) ===');
console.log('Direct Net Revenue: ' + formatCurrency(directNetRevenue));
console.log('Booking Net Revenue: ' + formatCurrency(hotelNetRevenue));
console.log('Difference: ' + formatCurrency(difference));
console.log('Percentage Gain: ' + (percentageGain >= 0 ? '+' : '') + percentageGain.toFixed(2) + '%');

if (percentageGain >= 0) {
    console.log('RESULT: Direct booking generates ' + percentageGain.toFixed(2) + '% MORE net revenue for the hotel');
} else {
    console.log('RESULT: Booking generates ' + Math.abs(percentageGain).toFixed(2) + '% more net revenue');
}

// Verification checks
console.log('\n=== VERIFICATION CHECKS ===');
const tests = [
    // Main quotation tests (unchanged)
    { name: 'Web Base Total is 200', expected: 200, actual: webBaseTotal },
    { name: 'Loyalty Amount is 10', expected: 10, actual: loyaltyAmount },
    { name: 'Mobile Amount is 19', expected: 19, actual: mobileAmount },
    { name: 'Room Price is 171', expected: 171, actual: roomPrice },
    { name: 'Direct Amount is ~11.97', expected: 11.97, actual: directAmount, tolerance: 0.01 },
    { name: 'Client Price is ~159.03', expected: 159.03, actual: clientPrice, tolerance: 0.01 },
    { name: 'Tourist Tax is 13.2', expected: 13.2, actual: touristTax },

    // Booking comparison base tests
    { name: 'Booking Base is ~186.8', expected: 186.8, actual: bookingBase, tolerance: 0.01 },
    { name: 'Booking Mobile Discount is ~18.68', expected: 18.68, actual: bookingMobileDiscount, tolerance: 0.01 },
    { name: 'Booking After Mobile is ~168.12', expected: 168.12, actual: bookingAfterMobile, tolerance: 0.01 },

    // NEW COMMISSION FORMULA TESTS
    { name: 'Effective Commission is 9% (17% - 8%)', expected: 0.09, actual: effectiveCommissionPct, tolerance: 0.001 },
    { name: 'Commission Amount is ~15.13', expected: 15.1308, actual: commissionAmount, tolerance: 0.01 },
    { name: 'Hotel Net Revenue (Booking) is ~152.99', expected: 152.9892, actual: hotelNetRevenue, tolerance: 0.01 },

    // NET REVENUE COMPARISON TESTS
    { name: 'Direct Net Revenue is ~159.03', expected: 159.03, actual: directNetRevenue, tolerance: 0.01 },
    { name: 'Percentage Gain is ~3.95%', expected: 3.95, actual: percentageGain, tolerance: 0.1 },
];

let allPassed = true;
tests.forEach(function(test) {
    const tolerance = test.tolerance || 0.001;
    const passed = Math.abs(test.expected - test.actual) < tolerance;
    console.log((passed ? 'PASS' : 'FAIL') + ' ' + test.name + ': ' + test.actual.toFixed(2) + ' (expected: ' + test.expected + ')');
    if (!passed) allPassed = false;
});

console.log('\n' + (allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'));
process.exit(allPassed ? 0 : 1);
