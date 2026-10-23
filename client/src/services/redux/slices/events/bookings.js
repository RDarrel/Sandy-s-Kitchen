import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "events/bookings";

const initialState = {
  collections: [],
  refunds: [],
  cancelledBookings: [],
  schedule: {},
  equipmentAvailability: {},
  search: "",
  calendar: {
    days: [],
    overview: {
      monthly: [],
      totalCount: 0,
    },
  },
  filtered: [],
  venueConflicts: [],
  searchResults: [],
  selected: {},
  willCreate: false,
  showModal: false,
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  isLoadingCalendar: false,
  isLoadingSchedule: false,
  isLoadingMyBookings: false,
  isLoadingEquipAvailability: false,
  isLoadingBookingPayment: false,
  isLoadingBookingDetails: false,
  isLoadingVenueConflicts: false,
  isLoadingRefunds: false,
  isLoadingCancelledBookings: false,
  isLoadingSearch: false,
  message: "",
};

export const SAVE = createAsyncThunk(`${url}/save`, (data, thunkAPI) => {
  try {
    return axioKit.save(url, data);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const APPROVE = createAsyncThunk(`${url}/approve`, (data, thunkAPI) => {
  try {
    return axioKit.update(url, data, "approve");
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const UPDATE = createAsyncThunk(`${url}/update`, (data, thunkAPI) => {
  try {
    return axioKit.update(url, data);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const CANCEL_CUSTOMER_BOOKING = createAsyncThunk(
  `${url}/cancel-customer-booking`,
  (data, thunkAPI) => {
    try {
      return axioKit.update(url, data, "cancel");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const CANCEL_BUSINESS_BOOKING = createAsyncThunk(
  `${url}/cancel-admin-booking`,
  (data, thunkAPI) => {
    try {
      return axioKit.update(url, data, "cancel");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const PROCESS_REFUND = createAsyncThunk(
  `${url}/process-refund`,
  (data, thunkAPI) => {
    try {
      return axioKit.update(url, data, "process-refund");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const REQUEST_ACCOUNT_CORRECTION = createAsyncThunk(
  `${url}/request-account-correction`,
  (data, thunkAPI) => {
    try {
      return axioKit.update(url, data, "refund/account-correction");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const CALENDAR = createAsyncThunk(
  `${url}/calendar`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/calendar`, query);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const SCHEDULE = createAsyncThunk(
  `${url}/schedule`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/schedule`, query);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const EQUIPMENT_AVAILABILITY = createAsyncThunk(
  `${url}/equipmentAvailability`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/equipmentAvailability`, query);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const VENUE_CONFLICTS = createAsyncThunk(
  `${url}/venue_conflicts`,
  (reference, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/${reference}/venue-conflicts`);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const GET_BOOKING_PAYMENT = createAsyncThunk(
  `${url}/GET_BOOKING_PAYMENT`,
  (reference, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/${reference}/payment`);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const GET_REFUNDS = createAsyncThunk(
  `${url}/get-refunds`,
  (_, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/refunds`);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const GET_CANCELLED_BOOKINGS = createAsyncThunk(
  `${url}/get-cancelled-bookings`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/cancelled-collections`, query);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const GET_BOOKING_DETAILS = createAsyncThunk(
  `${url}/GET_BOOKING_DETAILS`,
  (reference, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/${reference}/details`);
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);
export const MY_BOOKINGS = createAsyncThunk(
  `${url}/my_bookings`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/me`, query);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const SEARCH = createAsyncThunk(`${url}/search`, (query, thunkAPI) => {
  try {
    return axioKit.universal(`${url}/search`, query);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

const updateSchedule = (state, statusTransaction, booking) => {
  const { payments = [], statusHistory = [], terms = null } = booking;
  const schedule = { ...state.schedule };
  const oldCollections = [...(schedule?.[statusTransaction?.old] ?? [])];

  const index = oldCollections.findIndex(({ _id }) => _id === booking?._id);

  if (index === -1) return;

  const toRemoveBooking = { ...oldCollections[index] };

  if (statusTransaction?.new === "update") {
    oldCollections[index] = {
      ...oldCollections[index],
      ...(booking?.catering && { catering: booking?.catering }),
      ...(booking?.venue && { venue: booking?.venue }),
    };
  } else {
    oldCollections.splice(index, 1);
  }

  if (oldCollections.length === 0) {
    delete schedule[statusTransaction.old];
  } else {
    schedule[statusTransaction.old] = oldCollections;
  }

  const updatedBooking = {
    ...toRemoveBooking,
    status: statusTransaction.new,
    ...(statusTransaction.new === "approved" && {
      ...(booking?.venue?.inclusions?.length > 0 && {
        event: {
          ...toRemoveBooking?.event,
          inclusions: booking?.event?.inclusions,
        },
      }),

      ...(booking?.catering?.inclusions?.length > 0 && {
        catering: {
          ...toRemoveBooking?.catering,
          inclusions: booking?.catering?.inclusions,
        },
      }),
    }),
    ...(payments?.length > 0 && { payments }),
    ...(statusHistory?.length > 0 && { statusHistory }),
    ...(terms && { terms }),
  };

  state.schedule = {
    ...schedule,
    ...(!["changes_requested", "update", "rejected", "cancelled"].includes(
      statusTransaction?.new,
    ) && {
      [statusTransaction.new]: [
        updatedBooking,
        ...(schedule?.[statusTransaction.new] ?? []),
      ],
    }),
  };

  return toRemoveBooking;
};

const isDateWithinRange = (booking, range) => {
  if (
    !booking?.startAt ||
    !booking?.endAt ||
    !range?.startAt ||
    !range?.endAt
  ) {
    return false;
  }

  return (
    new Date(booking.startAt) <= new Date(range.endAt) &&
    new Date(booking.endAt) > new Date(range.startAt)
  );
};

const getBookingRange = (booking) => {
  const { bookingType = "", date, venue = {} } = booking || {};
  let startAt = new Date(date);
  let endAt = null;

  if (bookingType === "both") {
    endAt = venue?.schedule?.endAt;
  } else {
    endAt = booking?.[bookingType]?.schedule?.endAt;
  }
  return { startAt, endAt: endAt ? new Date(endAt) : null };
};

const updateCalendar = ({
  state,
  statusTransaction,
  booking,
  options = {},
}) => {
  const calendar = state.calendar;
  if (!calendar || !booking) return;

  const { visibleRange, monthRange, days = [], overview = {} } = calendar;
  const { amountReceived = 0, totalValueChange = 0 } = booking;

  const bookingRange = getBookingRange(booking);

  const isVisible = isDateWithinRange(bookingRange, visibleRange);
  const isWithinMonth = isDateWithinRange(bookingRange, monthRange);

  const oldStatus = statusTransaction?.old;
  const newStatus = statusTransaction?.new;

  const hasStatusChanged = oldStatus && newStatus && oldStatus !== newStatus;

  const excludedStatuses = [
    "changes_requested",
    "update",
    "rejected",
    "cancelled",
  ];

  // CALENDAR DAYS
  let updatedDays = days;

  if (isVisible && options.days && hasStatusChanged) {
    updatedDays = days.map((day) => {
      const isAffected = isDateWithinRange(bookingRange, {
        startAt: day.start,
        endAt: day.end,
      });

      if (!isAffected) return day;

      const statusCounts = { ...day.statusCounts };

      if (newStatus !== "update") {
        statusCounts[oldStatus] = Math.max(
          0,
          (statusCounts[oldStatus] ?? 0) - 1,
        );

        if (statusCounts[oldStatus] === 0) {
          delete statusCounts[oldStatus];
        }
      }

      if (!excludedStatuses.includes(newStatus)) {
        statusCounts[newStatus] = (statusCounts[newStatus] ?? 0) + 1;
      }

      if (["changes_requested", "rejected", "cancelled"].includes(newStatus)) {
        day.total = Number(day.total ?? 0) - 1;
      }

      return {
        ...day,
        statusCounts,
      };
    });
  }

  // MONTHLY OVERVIEW
  let updatedOverview = overview;

  if (isWithinMonth) {
    let statuses = { ...overview.statuses };
    let financial = { ...overview.financial };
    let totalBookings = overview.totalBookings ?? 0;

    if (options.statuses && hasStatusChanged) {
      const oldIncluded = newStatus !== "update";
      const newIncluded = !excludedStatuses.includes(newStatus);

      if (oldIncluded) {
        statuses[oldStatus] = Math.max(0, (statuses[oldStatus] ?? 0) - 1);

        if (statuses[oldStatus] === 0) {
          delete statuses[oldStatus];
        }
      }

      if (newIncluded) {
        statuses[newStatus] = (statuses[newStatus] ?? 0) + 1;
      }

      if (oldIncluded && !newIncluded) {
        totalBookings = Math.max(0, totalBookings - 1);
      } else if (!oldIncluded && newIncluded) {
        totalBookings += 1;
      }
    }

    // amountReceived represents the CHANGE in verified payments
    if (amountReceived !== 0) {
      if (newStatus !== "cancelled") {
        financial.received = Math.max(
          0,
          (financial.received ?? 0) + amountReceived,
        );
      }

      financial.balanceDue = Math.max(
        0,
        (financial.balanceDue ?? 0) - amountReceived,
      );
    }

    if (newStatus === "cancelled") {
      financial.totalValue = Math.max(
        0,
        (financial.totalValue ?? 0) - totalValueChange,
      );
    } else {
      financial.totalValue = Math.max(
        0,
        (financial.totalValue ?? 0) + totalValueChange,
      );
    }

    updatedOverview = {
      ...overview,
      totalBookings,
      statuses,
      financial,
    };
  }

  state.calendar = {
    ...calendar,
    days: updatedDays,
    overview: updatedOverview,
  };
};

const updateBookingStatus = ({ state, statusTransaction, booking }) => {
  //status={new:"approved",old:'pending'}

  const updatedBooking = updateSchedule(state, statusTransaction, booking);
  if (!updatedBooking) return;

  updateCalendar({
    state,
    statusTransaction,
    booking: {
      ...updatedBooking,
      amountReceived: booking?.amountReceived,
      totalValueChange: booking?.totalValueChange,
    },
    options: {
      statuses: true,
      days: true,
    },
  });
};

export const reduxSlice = createSlice({
  name: url,
  initialState,
  reducers: {
    UPDATE_PAYMENT: (state, { payload }) => {
      const { bookingStatus, data, amountReceived = 0 } = payload;

      const collections = [...(state.schedule[bookingStatus] || [])];
      const index = collections.findIndex(({ _id }) => _id === data?.booking);

      if (index < 0) return;

      const payments = [...(collections[index]?.payments || [])];
      const paymentIdx = payments.findIndex(({ _id }) => _id === data?._id);

      if (paymentIdx > -1) {
        payments[paymentIdx] = data;
      } else {
        payments.unshift(data);
      }

      collections[index] = {
        ...collections[index],
        payments,
      };

      const booking = collections[index];

      updateCalendar({
        state,
        statusTransaction: { old: bookingStatus, new: bookingStatus },
        booking: {
          _id: booking?._id,
          bookingType: booking?.bookingType,
          date: booking?.date,
          venue: booking?.venue,
          catering: booking?.catering,
          amountReceived,
        },
      });

      state.schedule = {
        ...state.schedule,
        [bookingStatus]: collections,
      };
    },

    CONFIRM_BOOKING: (state, { payload }) => {
      const { bookingStatus, data } = payload;
      const collections = [...(state.schedule[bookingStatus] || [])];

      const booking = collections.find(({ _id }) => _id === data?.booking);

      const payments = [...(booking?.payments || [])];
      const paymentIdx = payments.findIndex(({ _id }) => _id === data?._id);
      if (paymentIdx > -1) {
        payments[paymentIdx] = data;
      } else {
        payments.unshift(data);
      }

      if (booking) {
        updateBookingStatus({
          state,
          statusTransaction: { old: "approved", new: "confirmed" },
          booking: {
            _id: booking?._id,
            bookingType: booking?.bookingType,
            date: booking?.date,
            payments,
            catering: booking?.catering,
            venue: booking?.venue,
            amountReceived: data?.amount,
          },
        });
      }
    },
    SET_SELECTED: (state, { payload }) => {
      state.selected = payload;
      state.isLoadingBookingDetails = false;
    },
    RESET_VENUE_CONFLICTS: (state) => {
      state.venueConflicts = [];
      state.isLoadingVenueConflicts = false;
    },
    RESET_SEARCH_RESULTS: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(CALENDAR.pending, (state) => {
        state.isLoadingCalendar = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(CALENDAR.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.calendar = data;
        state.isLoadingCalendar = false;
      })
      .addCase(CALENDAR.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingCalendar = false;
      })
      .addCase(MY_BOOKINGS.pending, (state) => {
        state.isLoadingMyBookings = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(MY_BOOKINGS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.collections = data;
        state.isLoadingMyBookings = false;
      })
      .addCase(MY_BOOKINGS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingMyBookings = false;
      })

      .addCase(SEARCH.pending, (state) => {
        state.isLoadingSearch = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SEARCH.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.searchResults = data;
        state.isLoadingSearch = false;
      })
      .addCase(SEARCH.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingSearch = false;
      })
      .addCase(GET_BOOKING_DETAILS.pending, (state) => {
        state.isLoadingBookingDetails = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_BOOKING_DETAILS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.selected = data;
        state.isLoadingBookingDetails = false;
      })
      .addCase(GET_BOOKING_DETAILS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingBookingDetails = false;
      })

      .addCase(GET_REFUNDS.pending, (state) => {
        state.isLoadingRefunds = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_REFUNDS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.refunds = data;
        state.isLoadingRefunds = false;
      })
      .addCase(GET_REFUNDS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingRefunds = false;
      })

      .addCase(GET_CANCELLED_BOOKINGS.pending, (state) => {
        state.isLoadingCancelledBookings = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_CANCELLED_BOOKINGS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.cancelledBookings = data;
        state.isLoadingCancelledBookings = false;
      })
      .addCase(GET_CANCELLED_BOOKINGS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingCancelledBookings = false;
      })

      .addCase(VENUE_CONFLICTS.pending, (state) => {
        state.isLoadingVenueConflicts = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(VENUE_CONFLICTS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.venueConflicts = data;
        state.isLoadingVenueConflicts = false;
      })
      .addCase(VENUE_CONFLICTS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingVenueConflicts = false;
      })
      .addCase(GET_BOOKING_PAYMENT.pending, (state) => {
        state.isLoadingBookingPayment = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_BOOKING_PAYMENT.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.selected = data;
        state.isLoadingBookingPayment = false;
      })
      .addCase(GET_BOOKING_PAYMENT.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingBookingPayment = false;
      })
      .addCase(EQUIPMENT_AVAILABILITY.pending, (state) => {
        state.isLoadingEquipAvailability = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(EQUIPMENT_AVAILABILITY.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.equipmentAvailability = data;
        state.isLoadingEquipAvailability = false;
      })
      .addCase(EQUIPMENT_AVAILABILITY.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingEquipAvailability = false;
      })
      .addCase(SCHEDULE.pending, (state) => {
        state.isLoadingSchedule = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SCHEDULE.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.schedule = data;
        state.isLoadingSchedule = false;
      })
      .addCase(SCHEDULE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingSchedule = false;
      })
      .addCase(SAVE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SAVE.fulfilled, (state, action) => {
        const { success } = action.payload;

        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(SAVE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })
      .addCase(APPROVE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(APPROVE.fulfilled, (state, action) => {
        const {
          success,
          data,
          statusTransaction,
          amountReceived = 0,
          totalValueChange = 0,
        } = action.payload;
        updateBookingStatus({
          state,
          statusTransaction,
          booking: { ...data, amountReceived, totalValueChange },
        });
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(APPROVE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })
      .addCase(UPDATE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(UPDATE.fulfilled, (state, action) => {
        const {
          success,
          data,
          statusTransaction,
          amountReceived = 0,
          totalValueChange = 0,
        } = action.payload;
        updateBookingStatus({
          state,
          statusTransaction,
          booking: { ...data, amountReceived, totalValueChange },
        });
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })
      .addCase(CANCEL_CUSTOMER_BOOKING.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(CANCEL_CUSTOMER_BOOKING.fulfilled, (state, { payload }) => {
        const { data } = payload;
        state.selected = {
          ...state.selected,
          status: "cancelled",
          cancellation: data.cancellation,
        };
        state.formSubmitted = false;
        state.isSuccess = true;
      })
      .addCase(CANCEL_CUSTOMER_BOOKING.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })
      .addCase(CANCEL_BUSINESS_BOOKING.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(CANCEL_BUSINESS_BOOKING.fulfilled, (state, { payload }) => {
        const { data, statusTransaction } = payload;
        updateBookingStatus({ state, booking: data, statusTransaction });

        if (
          data?.cancellation?.refund?.amount > 0 &&
          data?.cancellation?.refund?.status === "pending"
        ) {
          const { overview } = state.calendar;
          const financial = { ...(overview?.financial ?? {}) };

          financial.pendingRefunds = Math.max(
            0,
            (financial?.pendingRefunds ?? 0) +
              (data?.cancellation?.refund?.amount ?? 0),
          );

          financial.pendingRefundCount = Math.max(
            0,
            (financial?.pendingRefundCount ?? 0) + 1,
          );

          state.calendar = {
            ...state.calendar,
            overview: {
              ...overview,
              financial,
            },
          };
        }
        state.formSubmitted = false;
        state.isSuccess = true;
      })
      .addCase(CANCEL_BUSINESS_BOOKING.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })

      .addCase(PROCESS_REFUND.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(PROCESS_REFUND.fulfilled, (state, { payload }) => {
        const { data } = payload;

        const refunds = [...(state.refunds ?? [])];
        const index = refunds?.findIndex(({ _id }) => _id === data?._id);
        if (index > -1) {
          refunds.splice(index, 1);
        }

        const { monthRange, overview = {} } = state.calendar;

        const bookingRange = getBookingRange(data);

        const isWithinMonth = isDateWithinRange(bookingRange, monthRange);

        if (isWithinMonth) {
          let financial = { ...overview.financial };

          financial.completedRefunds = Math.max(
            0,
            (financial.completedRefunds ?? 0) + data?.amount,
          );

          financial.received = Math.max(
            0,
            (financial.received ?? 0) - data?.amount,
          );

          financial.pendingRefunds = Math.max(
            0,
            (financial.pendingRefunds ?? 0) - data?.amount,
          );

          state.calendar = {
            ...state.calendar,
            overview: {
              ...overview,
              financial,
            },
          };
        }
        state.refunds = refunds;
        state.formSubmitted = false;
        state.isSuccess = true;
      })
      .addCase(PROCESS_REFUND.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })
      .addCase(REQUEST_ACCOUNT_CORRECTION.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(REQUEST_ACCOUNT_CORRECTION.fulfilled, (state, { payload }) => {
        const { data } = payload;
        const refunds = [...(state.refunds ?? [])];
        const index = refunds.findIndex(({ _id }) => _id === data?._id);
        console.log("index", index);
        if (index > -1) {
          refunds[index] = {
            ...refunds[index],
            cancellation: {
              ...refunds[index]?.cancellation,
              refund: {
                ...refunds[index]?.cancellation?.refund,
                accountCorrection: data.correction,
              },
            },
          };
        }
        state.refunds = refunds;
        state.formSubmitted = false;
        state.isSuccess = true;
      })
      .addCase(REQUEST_ACCOUNT_CORRECTION.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});
export const {
  UPDATE_PAYMENT,
  CONFIRM_BOOKING,
  RESET_SEARCH_RESULTS,
  RESET_VENUE_CONFLICTS,
  SET_SELECTED,
} = reduxSlice.actions;
export default reduxSlice.reducer;
