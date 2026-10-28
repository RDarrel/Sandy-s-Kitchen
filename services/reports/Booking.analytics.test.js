const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const loadService = (result) => {
  let pipeline;
  const moduleStub = { exports: {} };
  const dependencies = {
    luxon: require("luxon"),
    "../../models/events/Payment": {},
    "../../models/events/Booking": { aggregate: async (stages) => {
      pipeline = stages;
      return result ? [result] : [];
    } },
    "../../utilities/dateToUTC": require("../../utilities/dateToUTC"),
  };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/Booking.service.js`, "utf8"), {
    module: moduleStub, require: (name) => dependencies[name],
  });
  return {
    getAnalytics: moduleStub.exports.getAnalytics,
    pipeline: () => pipeline && JSON.parse(JSON.stringify(pipeline)),
  };
};
const dates = { startDate: "2026-10-01", endDate: "2026-10-31" };

test("analytics matches only eligible nondeleted bookings inside Manila event-date boundaries", async () => {
  const service = loadService();
  await service.getAnalytics(dates);
  const match = service.pipeline()[0].$match;
  assert.deepEqual(match.status.$in, ["confirmed", "setup", "completed"]);
  assert.equal(match.deletedAt, null);
  for (const field of ["catering.schedule.startAt", "venue.schedule.startAt"]) {
    const range = match.$or.find((item) => item[field])[field];
    assert.equal(range.$gte, "2026-09-30T16:00:00.000Z");
    assert.equal(range.$lte, "2026-10-31T15:59:59.999Z");
  }
  const facet = service.pipeline().find((stage) => stage.$facet).$facet;
  assert.equal(facet.trends[0].$group._id.$dateTrunc.timezone, "Asia/Manila");
  for (const key of ["packages", "venues", "dishes", "customers"]) {
    const stages = facet[key];
    const limit = stages.findIndex((stage) => stage.$limit === 5);
    assert.ok(limit > stages.findIndex((stage) => stage.$group));
    assert.ok(limit < stages.findIndex((stage) => stage.$lookup));
    assert.equal(stages[limit - 1].$sort.bookings, -1);
  }
  assert.ok(facet.dishes[0].$set.dish.$setUnion);
});

test("analytics returns the Redux contract and calculates share against ALL bookings, not top five", async () => {
  const service = loadService({
    summary: [{ totalBookings: 20, totalBookingValue: 100000, averageBookingValue: 5000 }],
    trends: [{ date: "2026-09-30T16:00:00.000Z", bookings: 20, value: 100000 }],
    packages: [{ _id: "package", name: "Classic", bookings: 5, value: 25000 }],
  });
  const report = await service.getAnalytics(dates);
  assert.equal(report.packages[0].percentage, 25);
  assert.equal(report.summary.totalBookings, 20);
  assert.equal(report.trends[0].bookings, 20);
  assert.equal(report.venues.length, 0);
  assert.equal(report.dishes.length, 0);
  assert.equal(report.customers.length, 0);
});

test("empty analytics returns zeros and arrays", async () => {
  const report = await loadService().getAnalytics(dates);
  assert.equal(report.summary.totalBookings, 0);
  assert.equal(report.summary.totalBookingValue, 0);
  assert.equal(report.summary.averageBookingValue, 0);
  for (const key of ["trends", "packages", "venues", "dishes", "customers"]) assert.equal(report[key].length, 0);
});

test("invalid or inverted date ranges fail before querying", async () => {
  const service = loadService();
  for (const range of [{}, { startDate: "invalid", endDate: dates.endDate }, { startDate: dates.endDate, endDate: dates.startDate }]) {
    await assert.rejects(service.getAnalytics(range), (error) => error.status === 400);
  }
  assert.equal(service.pipeline(), undefined);
});
