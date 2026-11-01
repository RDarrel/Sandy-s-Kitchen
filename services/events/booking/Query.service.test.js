const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const runQuery = async (options, result = { bookings: [], total: [] }) => {
  let pipeline;
  let populatedBookings;
  let populatedPayments;
  let recipeBookings;
  const moduleStub = { exports: {} };
  const dependencies = {
    "../../../models/events/Booking": {
      aggregate: async (stages) => {
        pipeline = JSON.parse(JSON.stringify(stages));
        return [result];
      },
      populate: async (records) => {
        populatedBookings = records;
        return records;
      },
    },
    "../../../models/events/Payment": {
      collection: { name: "payments" },
      populate: async (records) => { populatedPayments = records; },
    },
    "../../../models/persons/Users": { collection: { name: "users" } },
    "../../../utilities/dateToUTC": () => {},
    "./helpers/attachPayments": {
      attachPaymentsToBookings: () => { throw new Error("Unexpected second payment query"); },
    },
    "./helpers/attachRecipesToDishes": {
      attachRecipesToDishes: async (records) => {
        recipeBookings = records;
        return records;
      },
    },
  };
  vm.runInNewContext(fs.readFileSync(`${__dirname}/Query.service.js`, "utf8"), {
    module: moduleStub,
    require: (name) => dependencies[name],
  });
  const response = await moduleStub.exports.getBookings(options);
  return {
    response: JSON.parse(JSON.stringify(response)),
    pipeline, populatedBookings, populatedPayments, recipeBookings,
  };
};

test("paginates after payment filtering and counts the same filtered result", async () => {
  const { response, pipeline } = await runQuery(
    { paymentStatus: "with_balance", page: "2", limit: "5", sortOrder: "desc" },
    { bookings: [], total: [{ count: 12 }] },
  );
  const filterIndex = pipeline.findIndex((stage) => stage.$match?.balance);
  const facetIndex = pipeline.findIndex((stage) => stage.$facet);
  assert.ok(filterIndex > pipeline.findIndex((stage) => stage.$lookup?.from === "payments"));
  assert.ok(filterIndex < facetIndex);
  assert.equal(pipeline.slice(0, facetIndex).some((stage) => stage.$skip || stage.$limit), false);
  const facet = pipeline[facetIndex].$facet;
  assert.deepEqual(facet.bookings, [
    { $sort: { date: -1, _id: -1 } }, { $skip: 5 }, { $limit: 5 },
  ]);
  assert.deepEqual(facet.total, [{ $count: "count" }]);
  assert.deepEqual(response.pagination, {
    page: 2, limit: 5, total: 12, totalPages: 3,
    hasNextPage: true, hasPreviousPage: true,
  });
});

test("handles empty results, omitted options and pages beyond the last page", async () => {
  const { response } = await runQuery();
  assert.deepEqual(response, {
    bookings: [],
    pagination: {
      page: 1, limit: 5, total: 0, totalPages: 0,
      hasNextPage: false, hasPreviousPage: false,
    },
  });
  const { response: beyond } = await runQuery(
    { page: 10 }, { bookings: [], total: [{ count: 7 }] },
  );
  assert.equal(beyond.pagination.total, 7);
  assert.equal(beyond.pagination.hasNextPage, false);
  assert.deepEqual(beyond.bookings, []);
});

test("normalizes malformed pagination and caps the page size", async () => {
  for (const value of ["bad", "Infinity", -2, 0, 1.5, null]) {
    const { response } = await runQuery({ page: value, limit: value });
    assert.equal(response.pagination.page, 1);
    assert.equal(response.pagination.limit, 5);
  }
  const { response } = await runQuery({ limit: "1000" });
  assert.equal(response.pagination.limit, 100);
});

test("searches literal text and preserves explicit status and service filters", async () => {
  const { pipeline } = await runQuery({
    search: "  Ana.*  ", status: "cancelled", service: "both",
  });
  assert.deepEqual(pipeline[0].$match, { status: "cancelled", bookingType: "both" });
  const searchFilter = pipeline.find((stage) => stage.$match?.$or).$match.$or;
  assert.ok(searchFilter.some((condition) => condition.customerFullName));
  assert.ok(searchFilter.some((condition) => condition.reference));
  for (const condition of searchFilter) {
    assert.equal(Object.values(condition)[0].$regex, "Ana\\.\\*");
  }
  const { pipeline: whitespace } = await runQuery({ search: "   " });
  assert.deepEqual(whitespace[0].$match.status.$nin, ["rejected", "changes_requested", "cancelled"]);
});

test("populates payments and recipes only for bookings returned by the page", async () => {
  const payments = [{ _id: "payment-on-page", status: "verified", amount: 100 }];
  const bookings = [{ _id: "booking-on-page", payments }];
  const result = await runQuery({ page: 2 }, { bookings, total: [{ count: 20 }] });
  assert.equal(result.populatedBookings, bookings);
  assert.deepEqual(result.populatedPayments, payments);
  assert.equal(result.recipeBookings, bookings);
  assert.deepEqual(result.response.bookings, bookings);
});
