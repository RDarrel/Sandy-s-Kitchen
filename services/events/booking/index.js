const Approval = require("./Approval.service");
const Query = require("./Query.service");
const Calendar = require("./Calendar.service");
const Equipment = require("./Equipment.service");
const Mutation = require("./Mutation.service");
const { confirmSetup } = require("./Setup.service");

module.exports = {
  approve: Approval.approve,
  calendar: Calendar.calendar,
  schedule: Calendar.schedule,
  update: Mutation.update,
  getEquipmentAvailability: Equipment.getEquipmentAvailability,
  getMyBookings: Query.getMyBookings,
  getBookingDetails: Query.getBookingDetails,
  getPaymentDetails: Query.getPaymentDetails,
  getVenueConflicts: Query.getVenueConflicts,
  search: Query.search,
  confirmSetup,
};
