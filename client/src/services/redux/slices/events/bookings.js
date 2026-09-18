import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "events/bookings";

const initialState = {
  collections: [],
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

export const CALENDAR = createAsyncThunk(`${url}`, (query, thunkAPI) => {
  try {
    return axioKit.universal(`${url}/calendar`, query);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

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
      });
  },
});

export default reduxSlice.reducer;
