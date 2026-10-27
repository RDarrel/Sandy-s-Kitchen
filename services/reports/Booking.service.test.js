const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const runReport = async ({ payments = [], refunds = [], summary = [], frequency } = {}) => {
  let refundPipeline;
  const moduleStub = { exports: {} };
  const dependencies = {
    luxon: require("luxon"),
    "../../models/events/Payment": { aggregate: async () => [{ payments, summary: [] }] },
    "../../models/events/Booking": {
      aggregate: async (pipeline) => {
        refundPipeline = pipeline;
        return [{ refunds, summary }];
      },
      populate: async (records) => records,
    },
    "../../utilities/dateToUTC": ({ date }) => new Date(date),
  };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/Booking.service.js`, "utf8"), {
    module: moduleStub, require: (name) => dependencies[name],
  });
  const report = await moduleStub.exports.getPaymentReport({ startDate: "2026-10-01", endDate: "2026-10-31", frequency });
  return { report, pipeline: JSON.parse(JSON.stringify(refundPipeline)) };
};

test("queries pending and completed refunds but filters the summary to completed before grouping", async () => {
  const { pipeline } = await runReport();
  assert.deepEqual(pipeline[0].$match["cancellation.refund.status"].$in, ["pending", "completed"]);
  const facet = pipeline.find((stage) => stage.$facet).$facet;
  assert.deepEqual(facet.summary[0], { $match: { "cancellation.refund.status": "completed" } });
  assert.ok(facet.summary[1].$group.totalRefunds);
  assert.ok(facet.summary[1].$group.totalRefundedAmount);
  assert.equal(facet.refunds.some((stage) => stage.$match), false);
});

test("date filtering uses the refund date for completed and account/cancellation date for pending", async () => {
  const { pipeline } = await runReport();
  assert.deepEqual(pipeline[1].$addFields.transactionDate, {
    $cond: [
      { $eq: ["$cancellation.refund.status", "completed"] },
      "$cancellation.refund.refundedAt",
      { $ifNull: ["$cancellation.refund.accountProvidedAt", "$cancellation.cancelledAt"] },
    ],
  });
  assert.ok(pipeline[2].$match.transactionDate.$gte);
  assert.ok(pipeline[2].$match.transactionDate.$lte);
});

test("interleaves payments and refunds newest first and preserves zero refund totals for pending-only results", async () => {
  const { report } = await runReport({
    payments: [
      { _id: "pay-old", createdAt: "2026-10-01" },
      { _id: "pay-new", createdAt: "2026-10-23" },
    ],
    refunds: [{
      _id: "booking-id", transactionDate: "2026-10-22",
      cancellation: { refund: { status: "pending", amount: 5000 } },
    }],
  });
  assert.equal(report.payments.map((item) => item._id || item.booking._id).join(","), "pay-new,booking-id,pay-old");
  assert.equal(report.payments[1].createdAt, "2026-10-22");
  assert.equal(report.summary.totalRefunds, 0);
  assert.equal(report.summary.totalRefundedAmount, 0);
});

test("keeps the completed-refund summary returned by the aggregation", async () => {
  const { report } = await runReport({ summary: [{ totalRefunds: 2, totalRefundedAmount: 7500 }] });
  assert.equal(report.summary.totalRefunds, 2);
  assert.equal(report.summary.totalRefundedAmount, 7500);
});

for (const [frequency, before, after, expected] of [
  ["daily", "2026-10-25T15:59:59Z", "2026-10-25T16:00:00Z", "2026-10-25T16:00:00.000Z"],
  ["weekly", "2026-10-25T15:59:59Z", "2026-10-25T16:00:00Z", "2026-10-25T16:00:00.000Z"],
  ["monthly", "2026-10-31T15:59:59Z", "2026-10-31T16:00:00Z", "2026-10-31T16:00:00.000Z"],
  ["yearly", "2026-12-31T15:59:59Z", "2026-12-31T16:00:00Z", "2026-12-31T16:00:00.000Z"],
]) {
  test(`${frequency} groups use Manila boundaries and combine payments with refunds`, async () => {
    const { report } = await runReport({
      frequency,
      payments: [
        { _id: "old", createdAt: before },
        { _id: "new", createdAt: after },
      ],
      refunds: [{
        _id: "refund-booking", transactionDate: after,
        cancellation: { refund: { status: "completed", amount: 100 } },
      }],
    });
    assert.equal(report.paymentBreakdown.length, 2);
    assert.equal(report.paymentBreakdown[0].date, expected);
    assert.equal(report.paymentBreakdown[0].items.length, 2);
    assert.equal(report.paymentBreakdown[0].items.some((item) => item.transactionType === "refund"), true);
    assert.equal(report.paymentBreakdown[1].items[0]._id, "old");
    assert.equal(report.payments.length, 3);
  });
}

test("defaults to daily grouping, including unsupported frequencies, and handles empty reports", async () => {
  const payments = [{ _id: "pay", createdAt: "2026-10-27T04:00:00Z" }];
  const daily = await runReport({ payments });
  const unsupported = await runReport({ payments, frequency: "constructor" });
  assert.equal(daily.report.paymentBreakdown[0].date, "2026-10-26T16:00:00.000Z");
  assert.equal(unsupported.report.paymentBreakdown[0].date, daily.report.paymentBreakdown[0].date);
  assert.equal((await runReport()).report.paymentBreakdown.length, 0);
});
