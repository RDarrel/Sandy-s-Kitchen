import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit, Formatter } from "../../../utilities";

const url = "events/bookings";

const initialState = {
  collections: [],
  schedule: [],
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

export const reduxSlice = createSlice({
  name: url,
  initialState,
  reducers: {},
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
          console.log("dayIdx", dayIdx, days);
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

export default reduxSlice.reducer;
