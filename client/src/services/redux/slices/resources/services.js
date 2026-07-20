import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "resources/services";

const initialState = {
  collections: [],
  cluster: [],
  filtered: [],
  filterBy: "all",
  search: "",
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
    return axioKit.save(url, form.data);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const BROWSE = createAsyncThunk(`${url}`, (params, thunkAPI) => {
  try {
    return axioKit.universal(`${url}/browse`, params);
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
    return axioKit.update(url, form.data);
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.message) ||
      error.message ||
      error.toString();

    return thunkAPI.rejectWithValue(message);
  }
});

export const DESTROY = createAsyncThunk(`${url}/destroy`, (form, thunkAPI) => {
  try {
    return axioKit.destroy(url, form.data);
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
    SetCOLLECTIONS: (state, { payload }) => {
      state.collections = payload;
    },
    Set_SELECTED: (state, { payload = null }) => {
      state.selected = payload || {};
      state.showModal = true;
      state.willCreate = false;
    },
    FILTER_BY: (state, { payload }) => {
      const collections = [...state.collections];
      console.log("payload", payload);
      var cluster = [];
      if (payload === "all") {
        cluster = collections;
      } else {
        cluster = collections.filter(({ availableFor }) =>
          availableFor.includes(payload),
        );
      }
      state.cluster = cluster;
      state.filtered = cluster;
      state.filterBy = payload;
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
        const { data } = action.payload;
        state.collections = state.filtered = data;
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
        state.collections.unshift(action.payload.data);
        state.filtered.unshift(action.payload.data);
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
        const { success, data } = action.payload;
        const updateCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === data._id);
          if (index > -1) {
            collections[index] = data;
          }
        };
        updateCollections(state.collections);
        updateCollections(state.filtered);
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(UPDATE.rejected, (state, action) => {
        const { error } = action;
        state.message = error.message;
        state.formSubmitted = false;
      })
      .addCase(DESTROY.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(DESTROY.fulfilled, (state, action) => {
        const { success, data } = action.payload;
        const deletedId = data;
        const removeFromCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === deletedId);
          if (index > -1) {
            collections.splice(index, 1);
          }
        };

        removeFromCollections(state.collections);
        removeFromCollections(state.filtered);
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(DESTROY.rejected, (state, action) => {
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
  SetFILTERED,
  SEARCH,
  FILTER_BY,
} = reduxSlice.actions;

export default reduxSlice.reducer;
