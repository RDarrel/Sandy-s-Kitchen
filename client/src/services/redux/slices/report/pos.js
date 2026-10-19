import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "reports/pos";

const initialState = {
  transactionsReport: { total: {}, transactions: [], cashiers: [] },
  salesReport: { summary: {}, bookings: [] },
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const GET_TRANSACTIONS_REPORT = createAsyncThunk(
  `${url}`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/transactions`, query);
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

export const reduxSlice = createSlice({
  name: url,
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(GET_TRANSACTIONS_REPORT.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_TRANSACTIONS_REPORT.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.transactionsReport = data;
        state.isLoading = false;
      })
      .addCase(GET_TRANSACTIONS_REPORT.rejected, (state, action) => {
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
      });
  },
});

export default reduxSlice.reducer;
