import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../utilities";

const url = "dashboard";

const initialState = {
  summary: {},
  collections: { overview: [], bySource: [], totalCollections: 0 },
  topSellingItems: [],
  upcomingBookings: { bookings: [], statusCounts: {}, totalBookings: 0 },
  inventoryOverview: {
    items: [],
    statusCounts: {},
    totalNeedsReplenishment: 0,
  },
  incomingDeliveries: { deliveries: [], totalIncoming: 0 },
  isLoadingSummary: false,
  isLoadingCollections: false,
  isLoadingTopSelling: false,
  isLoadingInventoryOverview: false,
  isLoadingIncomingDeliveries: false,
  isLoadingUpcomingBookings: false,
  message: "",
};

export const GET_SUMMARY = createAsyncThunk(
  `${url}/summary`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/summary`, query);
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

export const GET_COLLECTIONS = createAsyncThunk(
  `${url}/collections`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/collections`, query);
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

export const GET_TOP_SELLING_ITEMS = createAsyncThunk(
  `${url}/top-selling-items`,
  (query, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/top-selling-items`, query);
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

export const GET_UPCOMING_BOOKINGS = createAsyncThunk(
  `${url}/upcoming-bookings`,
  (_, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/upcoming-bookings`);
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

export const GET_INVENTORY_OVERVIEW = createAsyncThunk(
  `${url}/inventory-overview`,
  (_, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/inventory-overview`);
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

export const GET_INCOMING_DELIVERIES = createAsyncThunk(
  `${url}/incoming-deliveries`,
  (_, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/incoming-deliveries`);
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
  reducers: {
    RESET: (state, data) => {
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GET_SUMMARY.pending, (state) => {
        state.isLoadingSummary = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_SUMMARY.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.summary = data;
        state.isLoadingSummary = false;
      })
      .addCase(GET_SUMMARY.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingSummary = false;
      })

      .addCase(GET_COLLECTIONS.pending, (state) => {
        state.isLoadingCollections = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_COLLECTIONS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.collections = data;
        state.isLoadingCollections = false;
      })
      .addCase(GET_COLLECTIONS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingCollections = false;
      })

      .addCase(GET_TOP_SELLING_ITEMS.pending, (state) => {
        state.isLoadingTopSelling = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_TOP_SELLING_ITEMS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.topSellingItems = data;
        state.isLoadingTopSelling = false;
      })
      .addCase(GET_TOP_SELLING_ITEMS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingTopSelling = false;
      })

      .addCase(GET_UPCOMING_BOOKINGS.pending, (state) => {
        state.isLoadingUpcomingBookings = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_UPCOMING_BOOKINGS.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.upcomingBookings = data;
        state.isLoadingUpcomingBookings = false;
      })
      .addCase(GET_UPCOMING_BOOKINGS.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingUpcomingBookings = false;
      })
      .addCase(GET_INVENTORY_OVERVIEW.pending, (state) => {
        state.isLoadingInventoryOverview = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_INVENTORY_OVERVIEW.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.inventoryOverview = data;
        state.isLoadingInventoryOverview = false;
      })
      .addCase(GET_INVENTORY_OVERVIEW.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingInventoryOverview = false;
      })
      .addCase(GET_INCOMING_DELIVERIES.pending, (state) => {
        state.isLoadingIncomingDeliveries = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_INCOMING_DELIVERIES.fulfilled, (state, action) => {
        const { data } = action.payload;
        state.incomingDeliveries = data;
        state.isLoadingIncomingDeliveries = false;
      })
      .addCase(GET_INCOMING_DELIVERIES.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoadingIncomingDeliveries = false;
      });
  },
});

export const { RESET } = reduxSlice.actions;

export default reduxSlice.reducer;
