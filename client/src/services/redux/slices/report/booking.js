import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "reports/booking";

const initialState = {
  paymentReport: { summary: {}, payments: [] },
  salesReport: { summary: {}, bookings: [] },
  analytics: {
    summary: {},
    trends: [],
    packages: [],
    venues: [],
    dishes: [],
    customers: [],
  },
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const GET_PAYMENT_REPORT = createAsyncThunk(
  `${url}`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/payment`, query);
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

export const GET_SALES_REPORT = createAsyncThunk(
  `${url}/sales`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/sales`, query);
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

export const GET_ANALYTICS = createAsyncThunk(
  `${url}/analytics`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/analytics`, query);
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
  extraReducers: (builder) => {
    builder
      .addCase(GET_PAYMENT_REPORT.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_PAYMENT_REPORT.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.paymentReport = data;
        state.isLoading = false;
      })
      .addCase(GET_PAYMENT_REPORT.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })
      .addCase(GET_SALES_REPORT.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_SALES_REPORT.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.salesReport = data;
        state.isLoading = false;
      })
      .addCase(GET_SALES_REPORT.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })
      .addCase(GET_ANALYTICS.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_ANALYTICS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.analytics = data;
        state.isLoading = false;
      })
      .addCase(GET_ANALYTICS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      });
  },
});

export default reduxSlice.reducer;
