import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "procurement/purchases";

const initialState = {
  collections: [],
  cartOpen: false,
  cart: [],
  reviewOpen: false,
  formSubmitted: false,
  isSuccess: false,
  isLoading: false,
  message: "",
};

const normalizeCart = (cart) => {
  const lines = Array.isArray(cart?.lines) ? cart.lines : [];
  return {
    version: 1,
    lines: lines
      .map((line) => ({
        inventory: String(line?.inventory || line?.inventoryId || ""),
        // Canonical field is `supplier`; keep backward compatibility with `supplierId`.
        supplier: String(line?.supplier || line?.supplierId || "all"),
        // Canonical field is `cost`; keep backward compatibility with `unitCost`.
        cost: Number.isFinite(Number(line?.cost ?? line?.unitCost))
          ? Number(line?.cost ?? line?.unitCost)
          : undefined,
        quantity: Math.max(0, Number(line?.quantity) || 0),
        addedAt: Number(line?.addedAt) || Date.now(),
        updatedAt: Number(line?.updatedAt) || Date.now(),
      }))
      .filter((line) => line.inventory && line.quantity > 0),
  };
};

export const BROWSE = createAsyncThunk(
  `${url}`,
  ({ token, params }, thunkAPI) => {
    try {
      return axioKit.universal(`${url}/browse`, token, params);
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

export const DESTROY = createAsyncThunk(`${url}/destroy`, (form, thunkAPI) => {
  try {
    return axioKit.destroy(url, form.data, form.token);
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
    SetSupplierMode: (state, { payload }) => {
      const nextMode = payload === "same" ? "same" : "different";
      state.supplierMode = nextMode;

      if (nextMode !== "same") return;

      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const stamp = Date.now();
      state.cart = {
        version: 1,
        lines: lines.map((line) => ({
          ...line,
          supplier: "all",
          updatedAt: stamp,
        })),
      };
    },
    SetCartOpen: (state, { payload }) => {
      state.cartOpen = Boolean(payload);
    },
    SetReviewOpen: (state, _) => {
      state.reviewOpen = !state.reviewOpen;
    },
    ReviewSetSameSupplierId: (state, { payload }) => {
      state.reviewSameSupplierId = String(payload || "all") || "all";
    },

    CartClear: (state) => {
      state.cart = [];
    },
    CartAdd: (state, { payload }) => {
      const inventory = String(payload?.inventory);
      if (!inventory) return;
      const isExistIdx = state.cart?.findIndex(
        ({ inventory }) => inventory?._id === payload?._id,
      );
      const _cart = [...state.cart];
      if (isExistIdx > -1) {
        _cart.splice(isExistIdx, 1);
      } else {
        _cart.unshift({
          inventory: payload,
          cost: payload?.cost,
          supplier: payload?.supplier?._id,
          quantity: 1,
        });
      }
      state.cart = _cart;
    },
    CartUpdate: (state, { payload }) => {
      const index = state.cart?.findIndex(
        ({ inventory }) => inventory?._id === payload?.inventory?._id,
      );
      if (index < 0) return;
      const _cart = [...state.cart];
      _cart[index] = {
        ..._cart[index],
        ...payload,
      };
      state.cart = _cart;
    },
    CartRemove: (state, { payload }) => {
      const _cart = [...state.cart];
      const index = _cart?.findIndex(
        ({ inventory }) => inventory?._id === payload,
      );
      if (index < 0) return;
      _cart.splice(index, 1);
      state.cart = _cart;
    },

    UPDATE_AUTH: (state, data) => {
      state.auth = { ...state.auth, ...data.payload };
      state.information = { ...state.information, isFreshman: false };
    },
    PROGRESS: (state, data) => {
      state.progress = data.payload;
    },
    UPLOADBAR: (state, data) => {
      state.progressBar = data.payload;
    },
    IMAGE: (state, data) => {
      state.image = data.payload;
      state.progressBar = -1;
    },
    MAXPAGE: (state, data) => {
      localStorage.setItem("maxPage", data.payload);
      state.maxPage = data.payload;
    },
    SETROUTE: (state, data) => {
      state.route = data.payload;
    },
    RESET: (state, data) => {
      state.isSuccess = false;
      state.message = "";
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
        const { success, payload } = action.payload;
        state.message = success;
        if (state.collections) state.collections.unshift(payload);
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
        const { success, payload } = action.payload;
        const { purchase, updatingRequest = false } = payload;
        const index = state.collections.findIndex(
          ({ _id: id }) => id === purchase?._id,
        );
        if (updatingRequest) {
          state.collections[index] = purchase;
        } else {
          state.collections.splice(index, 1);
        }
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
        const { success, payload } = action.payload;
        const index = state.collections.findIndex(({ _id }) => _id === payload);
        state.collections.splice(index, 1);
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
  RESET,
  MAXPAGE,
  PROGRESS,
  UPLOADBAR,
  IMAGE,
  SETROUTE,
  UPDATE_AUTH,
  SetSupplierMode,
  SetCartOpen,
  SetReviewOpen,
  ReviewSetSameSupplierId,
  CartClear,
  CartAdd,
  CartRemove,
  CartUpdate,
} = reduxSlice.actions;

export default reduxSlice.reducer;
