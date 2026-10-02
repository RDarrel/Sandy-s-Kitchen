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

const isDateWithinRange = (date, range) => {
  if (!date || !range?.start || !range?.end) return false;

  return date >= range.start && date < range.end;
};

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

const updateBookingStatus = (state, status, booking) => {
  const { eInclusions = [], cInclusions = [], payments = [], date } = booking;
  const eventDate = Formatter.localDate(date);
  const calendar = { ...state.calendar };
  const schedule = { ...state.schedule };
  const oldCollections = [...(schedule?.[status?.old] ?? [])];

  const index = oldCollections.findIndex(({ _id }) => _id === booking?._id);

  if (index === -1) return;

  const toRemoveBooking = { ...oldCollections[index] };

  oldCollections.splice(index, 1);

  if (oldCollections.length === 0) {
    delete schedule[status.old];
  } else {
    schedule[status.old] = oldCollections;
  }

  const updatedBooking = {
    ...toRemoveBooking,
    status: status.new,
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
  };

  state.schedule = {
    ...schedule,
    [status.new]: [updatedBooking, ...(schedule?.[status.new] ?? [])],
  };

  const { visibleRange, monthRange } = calendar;

  const isVisible = isDateWithinRange(eventDate, visibleRange);
  const isWithinMonth = isDateWithinRange(eventDate, monthRange);

  if (isVisible) {
    const { days = [], overview = {} } = calendar;
    const { monthly = [] } = overview;

    const dayIdx = days.findIndex(({ start }) => start === date);

    if (dayIdx > -1) {
      days[dayIdx] = {
        ...days[dayIdx],
        statusCounts: {
          ...days[dayIdx].statusCounts,
          [status.old]: (days[dayIdx].statusCounts?.[status.old] || 0) - 1,
          [status.new]: (days[dayIdx].statusCounts?.[status.new] || 0) + 1,
        },
      };
    }
    if (isWithinMonth) {
      const getStatsIdx = (stats) =>
        monthly.findIndex(({ status }) => status === stats);

      const oldStatusIdx = getStatsIdx(status.old);
      const newStatusIdx = getStatsIdx(status.new);

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
        monthly.push({ status: status.new, count: 1 });
      }
    }

    state.calendar = {
      ...state.calendar,
      days,
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
        const { eInclusions, cInclusions, date } = data;
        const eventDate = Formatter.localDate(date);
        const calendar = { ...state.calendar };
        const schedule = { ...state.schedule };
        const pending = [...(schedule?.pending ?? [])];

        const index = pending.findIndex(({ _id }) => _id === data?._id);

        if (index === -1) return;

        const toRemove = { ...pending[index] };

        pending.splice(index, 1);

        if (pending.length === 0) {
          delete schedule.pending;
        } else {
          schedule.pending = pending;
        }

        const approvedBooking = {
          ...toRemove,
          status: "approved",
          ...(eInclusions?.length > 0 && {
            event: {
              ...toRemove?.event,
              inclusions: eInclusions,
            },
          }),

          ...(cInclusions?.length > 0 && {
            catering: {
              ...toRemove?.catering,
              inclusions: cInclusions,
            },
          }),
        };

        state.schedule = {
          ...schedule,
          approved: [approvedBooking, ...(schedule?.approved ?? [])],
        };

        const { visibleRange, monthRange } = calendar;

        const isVisible = isDateWithinRange(eventDate, visibleRange);
        const isWithinMonth = isDateWithinRange(eventDate, monthRange);
        if (isVisible) {
          const { days = [], overview = {} } = calendar;
          const { monthly = [] } = overview;

          const dayIdx = days.findIndex(({ start }) => start === date);

          if (dayIdx > -1) {
            days[dayIdx] = {
              ...days[dayIdx],
              statusCounts: {
                ...days[dayIdx].statusCounts,
                pending: days[dayIdx].statusCounts?.pending - 1,
                approved: (days[dayIdx].statusCounts?.approved || 0) + 1,
              },
            };
          }
          if (isWithinMonth) {
            const getStatsIdx = (stats) =>
              monthly.findIndex(({ status }) => status === stats);

            const monthlyPendingIdx = getStatsIdx("pending");
            const monthlyApprovedIdx = getStatsIdx("approved");

            monthly[monthlyPendingIdx] = {
              ...monthly[monthlyPendingIdx],
              count: (monthly[monthlyPendingIdx]?.count || 0) - 1,
            };

            if (monthlyApprovedIdx > -1) {
              monthly[monthlyApprovedIdx] = {
                ...monthly[monthlyApprovedIdx],
                count: (monthly[monthlyApprovedIdx]?.count || 0) + 1,
              };
            } else {
              monthly.push({ status: "approved", count: 1 });
            }
          }

          state.calendar = {
            ...state.calendar,
            days,
            overview: {
              ...state.calendar?.overview,
              monthly,
            },
          };
        }

        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(APPROVE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});
export const { UPDATE_PAYMENT, CONFIRM_BOOKING } = reduxSlice.actions;
export default reduxSlice.reducer;
