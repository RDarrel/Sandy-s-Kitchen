import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "events/paymentMethods";

const initialState = {
  collections: [],
  filtered: [],
  status: "all",
  search: "",
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const BROWSE = createAsyncThunk(`${url}`, (_, thunkAPI) => {
  try {
    return axioKit.universal(`${url}/browse`);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const SAVE = createAsyncThunk(`${url}/save`, (form, thunkAPI) => {
  try {
    return axioKit.save(url, form);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const UPDATE = createAsyncThunk(`${url}/update`, (form, thunkAPI) => {
  try {
    return axioKit.update(url, form);
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
  reducers: {
    INSERT_PAYMENT_METHOD: (state, { payload }) => {
      const { qrImgId = "", methodImgId = "", ...rest } = payload;

      const newMethod = {
        ...rest,
        ...(methodImgId && { methodImgId }),
        ...(qrImgId && { qrImgId }),
      };
      state.collections.unshift(newMethod);
      state.filtered.unshift(newMethod);
    },
    UPDATE_PAYMENT_METHOD: (state, { payload }) => {
      const updateCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload?._id);
        if (index > -1) {
          collections[index] = payload;
        }
      };

      updateCollections(state.collections);
      updateCollections(state.filtered);
    },

    SET_STATUS: (state, { payload }) => {
      let collections = [];
      if (payload === "all") {
        collections = state.collections;
      } else {
        const isActive = payload === "active";

        collections = state.collections.filter(
          ({ isActive: itemIsActive }) => isActive === itemIsActive,
        );
      }

      state.filtered = collections;
      state.status = payload;
    },
    SET_SEARCH: (state, { payload }) => {
      let collections = [];
      const normalizedQuery = payload.trim().toLowerCase();
      if (!payload) {
        collections = state.collections;
      } else {
        collections = state.collections.filter((method) => {
          const matchesSearch = [
            method.name,
            method.type,
            method.accountName,
            method.accountNumber,
            method.bankName,
          ]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(normalizedQuery));

          return matchesSearch;
        });
      }
      state.filtered = collections;
      state.search = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(BROWSE.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(BROWSE.fulfilled, (state, action) => {
        const { payload } = action.payload;
        state.collections = state.filtered = payload;
        state.isLoading = false;
      })
      .addCase(BROWSE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.isLoading = false;
      })

      .addCase(SAVE.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SAVE.fulfilled, (state, action) => {
        const { success } = action.payload;
        state.message = success;
        state.isSuccess = true;
        state.formSubmitted = false;
      })
      .addCase(SAVE.rejected, (state, action) => {
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
        const { message } = action.payload;
        state.formSubmitted = false;
        state.message = message;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      });
  },
});
export const {
  INSERT_PAYMENT_METHOD,
  UPDATE_PAYMENT_METHOD,
  SET_SEARCH,
  SET_STATUS,
} = reduxSlice.actions;
export default reduxSlice.reducer;
