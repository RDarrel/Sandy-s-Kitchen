import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../utilities";

const url = "dashboard";

const initialState = {
  summary: { trends: [] },
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
  errors: {},
  requestIds: {},
};

export const GET_SUMMARY = createAsyncThunk(
  `${url}/summary`,
  async (query, thunkAPI) => {
    try {
      return await axioKit.universal(`${url}/summary`, query);
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
  async (query, thunkAPI) => {
    try {
      return await axioKit.universal(`${url}/collections`, query);
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
  async (query, thunkAPI) => {
    try {
      return await axioKit.universal(`${url}/top-selling-items`, query);
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
  async (_, thunkAPI) => {
    try {
      return await axioKit.universal(`${url}/upcoming-bookings`);
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
  async (_, thunkAPI) => {
    try {
      return await axioKit.universal(`${url}/inventory-overview`);
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
  async (_, thunkAPI) => {
    try {
      return await axioKit.universal(`${url}/incoming-deliveries`);
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
    RESET: (state) => {
      state.errors = {};
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GET_SUMMARY.pending, (state, action) => {
        state.requestIds.summary = action.meta.requestId;
        state.errors.summary = "";
        state.isLoadingSummary = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_SUMMARY.fulfilled, (state, action) => {
        if (state.requestIds.summary !== action.meta.requestId) return;
        const { data } = action.payload;
        state.summary = data;
        state.isLoadingSummary = false;
      })
      .addCase(GET_SUMMARY.rejected, (state, action) => {
        if (state.requestIds.summary !== action.meta.requestId) return;
        state.isLoadingSummary = false;
        if (action.meta.aborted) return;
        state.errors.summary = action.payload || action.error.message;
        state.message = state.errors.summary;
      })

      .addCase(GET_COLLECTIONS.pending, (state, action) => {
        state.requestIds.collections = action.meta.requestId;
        state.errors.collections = "";
        state.isLoadingCollections = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_COLLECTIONS.fulfilled, (state, action) => {
        if (state.requestIds.collections !== action.meta.requestId) return;
        const { data } = action.payload;
        state.collections = data;
        state.isLoadingCollections = false;
      })
      .addCase(GET_COLLECTIONS.rejected, (state, action) => {
        if (state.requestIds.collections !== action.meta.requestId) return;
        state.isLoadingCollections = false;
        if (action.meta.aborted) return;
        state.errors.collections = action.payload || action.error.message;
        state.message = state.errors.collections;
      })

      .addCase(GET_TOP_SELLING_ITEMS.pending, (state, action) => {
        state.requestIds.topSellingItems = action.meta.requestId;
        state.errors.topSellingItems = "";
        state.isLoadingTopSelling = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_TOP_SELLING_ITEMS.fulfilled, (state, action) => {
        if (state.requestIds.topSellingItems !== action.meta.requestId) return;
        const { data } = action.payload;
        state.topSellingItems = data;
        state.isLoadingTopSelling = false;
      })
      .addCase(GET_TOP_SELLING_ITEMS.rejected, (state, action) => {
        if (state.requestIds.topSellingItems !== action.meta.requestId) return;
        state.isLoadingTopSelling = false;
        if (action.meta.aborted) return;
        state.errors.topSellingItems = action.payload || action.error.message;
        state.message = state.errors.topSellingItems;
      })

      .addCase(GET_UPCOMING_BOOKINGS.pending, (state, action) => {
        state.requestIds.upcomingBookings = action.meta.requestId;
        state.errors.upcomingBookings = "";
        state.isLoadingUpcomingBookings = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_UPCOMING_BOOKINGS.fulfilled, (state, action) => {
        if (state.requestIds.upcomingBookings !== action.meta.requestId) return;
        const { data } = action.payload;
        state.upcomingBookings = data;
        state.isLoadingUpcomingBookings = false;
      })
      .addCase(GET_UPCOMING_BOOKINGS.rejected, (state, action) => {
        if (state.requestIds.upcomingBookings !== action.meta.requestId) return;
        state.isLoadingUpcomingBookings = false;
        if (action.meta.aborted) return;
        state.errors.upcomingBookings = action.payload || action.error.message;
        state.message = state.errors.upcomingBookings;
      })
      .addCase(GET_INVENTORY_OVERVIEW.pending, (state, action) => {
        state.requestIds.inventoryOverview = action.meta.requestId;
        state.errors.inventoryOverview = "";
        state.isLoadingInventoryOverview = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_INVENTORY_OVERVIEW.fulfilled, (state, action) => {
        if (state.requestIds.inventoryOverview !== action.meta.requestId)
          return;
        const { data } = action.payload;
        state.inventoryOverview = data;
        state.isLoadingInventoryOverview = false;
      })
      .addCase(GET_INVENTORY_OVERVIEW.rejected, (state, action) => {
        if (state.requestIds.inventoryOverview !== action.meta.requestId)
          return;
        state.isLoadingInventoryOverview = false;
        if (action.meta.aborted) return;
        state.errors.inventoryOverview = action.payload || action.error.message;
        state.message = state.errors.inventoryOverview;
      })
      .addCase(GET_INCOMING_DELIVERIES.pending, (state, action) => {
        state.requestIds.incomingDeliveries = action.meta.requestId;
        state.errors.incomingDeliveries = "";
        state.isLoadingIncomingDeliveries = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(GET_INCOMING_DELIVERIES.fulfilled, (state, action) => {
        if (state.requestIds.incomingDeliveries !== action.meta.requestId)
          return;
        const { data } = action.payload;
        state.incomingDeliveries = data;
        state.isLoadingIncomingDeliveries = false;
      })
      .addCase(GET_INCOMING_DELIVERIES.rejected, (state, action) => {
        if (state.requestIds.incomingDeliveries !== action.meta.requestId)
          return;
        state.isLoadingIncomingDeliveries = false;
        if (action.meta.aborted) return;
        state.errors.incomingDeliveries =
          action.payload || action.error.message;
        state.message = state.errors.incomingDeliveries;
      });
  },
});

export const { RESET } = reduxSlice.actions;

export default reduxSlice.reducer;
