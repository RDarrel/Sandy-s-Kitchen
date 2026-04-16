import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "menu/menu";

const initialState = {
  collections: [],
  category: "all",
  search: "",
  cluster: [],
  filtered: [],
  selected: {},
  willCreate: false,
  showModal: false,
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

export const SAVE = createAsyncThunk(`${url}/save`, (form, thunkAPI) => {
  try {
    return axioKit.save(url, form.data, form.token);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const BROWSE = createAsyncThunk(`${url}`, ({ token }, thunkAPI) => {
  try {
    return axioKit.universal(`${url}/browse`, token);
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
    return axioKit.update(url, form.data, form.token);
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
    FilterBY_CATEGORY: (state, { payload }) => {
      const results =
        payload === "all"
          ? state.collections
          : state.collections.filter((item) => {
              return item.category === payload;
            });
      state.cluster = results;
      state.filtered = results;
      state.category = payload;
      state.search = "";
    },
    SetNEW_MENU: (state, { payload }) => {
      state.collections.unshift(payload);
      state.filtered.unshift(payload);
      state.cluster.unshift(payload);
    },
    SetUPDATED_MENU: (state, { payload }) => {
      const updateCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload._id);
        if (index > -1) {
          collections[index] = payload;
        }
      };
      updateCollections(state.collections);
      updateCollections(state.cluster);
      updateCollections(state.filtered);
    },
    SetCOLLECTIONS: (state, { payload }) => {
      state.collections = payload;
    },
    Set_SELECTED: (state, { payload = null }) => {
      state.selected = payload || {};
      state.showModal = true;
      state.willCreate = false;
    },
    SetFILTERED: (state, { payload }) => {
      state.filtered = payload;
    },
    SEARCH: (state, { payload }) => {
      const results = !payload
        ? state.cluster
        : state.cluster.filter((item) => {
            return item.name.toLowerCase().includes(payload.toLowerCase());
          });
      state.filtered = results;
      state.search = payload;
    },
    SetCREATE: (state) => {
      state.willCreate = true;
      state.showModal = true;
    },
    TOGGLE: (state) => {
      state.showModal = !state.showModal;
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
        state.collections = state.cluster = state.filtered = payload;
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
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
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
        const { success } = action.payload;
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

export const {
  SetCOLLECTIONS,
  Set_SELECTED,
  TOGGLE,
  SetNEW_MENU,
  SetCREATE,
  SetUPDATED_MENU,
  FilterBY_CATEGORY,
  SetFILTERED,
  SEARCH,
} = reduxSlice.actions;

export default reduxSlice.reducer;
