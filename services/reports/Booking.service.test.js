const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const runReport = async ({ payments = [], refunds = [], summary = [] } = {}) => {
  let refundPipeline;
  const moduleStub = { exports: {} };
  const dependencies = {
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
  const report = await moduleStub.exports.getPaymentReport({ startDate: "2026-10-01", endDate: "2026-10-31" });
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
