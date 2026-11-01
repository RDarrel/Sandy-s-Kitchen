import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { bookings } from "./data.js";
import { toBookingRow } from "./bookingRow.js";

const require = createRequire(import.meta.url);
const Booking = require("../../../../../../models/events/Booking.js");
const Payment = require("../../../../../../models/events/Payment.js");

test("sample API records validate against Booking and Payment schemas", async () => {
  for (const booking of bookings) {
    await assert.doesNotReject(() => new Booking(booking).validate(), booking.reference);
    for (const payment of booking.payments) {
      await assert.doesNotReject(() => new Payment(payment).validate(), payment.reference);
      assert.equal(payment.booking, booking._id);
    }
    assert.equal(booking.pricing.total, (booking.pricing.catering?.total || 0) + (booking.pricing.venue?.total || 0));
    const earliestStart = Math.min(...[booking.catering, booking.venue].filter(Boolean).map((service) => Date.parse(service.schedule.startAt)));
    assert.equal(Date.parse(booking.date), earliestStart);
  }
});

test("verified totals exclude pending, voided, and refunded payments", () => {
  const original = bookings.find((booking) => booking.payments.some((payment) => payment.status === "pending"));
  const snapshot = JSON.stringify(original);
  const row = toBookingRow({
    ...original,
    payments: [...original.payments, { status: "voided", amount: 10000 }, { status: "refunded", amount: 5000 }],
  });
  assert.equal(row.paid, 35000);
  assert.equal(row.pendingPayment, 15000);
  assert.equal(row.amount - row.paid, 100000);
  assert.equal(JSON.stringify(original), snapshot);
});

test("both-type rows use venue dates and retain separate guest counts in Manila time", () => {
  const record = bookings.find((booking) => booking.bookingType === "both");
  const row = toBookingRow(record);
  assert.equal(row.date, "2026-11-05");
  assert.equal(row.time, "10:00 AM – 10:00 PM");
  assert.deepEqual(row.serviceSchedules.map(({ service, guests }) => [service, guests]), [["Catering", 100], ["Venue", 120]]);
  assert.equal(row.serviceSchedules[1].endDate, "2026-11-06");
  assert.equal(row.record, record);
  assert.equal(row.id, record.reference);
});

test("unpopulated customer and missing optional fields use safe display fallbacks", () => {
  const row = toBookingRow({ _id: "test-booking", customer: "customer-id", contact: { name: "Walk-in customer", email: "walkin@example.com" }, bookingType: "venue", status: "changes_requested", pricing: { total: 12000 } });
  assert.equal(row.customer, "Walk-in customer");
  assert.equal(row.email, "walkin@example.com");
  assert.equal(row.status, "Changes Requested");
  assert.equal(row.paid, 0);
  assert.equal(row.pendingPayment, 0);
  assert.equal(row.date, null);
});
