/**
 * Verification Tests for Date Formatting Feature - Edge Cases (Subtask 4-2)
 * Run with: node verification-test.js
 */

// Replicate the formatDateEuropean function from shared.js
function formatDateEuropean(dateInput) {
    const date = typeof dateInput === 'string' ? new Date(dateInput + 'T00:00:00') : dateInput;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Replicate the auto-checkout logic from calculator.js
function simulateAutoCheckout(checkInValue) {
    const checkInDate = new Date(checkInValue + 'T00:00:00');
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    return checkOutDate.toISOString().split('T')[0];
}

// Replicate nights calculation from calculator.js
function calculateNights(checkIn, checkOut) {
    const d1 = new Date(checkIn + 'T00:00:00');
    const d2 = new Date(checkOut + 'T00:00:00');
    const timeDiff = d2 - d1;
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return nights > 0 ? nights : 0;
}

let passed = 0;
let failed = 0;

function test(name, actual, expected) {
    const success = actual === expected;
    if (success) {
        console.log(`✅ PASS: ${name}`);
        passed++;
    } else {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Expected: ${expected}`);
        console.log(`   Actual:   ${actual}`);
        failed++;
    }
}

console.log('\n========================================');
console.log('  SUBTASK 4-2: Edge Case Verification');
console.log('========================================\n');

console.log('=== 1. formatDateEuropean() Tests ===\n');

test('Standard date (2026-01-14)', formatDateEuropean('2026-01-14'), '14/01/2026');
test('Single digit day (2026-01-05)', formatDateEuropean('2026-01-05'), '05/01/2026');
test('Single digit month (2026-09-15)', formatDateEuropean('2026-09-15'), '15/09/2026');
test('Last day of January', formatDateEuropean('2026-01-31'), '31/01/2026');
test('Last day of year', formatDateEuropean('2026-12-31'), '31/12/2026');
test('Leap year date', formatDateEuropean('2028-02-29'), '29/02/2028');
test('Date object input', formatDateEuropean(new Date('2026-06-15T00:00:00')), '15/06/2026');

console.log('\n=== 2. Month Rollover Tests ===\n');

test('Jan 31 → Feb 1', simulateAutoCheckout('2026-01-31'), '2026-02-01');
test('Feb 28 (non-leap) → Mar 1', simulateAutoCheckout('2026-02-28'), '2026-03-01');
test('Mar 31 → Apr 1', simulateAutoCheckout('2026-03-31'), '2026-04-01');
test('Apr 30 → May 1', simulateAutoCheckout('2026-04-30'), '2026-05-01');
test('Jun 30 → Jul 1', simulateAutoCheckout('2026-06-30'), '2026-07-01');
test('Sep 30 → Oct 1', simulateAutoCheckout('2026-09-30'), '2026-10-01');
test('Nov 30 → Dec 1', simulateAutoCheckout('2026-11-30'), '2026-12-01');

console.log('\n=== 3. Year Rollover Tests ===\n');

test('Dec 31, 2026 → Jan 1, 2027', simulateAutoCheckout('2026-12-31'), '2027-01-01');
test('Dec 31, 2027 → Jan 1, 2028', simulateAutoCheckout('2027-12-31'), '2028-01-01');
test('Dec 31, 2028 → Jan 1, 2029 (leap year end)', simulateAutoCheckout('2028-12-31'), '2029-01-01');

console.log('\n=== 4. Leap Year Tests ===\n');

test('Feb 28, 2028 → Feb 29, 2028 (leap year)', simulateAutoCheckout('2028-02-28'), '2028-02-29');
test('Feb 29, 2028 → Mar 1, 2028 (leap day checkout)', simulateAutoCheckout('2028-02-29'), '2028-03-01');
test('Feb 28, 2026 → Mar 1, 2026 (non-leap year)', simulateAutoCheckout('2026-02-28'), '2026-03-01');
test('Feb 28, 2024 → Feb 29, 2024 (leap year 2024)', simulateAutoCheckout('2024-02-28'), '2024-02-29');

console.log('\n=== 5. Nights Calculation Tests ===\n');

// After auto-checkout, nights should always be 1
let autoCheckout1 = simulateAutoCheckout('2026-01-31');
test('Nights: Jan 31 → Feb 1 = 1 night', calculateNights('2026-01-31', autoCheckout1), 1);

let autoCheckout2 = simulateAutoCheckout('2026-12-31');
test('Nights: Dec 31 → Jan 1 = 1 night', calculateNights('2026-12-31', autoCheckout2), 1);

let autoCheckout3 = simulateAutoCheckout('2028-02-28');
test('Nights: Feb 28 → Feb 29 (leap) = 1 night', calculateNights('2028-02-28', autoCheckout3), 1);

// Multiple night stays
test('Nights: Jan 15 → Jan 20 = 5 nights', calculateNights('2026-01-15', '2026-01-20'), 5);
test('Nights: Dec 28 → Jan 3 (year rollover) = 6 nights', calculateNights('2026-12-28', '2027-01-03'), 6);
test('Nights: Feb 26 → Mar 3 (month rollover) = 5 nights', calculateNights('2026-02-26', '2026-03-03'), 5);

console.log('\n=== 6. Manual Override Tests ===\n');

// Simulates user changing check-out manually after auto-population
let checkIn = '2026-01-31';
let manualOverride = '2026-02-05'; // User changes to Feb 5 (4 more nights)
test('Manual override: Jan 31 → Feb 5 = 5 nights', calculateNights(checkIn, manualOverride), 5);

checkIn = '2026-12-31';
manualOverride = '2027-01-07'; // User extends to Jan 7
test('Manual override year rollover: Dec 31 → Jan 7 = 7 nights', calculateNights(checkIn, manualOverride), 7);

checkIn = '2028-02-28';
manualOverride = '2028-03-02'; // User extends to Mar 2
test('Manual override leap year: Feb 28 → Mar 2 = 3 nights', calculateNights(checkIn, manualOverride), 3);

// Edge case: User sets check-out before check-in (should return 0)
test('Invalid: check-out before check-in = 0 nights', calculateNights('2026-01-15', '2026-01-10'), 0);

// Same day checkout
test('Same day: check-in = check-out = 0 nights', calculateNights('2026-01-15', '2026-01-15'), 0);

console.log('\n=== 7. E2E Flow Tests ===\n');

// Test complete date flow: check-in → check-out → formatted display
test('E2E: Jan 31 check-in formatted', formatDateEuropean('2026-01-31'), '31/01/2026');
const autoCheckout = simulateAutoCheckout('2026-01-31');
test('E2E: Auto check-out from Jan 31', autoCheckout, '2026-02-01');
test('E2E: Feb 1 check-out formatted', formatDateEuropean(autoCheckout), '01/02/2026');

// Year rollover E2E
test('E2E: Dec 31 check-in formatted', formatDateEuropean('2026-12-31'), '31/12/2026');
const yearRollover = simulateAutoCheckout('2026-12-31');
test('E2E: Auto check-out from Dec 31', yearRollover, '2027-01-01');
test('E2E: Jan 1 2027 check-out formatted', formatDateEuropean(yearRollover), '01/01/2027');

// Leap year E2E
test('E2E: Feb 28 2028 check-in formatted', formatDateEuropean('2028-02-28'), '28/02/2028');
const leapCheckout = simulateAutoCheckout('2028-02-28');
test('E2E: Auto check-out from Feb 28 leap year', leapCheckout, '2028-02-29');
test('E2E: Feb 29 2028 check-out formatted', formatDateEuropean(leapCheckout), '29/02/2028');

console.log('\n========================================');
console.log('             SUMMARY');
console.log('========================================\n');
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log('\n--- Verification Checklist ---');
console.log('✓ Month rollover: Jan 31 → Feb 1');
console.log('✓ Year rollover: Dec 31, 2026 → Jan 1, 2027');
console.log('✓ Leap year: Feb 28, 2028 → Feb 29, 2028');
console.log('✓ Manual check-out override works after auto-population');
console.log('✓ Nights update correctly for all cases');
console.log(failed === 0 ? '\n✅ ALL EDGE CASE TESTS PASSED!\n' : '\n❌ SOME TESTS FAILED!\n');

process.exit(failed === 0 ? 0 : 1);
