import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit, Formatter } from "../../../utilities";

const url = "events/bookings";

const initialState = {
  collections: [],
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

const updateSchedule = (state, statusTransaction, booking) => {
  const {
    eInclusions = [],
    cInclusions = [],
    payments = [],
    statusHistory = [],
  } = booking;
  const schedule = { ...state.schedule };
  const oldCollections = [...(schedule?.[statusTransaction?.old] ?? [])];

  const index = oldCollections.findIndex(({ _id }) => _id === booking?._id);

  if (index === -1) return;

  const toRemoveBooking = { ...oldCollections[index] };

  oldCollections.splice(index, 1);

  if (oldCollections.length === 0) {
    delete schedule[statusTransaction.old];
  } else {
    schedule[statusTransaction.old] = oldCollections;
  }

  const updatedBooking = {
    ...toRemoveBooking,
    status: statusTransaction.new,
    ...(eInclusions?.length > 0 && {
      event: {
        ...toRemoveBooking?.event,
        inclusions: eInclusions,
      },
    }),

    ...(cInclusions?.length > 0 && {
      catering: {
        ...toRemoveBooking?.catering,
        inclusions: cInclusions,
      },
    }),
    ...(payments?.length > 0 && { payments }),
    ...(statusHistory?.length > 0 && { statusHistory }),
  };

  state.schedule = {
    ...schedule,
    ...(!["changes_requested"].includes(statusTransaction?.new) && {
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

const updateBookingStatus = (state, statusTransaction, booking) => {
  //status={new:"approved",old:'pending'}
  const calendar = { ...state.calendar };
  const updatedBooking = updateSchedule(state, statusTransaction, booking);

  console.log("updatedBooking", updatedBooking);
  if (!updatedBooking) return;

  const bookingRange = getBookingRange(updatedBooking);

  const { visibleRange, monthRange } = calendar;

  const isVisible = isDateWithinRange(bookingRange, visibleRange);
  const isWithinMonth = isDateWithinRange(bookingRange, monthRange);
  console.log("isVisible", isVisible);
  console.log("isWithinMonth", isWithinMonth);
  if (isVisible) {
    const { days = [], overview = {} } = calendar;
    const { monthly = [] } = overview;

    const updatedDays = days.map((day) => {
      console.log("bookingRange", JSON.parse(JSON.stringify(bookingRange)));
      console.log("day", JSON.parse(JSON.stringify(day)));
      const isAffected = isDateWithinRange(bookingRange, {
        startAt: day?.start,
        endAt: day?.end,
      });
      console.log("isAffected", isAffected);
      if (!isAffected) return day;

      return {
        ...day,
        statusCounts: {
          ...day.statusCounts,
          [statusTransaction.old]: Math.max(
            (day.statusCounts?.[statusTransaction.old] || 0) - 1,
            0,
          ),
          [statusTransaction.new]:
            (day.statusCounts?.[statusTransaction.new] || 0) + 1,
        },
      };
    });

    console.log("updateDays", JSON.parse(JSON.stringify(updatedDays)));

    if (isWithinMonth) {
      const getStatsIdx = (stats) =>
        monthly.findIndex(({ status }) => status === stats);

      const oldStatusIdx = getStatsIdx(statusTransaction.old);
      const newStatusIdx = getStatsIdx(statusTransaction.new);

      if (oldStatusIdx > -1) {
        monthly[oldStatusIdx] = {
          ...monthly[oldStatusIdx],
          count: Math.max((monthly[oldStatusIdx]?.count || 0) - 1, 0),
        };
      }

      if (newStatusIdx > -1) {
        monthly[newStatusIdx] = {
          ...monthly[newStatusIdx],
          count: (monthly[newStatusIdx]?.count || 0) + 1,
        };
      } else {
        monthly.push({ status: statusTransaction.new, count: 1 });
      }
    }

    state.calendar = {
      ...state.calendar,
      days: updatedDays,
      overview: {
        ...state.calendar?.overview,
        monthly,
      },
    };
  }
};

export const reduxSlice = createSlice({
  name: url,
  initialState,
  reducers: {
    UPDATE_PAYMENT: (state, { payload }) => {
      const { bookingStatus, data } = payload;

      const collections = [...(state.schedule[bookingStatus] || [])];
      const index = collections.findIndex(({ _id }) => _id === data?.booking);

      if (index > -1) {
        const payments = [...(collections[index]?.payments || [])];
        const paymentIdx = payments.findIndex(({ _id }) => _id === data?._id);
        payments[paymentIdx] = data;
        collections[index] = {
          ...collections[index],
          payments,
        };
      }
      state.schedule = {
        ...state.schedule,
        [bookingStatus]: collections,
      };
    },

    CONFIRM_BOOKING: (state, { payload }) => {
      const { bookingStatus, data, date } = payload;
      const collections = [...(state.schedule[bookingStatus] || [])];
      const booking = collections.find(({ _id }) => _id === data?.booking);

      const payments = [...(booking?.payments || [])];
      const paymentIdx = payments.findIndex(({ _id }) => _id === data?._id);
      payments[paymentIdx] = data;

      updateBookingStatus(
        state,
        { old: "approved", new: "confirmed" },
        { _id: data?.booking, payments, date },
      );
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
        const { success, data } = action.payload;
        updateBookingStatus(state, { old: "pending", new: "approved" }, data);
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
        const { success, data, statusTransaction } = action.payload;
        updateBookingStatus(state, statusTransaction, data);
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});
export const { UPDATE_PAYMENT, CONFIRM_BOOKING } = reduxSlice.actions;
export default reduxSlice.reducer;
