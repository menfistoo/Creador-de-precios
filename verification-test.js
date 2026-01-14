/**
 * Verification Tests for Date Formatting Feature
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

console.log('\n=== formatDateEuropean() Tests ===\n');

test('Standard date (2026-01-14)', formatDateEuropean('2026-01-14'), '14/01/2026');
test('Single digit day (2026-01-05)', formatDateEuropean('2026-01-05'), '05/01/2026');
test('Single digit month (2026-09-15)', formatDateEuropean('2026-09-15'), '15/09/2026');
test('Last day of January', formatDateEuropean('2026-01-31'), '31/01/2026');
test('Last day of year', formatDateEuropean('2026-12-31'), '31/12/2026');
test('Leap year date', formatDateEuropean('2028-02-29'), '29/02/2028');
test('Date object input', formatDateEuropean(new Date('2026-06-15T00:00:00')), '15/06/2026');

console.log('\n=== Auto Check-out Rollover Tests ===\n');

test('Month rollover (Jan 31 → Feb 1)', simulateAutoCheckout('2026-01-31'), '2026-02-01');
test('Year rollover (Dec 31 → Jan 1)', simulateAutoCheckout('2026-12-31'), '2027-01-01');
test('Leap year (Feb 28 → Feb 29 in 2028)', simulateAutoCheckout('2028-02-28'), '2028-02-29');
test('Non-leap year (Feb 28 → Mar 1 in 2026)', simulateAutoCheckout('2026-02-28'), '2026-03-01');
test('Regular day (May 15)', simulateAutoCheckout('2026-05-15'), '2026-05-16');
test('End of short month (Apr 30)', simulateAutoCheckout('2026-04-30'), '2026-05-01');

console.log('\n=== E2E Flow Tests ===\n');

// Test complete date flow: check-in → check-out → formatted display
test('E2E: Jan 31 check-in formatted', formatDateEuropean('2026-01-31'), '31/01/2026');
const autoCheckout = simulateAutoCheckout('2026-01-31');
test('E2E: Auto check-out from Jan 31', autoCheckout, '2026-02-01');
test('E2E: Feb 1 check-out formatted', formatDateEuropean(autoCheckout), '01/02/2026');

console.log('\n=== SUMMARY ===\n');
console.log(`Total tests: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(failed === 0 ? '\n✅ ALL TESTS PASSED!\n' : '\n❌ SOME TESTS FAILED!\n');

process.exit(failed === 0 ? 0 : 1);
