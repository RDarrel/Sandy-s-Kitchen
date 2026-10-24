const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const dateToUTC = require("../utilities/dateToUTC");

const firstDay = new Date("2026-10-23T16:00:00Z");
const secondDay = new Date("2026-10-24T16:00:00Z");
const range = { startDate: "2026-10-24", endDate: "2026-10-25" };

const loadService = ({ orders = [], payments = [], refunds = [], outstanding = [] } = {}) => {
  const pipelines = [];
  const aggregate = (name, data) => async (pipeline) => {
    pipelines.push({ name, pipeline });
    return data;
  };
  const moduleStub = { exports: {} };
  const dependencies = {
    "../models/events/Payment": { collection: { name: "payments" }, aggregate: aggregate("payments", payments) },
    "../models/events/Booking": { aggregate: async (pipeline) => {
      pipelines.push({ name: "bookings", pipeline });
      return pipeline[0].$match["cancellation.refund.status"] ? refunds : outstanding;
    } },
    "../models/sales/order/Order": { aggregate: aggregate("orders", orders) },
    "../utilities/dateToUTC": dateToUTC,
  };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/Dashbord.service.js`, "utf8"), {
    module: moduleStub, require: (name) => dependencies[name] || {}, Date,
  });
  return { service: moduleStub.exports, pipelines };
};

test("collections deduct refunds by period, including a refund-only period", async () => {
  const { service, pipelines } = loadService({
    orders: [{ _id: firstDay, totalAmount: 500 }],
    payments: [{ _id: firstDay, totalAmount: 10000 }],
    refunds: [{ _id: firstDay, totalAmount: 2000 }, { _id: secondDay, totalAmount: 1000 }],
  });
  const result = await service.getCollections(range);
  assert.equal(result.overview[0].booking, 8000);
  assert.equal(result.overview[1].booking, -1000);
  assert.equal(result.bySource.find((item) => item.name === "booking").value, 7000);
  assert.equal(result.totalCollections, 7500);
  const refundQuery = pipelines.find((item) => item.name === "bookings").pipeline;
  assert.equal(refundQuery[0].$match["cancellation.refund.status"], "completed");
  assert.ok(refundQuery[0].$match["cancellation.refund.refundedAt"].$gte);
});

test("summary nets completed refunds in collections and trends while preserving outstanding totals", async () => {
  const { service, pipelines } = loadService({
    orders: [{ summary: [{ totalAmount: 500, transactions: 1 }], trends: [{ _id: firstDay, amount: 500 }] }],
    payments: [{ summary: [{ totalAmount: 10000, verifiedPayments: 2 }], trends: [{ _id: firstDay, amount: 10000 }] }],
    refunds: [{ summary: [{ totalAmount: 3000, completedRefunds: 2 }], trends: [{ _id: firstDay, amount: 2000 }, { _id: secondDay, amount: 1000 }] }],
    outstanding: [{ outstandingBalance: 4000, bookingsWithBalance: 2 }],
  });
  const result = await service.getSummary(range);
  assert.equal(result.bookingCollections, 7000);
  assert.equal(result.totalCollections, 7500);
  assert.equal(result.verifiedPayments, 2);
  assert.equal(result.completedRefunds, 2);
  assert.equal(result.bookingTransactions, 4);
  assert.equal(result.outstandingBalance, 4000);
  assert.equal(result.bookingsWithBalance, 2);
  assert.equal(result.trends[0].total, 8500);
  assert.equal(result.trends[1].total, -1000);
  assert.equal(result.trends.reduce((total, item) => total + item.total, 0), result.totalCollections);
  const refundQuery = pipelines.find((item) => item.pipeline[0].$match["cancellation.refund.status"]).pipeline;
  assert.equal(refundQuery[0].$match["cancellation.refund.status"], "completed");
  assert.ok(refundQuery[0].$match["cancellation.refund.refundedAt"].$lte);
});

test("outstanding query includes all eligible bookings and subtracts only verified payments per booking", async () => {
  const { service, pipelines } = loadService();
  await service.getSummary(range);
  const query = pipelines.find((item) => item.pipeline[0].$match.status?.$in).pipeline;
  assert.equal(query[0].$match.status.$in.join(","), "confirmed,setup,completed");
  assert.equal(Object.keys(query[0].$match).join(","), "status");
  assert.equal(query[1].$lookup.pipeline[0].$match.status, "verified");
  assert.equal(query[3].$project.remainingBalance.$max[0].$subtract[0].$ifNull[0], "$pricing.total");
  assert.equal(query[3].$project.remainingBalance.$max[1], 0);
  assert.equal(query[4].$group.outstandingBalance.$sum, "$remainingBalance");
});

test("empty collections and summary return zero amounts", async () => {
  const { service } = loadService();
  const summary = await service.getSummary(range);
  const collections = await service.getCollections(range);
  assert.equal(summary.totalCollections, 0);
  assert.equal(summary.bookingTransactions, 0);
  assert.equal(summary.outstandingBalance, 0);
  assert.equal(collections.totalCollections, 0);
});
