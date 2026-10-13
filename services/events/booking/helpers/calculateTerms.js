const calculateTerms = ({ booking, policy }) => {
  const approvedAt = new Date();

  /*
  |--------------------------------------------------------------------------
  | Required Deposit
  |--------------------------------------------------------------------------
  */

  // const requiredDeposit =
  //   Math.round(booking.pricing.total * (policy.depositPercent / 100) * 100) /
  //   100;

  const requiredDeposit = Math.round(
    booking.pricing.total * (policy.depositPercent / 100),
  );

  /*
  |--------------------------------------------------------------------------
  | Deposit Deadline
  |--------------------------------------------------------------------------
  |
  | The customer must submit the required deposit within the configured
  | reservation hold period after the booking has been approved.
  |
  */

  const depositDeadline = new Date(
    approvedAt.getTime() + policy.reservationHoldHours * 60 * 60 * 1000,
  );

  /*
  |--------------------------------------------------------------------------
  | Cancellation Deadline
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | Event Date:            November 20
  | Cancellation Policy:   7 days
  | Cancellation Deadline: November 13
  |
  */

  const cancellationDeadline = new Date(booking.date);

  cancellationDeadline.setDate(
    cancellationDeadline.getDate() - policy.cancellationDeadlineDays,
  );

  /*
  |--------------------------------------------------------------------------
  | Balance Due Date
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | Event Date:       November 20
  | Balance Due:      2 days before
  | Balance Due Date: November 18
  |
  */

  const balanceDueAt = new Date(booking.date);

  balanceDueAt.setDate(
    balanceDueAt.getDate() - policy.balanceDueDaysBeforeEvent,
  );

  /*
  |--------------------------------------------------------------------------
  | Booking Terms Snapshot
  |--------------------------------------------------------------------------
  */

  return {
    depositPercent: policy.depositPercent,

    requiredDeposit,

    reservationHoldHours: policy.reservationHoldHours,

    depositDeadline,

    cancellationDeadlineDays: policy.cancellationDeadlineDays,

    cancellationDeadline,

    depositRefundable: policy.depositRefundable,

    balanceDueDaysBeforeEvent: policy.balanceDueDaysBeforeEvent,

    balanceDueAt,

    approvedAt,
  };
};

module.exports = {
  calculateTerms,
};
