import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "menu/menus";

const getIsAvailable = (item) => Boolean(item?.isAvailable ?? item?.isPublish);

const applyFilters = (
  collections,
  { category, availability, availableFor = "all", search },
) => {
  const byCategory =
    category === "all"
      ? collections
      : collections.filter((item) => item.category === category);

  const byAvailability =
    availability === "all"
      ? byCategory
      : byCategory.filter((item) => {
          const isAvailable = getIsAvailable(item);
          return availability === "available" ? isAvailable : !isAvailable;
        });

  const cluster =
    availableFor === "all"
      ? byAvailability
      : byAvailability.filter((item) => {
          const { type } = item;

          // Non-prepared items are Dine-in only
          if (type !== "prepared") {
            return availableFor === "dine_in";
          }

          const itemAvailableFor = item.availableFor || "both";

          return (
            itemAvailableFor === availableFor || itemAvailableFor === "both"
          );
        });
  const filtered = !search
    ? cluster
    : cluster.filter((item) => {
        return item.name.toLowerCase().includes(search.toLowerCase());
      });

  return { cluster, filtered };
};

export const selectMenuCategoryCounts = createSelector(
  [
    ({ menus }) => menus.collections,
    ({ menus }) => menus.availableFor,
    ({ menus }) => menus.availability,
  ],
  (collections, availableFor, availability) => {
    const { cluster } = applyFilters(collections, {
      category: "all",
      availableFor,
      availability,
      search: "",
    });
    return cluster.reduce((counts, item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
      return counts;
    }, {});
  },
);

const initialState = {
  collections: [],
  category: "all",
  availability: "all",
  availableFor: "all",
  search: "",
  cluster: [],
  filtered: [],
  selected: {},
  modalMode: "full",
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

export const SET_AVAILABILITY = createAsyncThunk(
  `${url}/availability`,
  (form, thunkAPI) => {
    try {
      return axioKit.update(url, form.data, "availability");
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
    FilterBY_CATEGORY: (state, { payload }) => {
      state.category = payload;
      state.search = "";

      const { cluster, filtered } = applyFilters(state.collections, {
        category: state.category,
        availability: state.availability,
        availableFor: state.availableFor,
        search: state.search,
      });

      state.cluster = cluster;
      state.filtered = filtered;
    },
    FilterBY_AVAILABILITY: (state, { payload }) => {
      state.availability = payload || "all";
      state.search = "";

      const { cluster, filtered } = applyFilters(state.collections, {
        category: state.category,
        availability: state.availability,
        availableFor: state.availableFor,
        search: state.search,
      });

      state.cluster = cluster;
      state.filtered = filtered;
    },
    FilterBY_AVAILABLE_FOR: (state, { payload }) => {
      state.availableFor = payload || "all";
      const { cluster, filtered } = applyFilters(state.collections, state);
      state.cluster = cluster;
      state.filtered = filtered;
    },
    SetNEW_MENU: (state, { payload }) => {
      state.collections.unshift(payload);
      const { cluster, filtered } = applyFilters(state.collections, state);
      state.cluster = cluster;
      state.filtered = filtered;
    },
    SetUPDATED_MENU: (state, { payload }) => {
      const updateCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload._id);
        if (index > -1) {
          collections[index] = payload;
        }
      };
      updateCollections(state.collections);
      const { cluster, filtered } = applyFilters(state.collections, state);
      state.cluster = cluster;
      state.filtered = filtered;
    },
    SetDELETED_MENU: (state, { payload }) => {
      const removeFromCollections = (collections) => {
        const index = collections.findIndex(({ _id }) => _id === payload);
        if (index > -1) {
          collections.splice(index, 1);
        }
      };

      removeFromCollections(state.collections);
      removeFromCollections(state.cluster);
      removeFromCollections(state.filtered);
    },
    SetCOLLECTIONS: (state, { payload }) => {
      state.collections = payload;
    },
    Set_SELECTED: (state, { payload = null }) => {
      if (payload?.item) {
        state.selected = payload.item || {};
        state.modalMode = payload.mode || "full";
      } else {
        state.selected = payload || {};
        state.modalMode = "full";
      }
      state.showModal = true;
      state.willCreate = false;
    },
    SetFILTERED: (state, { payload }) => {
      state.filtered = payload;
    },
    SEARCH: (state, { payload }) => {
      state.search = payload;

      const { filtered } = applyFilters(state.collections, {
        category: state.category,
        availability: state.availability,
        availableFor: state.availableFor,
        search: state.search,
      });

      state.filtered = filtered;
    },
    SetCREATE: (state) => {
      state.willCreate = true;
      state.modalMode = "full";
      state.showModal = true;
    },
    TOGGLE: (state) => {
      state.showModal = !state.showModal;
      if (!state.showModal) {
        state.modalMode = "full";
      }
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
        state.collections = payload;

        const { cluster, filtered } = applyFilters(state.collections, {
          category: state.category,
          availability: state.availability,
          availableFor: state.availableFor,
          search: state.search,
        });

        state.cluster = cluster;
        state.filtered = filtered;
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
      })
      .addCase(SET_AVAILABILITY.pending, (state) => {
        state.formSubmitted = true;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(SET_AVAILABILITY.fulfilled, (state, action) => {
        const { success } = action.payload;
        state.formSubmitted = false;
        state.message = success;
        state.isSuccess = true;
      })
      .addCase(SET_AVAILABILITY.rejected, (state, action) => {
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
        const { success, payload } = action.payload;
        const deletedId = payload?._id || payload;
        const removeFromCollections = (collections) => {
          const index = collections.findIndex(({ _id }) => _id === deletedId);
          if (index > -1) {
            collections.splice(index, 1);
          }
        };

        removeFromCollections(state.collections);
        removeFromCollections(state.cluster);
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
  SetUPDATED_MENU,
  SetDELETED_MENU,
  FilterBY_CATEGORY,
  FilterBY_AVAILABILITY,
  FilterBY_AVAILABLE_FOR,
  SetFILTERED,
  SEARCH,
} = reduxSlice.actions;

export default reduxSlice.reducer;
