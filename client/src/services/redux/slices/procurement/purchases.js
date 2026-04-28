import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";

const url = "assets/purchases";

const initialState = {
  collections: [],
  cartOpen: false,
  cart: { version: 1, lines: [] },
  supplierMode: "same", // "same" | "different"
  reviewOpen: false,
  reviewSameSupplierId: "all",
  reviewSameExpectedDelivery: "",
  reviewExpectedDeliveryBySupplier: {},
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
        unitCost: Number.isFinite(Number(line?.unitCost))
          ? Number(line?.unitCost)
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
    SetReviewOpen: (state, { payload }) => {
      const nextOpen = Boolean(payload);
      state.reviewOpen = nextOpen;

      if (!nextOpen) return;

      if (state.supplierMode === "same") {
        state.reviewSameSupplierId =
          String(state.reviewSameSupplierId || "all") || "all";
        state.reviewSameExpectedDelivery = String(
          state.reviewSameExpectedDelivery || "",
        );
        return;
      }

      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const nextMap = { ...(state.reviewExpectedDeliveryBySupplier || {}) };
      for (const line of lines) {
        const supplierId = String(line?.supplier || "all");
        if (!supplierId || supplierId === "all") continue;
        if (nextMap[supplierId] === undefined) nextMap[supplierId] = "";
      }
      state.reviewExpectedDeliveryBySupplier = nextMap;
    },
    ReviewSetSameSupplierId: (state, { payload }) => {
      state.reviewSameSupplierId = String(payload || "all") || "all";
    },
    ReviewSetSameExpectedDelivery: (state, { payload }) => {
      state.reviewSameExpectedDelivery = String(payload || "");
    },
    ReviewSetSupplierExpectedDelivery: (state, { payload }) => {
      const supplierId = String(payload?.supplierId || "");
      if (!supplierId) return;
      const date = String(payload?.date || "");
      state.reviewExpectedDeliveryBySupplier = {
        ...(state.reviewExpectedDeliveryBySupplier || {}),
        [supplierId]: date,
      };
    },
    CartClear: (state) => {
      state.cart = { version: 1, lines: [] };
    },
    CartAdd: (state, { payload }) => {
      const inventory = String(payload?.inventory);
      if (!inventory) return;

      const nextQuantity = Math.max(1, Number(payload?.quantity) || 1);
      const incomingSupplier = String(
        payload?.supplier || payload?.supplierId || "",
      );
      const supplier = incomingSupplier;
      const incomingUnitCost = Number(payload?.unitCost);
      const unitCost = Number.isFinite(incomingUnitCost)
        ? Math.max(0, incomingUnitCost)
        : undefined;
      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const index = lines.findIndex((line) => line.inventory === inventory);
      const stamp = Date.now();

      if (index > -1) {
        lines[index] = {
          ...lines[index],
          quantity: (lines[index].quantity || 0) + nextQuantity,
          supplier: lines[index].supplier || supplier,
          unitCost:
            lines[index].unitCost !== undefined
              ? lines[index].unitCost
              : unitCost,
          updatedAt: stamp,
        };
        state.cart = { version: 1, lines };
        return;
      }

      state.cart = {
        version: 1,
        lines: [
          {
            inventory,
            supplier,
            unitCost,
            quantity: nextQuantity,
            addedAt: stamp,
            updatedAt: stamp,
          },
          ...lines,
        ],
      };
    },
    CartSetLineUnitCost: (state, { payload }) => {
      const inventory = String(
        payload?.inventory || payload?.inventoryId || "",
      );
      if (!inventory) return;
      const unitCost = Number(payload?.unitCost);
      if (!Number.isFinite(unitCost)) return;

      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const index = lines.findIndex((line) => line.inventory === inventory);
      if (index < 0) return;

      lines[index] = {
        ...lines[index],
        unitCost: Math.max(0, unitCost),
        updatedAt: Date.now(),
      };
      state.cart = { version: 1, lines };
    },
    CartSetLineSupplier: (state, { payload }) => {
      const inventory = String(
        payload?.inventory || payload?.inventoryId || "",
      );
      if (!inventory) return;
      const supplier =
        String(payload?.supplier || payload?.supplierId || "all") || "all";

      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const index = lines.findIndex((line) => line.inventory === inventory);
      if (index < 0) return;

      lines[index] = {
        ...lines[index],
        supplier,
        updatedAt: Date.now(),
        cost: Number(payload?.cost),
      };
      state.cart = { version: 1, lines };
    },
    CartRemove: (state, { payload }) => {
      const inventory = String(payload || "");
      if (!inventory) return;
      const cart = normalizeCart(state.cart);
      state.cart = {
        version: 1,
        lines: (cart.lines || []).filter(
          (line) => line.inventory !== inventory,
        ),
      };
    },
    CartIncrement: (state, { payload }) => {
      const inventory = String(payload || "");
      if (!inventory) return;
      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const index = lines.findIndex((line) => line.inventory === inventory);
      if (index < 0) return;
      lines[index] = {
        ...lines[index],
        quantity: (lines[index].quantity || 0) + 1,
        updatedAt: Date.now(),
      };
      state.cart = { version: 1, lines };
    },
    CartDecrement: (state, { payload }) => {
      const inventory = String(payload || "");
      if (!inventory) return;
      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const index = lines.findIndex((line) => line.inventory === inventory);
      if (index < 0) return;
      const nextQty = (lines[index].quantity || 0) - 1;
      if (nextQty <= 0) {
        state.cart = {
          version: 1,
          lines: lines.filter((line) => line.inventory !== inventory),
        };
        return;
      }
      lines[index] = {
        ...lines[index],
        quantity: nextQty,
        updatedAt: Date.now(),
      };
      state.cart = { version: 1, lines };
    },
    CartSetLineQuantity: (state, { payload }) => {
      const inventory = String(
        payload?.inventory || payload?.inventoryId || "",
      );
      if (!inventory) return;
      const quantity = Number(payload?.quantity);
      if (!Number.isFinite(quantity)) return;

      const cart = normalizeCart(state.cart);
      const lines = Array.isArray(cart?.lines) ? cart.lines : [];
      const index = lines.findIndex((line) => line.inventory === inventory);
      if (index < 0) return;

      const nextQty = Math.floor(Math.max(0, quantity));
      if (nextQty <= 0) {
        state.cart = {
          version: 1,
          lines: lines.filter((line) => line.inventory !== inventory),
        };
        return;
      }

      lines[index] = {
        ...lines[index],
        quantity: nextQty,
        updatedAt: Date.now(),
      };
      state.cart = { version: 1, lines };
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
  ReviewSetSameExpectedDelivery,
  ReviewSetSupplierExpectedDelivery,
  CartClear,
  CartAdd,
  CartSetLineUnitCost,
  CartSetLineSupplier,
  CartRemove,
  CartIncrement,
  CartDecrement,
  CartSetLineQuantity,
} = reduxSlice.actions;

export default reduxSlice.reducer;
