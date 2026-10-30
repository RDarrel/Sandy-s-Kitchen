import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "events/notifications";

const initialState = {
  collections: [],
  isSuccess: false,
  isLoading: false,
  formSubmitted: false,
  isMarkingAsRead: false,
  isMarkingAllAsRead: false,
  message: "",
};

export const BROWSE = createAsyncThunk(`${url}/browse`, (query, thunkAPI) => {
  try {
    return axioKit.universal(`${url}/browse`, query);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const MARK_AS_READ = createAsyncThunk(
  `${url}/mark_as_read`,
  (form, thunkAPI) => {
    try {
      return axioKit.update(url, form, "markAsRead");
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

export const MARK_ALL_AS_READ = createAsyncThunk(
  `${url}/mark_all_as_read`,
  (form, thunkAPI) => {
    try {
      return axioKit.update(url, form, "markAllAsRead");
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
      .addCase(BROWSE.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(BROWSE.fulfilled, (state, action) => {
        const { success, data } = action.payload;
        state.collections = data;
        state.isLoading = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(BROWSE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })
      .addCase(MARK_AS_READ.pending, (state) => {
        state.isMarkingAsRead = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(MARK_AS_READ.fulfilled, (state, action) => {
        const { success, data } = action.payload;
        const collections = [...(state.collections ?? [])];
        const index = collections.findIndex(({ _id }) => _id === data);
        if (index > -1) {
          collections[index] = {
            ...collections[index],
            isRead: true,
          };
        }
        state.collections = collections;
        state.isMarkingAsRead = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(MARK_AS_READ.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isMarkingAsRead = false;
      })
      .addCase(MARK_ALL_AS_READ.pending, (state) => {
        state.isMarkingAllAsRead = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(MARK_ALL_AS_READ.fulfilled, (state, action) => {
        const { success } = action.payload;
        state.collections = state.collections.map(({ isRead, ...prev }) => ({
          ...prev,
          isRead: true,
        }));
        state.isMarkingAllAsRead = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(MARK_ALL_AS_READ.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isMarkingAllAsRead = false;
      });
  },
});

export default reduxSlice.reducer;
