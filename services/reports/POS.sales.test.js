const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const runReport = async (frequency) => {
  let pipeline;
  const moduleStub = { exports: {} };
  const rows = [{ date: "2026-09-30T16:00:00Z", items: [
    { date: "2026-09-30T16:00:00Z", menu: { _id: "menu" }, quantity: 2, amount: 300, totalCost: 100 },
    { date: "2026-10-01T16:00:00Z", menu: { _id: "menu" }, quantity: 1, amount: 150, totalCost: 50 },
  ] }];
  const dependencies = {
    "../../models/sales/order/Order": { aggregate: async () => [{ totalSales: 450, totalOrders: 3 }] },
    "../../models/sales/order/OrderItem": { aggregate: async (stages) => {
      pipeline = stages;
      return [{ summary: [{ totalCost: 150 }], salesBreakdown: rows }];
    } },
    "../../utilities/dateToUTC": require("../../utilities/dateToUTC"),
  };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/POS.service.js`, "utf8"), { module: moduleStub, require: (name) => dependencies[name] });
  const report = await moduleStub.exports.getSalesReport({ startDate: "2026-10-01", endDate: "2026-10-31", frequency });
  return { report, pipeline: JSON.parse(JSON.stringify(pipeline)) };
};

for (const [frequency, unit] of [["weekly", "week"], ["monthly", "month"], ["yearly", "year"]]) {
  test(`${frequency} keeps separate menu/day rows inside its period`, async () => {
    const { pipeline, report } = await runReport(frequency);
    const stages = pipeline.find((stage) => stage.$facet).$facet.salesBreakdown;
    const group = stages[0].$group;
    assert.equal(group._id.date.$dateTrunc.unit, unit);
    assert.deepEqual(group._id.day.$dateTrunc, { date: "$createdAt", unit: "day", timezone: "Asia/Manila" });
    assert.equal(group._id.menu, "$menu");
    assert.equal(stages.find((stage) => stage.$project?.item).$project.item.date, "$_id.day");
    assert.equal(stages.find((stage) => stage.$sort?.["item.date"]).$sort["item.date"], -1);
    assert.equal(report.summary.totalSales, 450);
    assert.equal(report.summary.totalCost, 150);
    assert.equal(report.summary.grossProfit, 300);
    assert.equal(report.summary.totalOrders, 3);
  });
}

test("daily retains individual timestamps and records", async () => {
  const { pipeline } = await runReport("daily");
  const stages = pipeline.find((stage) => stage.$facet).$facet.salesBreakdown;
  const group = stages.find((stage) => stage.$group).$group;
  assert.equal(group._id.$dateTrunc.unit, "day");
  assert.equal(group.items.$push.createdAt, "$createdAt");
  assert.equal(group.items.$push._id, "$_id");
});
