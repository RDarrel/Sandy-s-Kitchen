import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axioKit } from "../../../utilities";
import {
  createCartLineId,
  createCartSignature,
  normalizeAddOns,
  normalizeCart,
} from "./cashier.utils";

const url = "asets/staffs";

const initialState = {
  sale: 0,
  soldLiters: 0,
  sales: [],
  salesFiltered: [],
  activeTab: "menus",
  fuel: {},
  fuels: [],
  cartOpen: false,
  cart: { version: 2, lines: [] },
  customizeState: null,
  customSelected: [],
  isLoading: false,
};

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

export const reduxSlice = createSlice({
  name: url,
  initialState,
  reducers: {
    SetSALE: (state, { payload }) => {
      state.sale = payload;
    },
    SetActiveTab: (state, { payload }) => {
      state.activeTab = payload;
    },
    SetFUEL: (state, { payload }) => {
      state.fuel = payload;
    },
    SetCART: (state, { payload }) => {
      state.cart = normalizeCart(payload);
    },
    SetCartOpen: (state, { payload }) => {
      state.cartOpen = Boolean(payload);
    },
    SetCustomizeState: (state, { payload }) => {
      state.customizeState = payload || null;
    },
    SetCustomSelected: (state, { payload }) => {
      state.customSelected = Array.isArray(payload) ? payload : [];
    },
    HydrateCart: (state, { payload }) => {
      state.cart = normalizeCart(payload);
    },
    CartClear: (state) => {
      state.cart = { version: 2, lines: [] };
    },
    CartAdd: (state, { payload }) => {
      const menuId = String(payload?.menuId || "");
      if (!menuId) return;

      const now = Date.now();
      const addOns = normalizeAddOns(payload?.addOns || []);
      const signature = createCartSignature(
        menuId,
        addOns.map((item) => item._id),
      );

      const lines = Array.isArray(state.cart?.lines) ? state.cart.lines : [];
      const index = lines.findIndex(
        (line) => String(line?.signature || "") === signature,
      );

      if (index > -1) {
        const current = lines[index];
        lines[index] = {
          ...current,
          quantity: (Number(current?.quantity) || 0) + 1,
          updatedAt: now,
        };
        state.cart = { version: 2, lines };
        return;
      }

      const nextLine = {
        id: createCartLineId(),
        menuId,
        quantity: 1,
        addOns,
        signature,
        updatedAt: now,
        addedAt: now,
      };

      state.cart = { version: 2, lines: [nextLine, ...lines] };
    },
    CartIncrement: (state, { payload }) => {
      const lineId = String(payload || "");
      if (!lineId) return;

      const now = Date.now();
      const lines = Array.isArray(state.cart?.lines) ? state.cart.lines : [];
      const index = lines.findIndex((line) => String(line?.id || "") === lineId);
      if (index === -1) return;

      const current = lines[index];
      lines[index] = {
        ...current,
        quantity: (Number(current?.quantity) || 0) + 1,
        updatedAt: now,
      };
      state.cart = { version: 2, lines };
    },
    CartDecrement: (state, { payload }) => {
      const lineId = String(payload || "");
      if (!lineId) return;

      const now = Date.now();
      const lines = Array.isArray(state.cart?.lines) ? state.cart.lines : [];
      const index = lines.findIndex((line) => String(line?.id || "") === lineId);
      if (index === -1) return;

      const current = lines[index];
      const nextQty = Math.max(0, (Number(current?.quantity) || 0) - 1);
      if (nextQty <= 0) {
        state.cart = { version: 2, lines: lines.filter((l) => l.id !== lineId) };
        return;
      }

      lines[index] = { ...current, quantity: nextQty, updatedAt: now };
      state.cart = { version: 2, lines };
    },
    CartRemove: (state, { payload }) => {
      const lineId = String(payload || "");
      if (!lineId) return;

      const lines = Array.isArray(state.cart?.lines) ? state.cart.lines : [];
      state.cart = { version: 2, lines: lines.filter((l) => l.id !== lineId) };
    },
    CartUpdateLineAddOns: (state, { payload }) => {
      const lineId = String(payload?.lineId || "");
      if (!lineId) return;

      const now = Date.now();
      const lines = Array.isArray(state.cart?.lines) ? state.cart.lines : [];
      const index = lines.findIndex((line) => String(line?.id || "") === lineId);
      if (index === -1) return;

      const current = lines[index];
      const addOns = normalizeAddOns(payload?.addOns || []);
      const signature = createCartSignature(
        String(current?.menuId || ""),
        addOns.map((item) => item._id),
      );

      lines[index] = {
        ...current,
        addOns,
        signature,
        updatedAt: now,
      };
      state.cart = { version: 2, lines };
    },
    RESET_SALE: (state) => {
      state.sale = 0;
      state.fuel = {};
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
      });
  },
});

export const {
  RESET,
  SetSALE,
  SetFUEL,
  SetCART,
  SetCartOpen,
  SetCustomizeState,
  SetCustomSelected,
  HydrateCart,
  CartAdd,
  CartIncrement,
  CartDecrement,
  CartRemove,
  CartClear,
  CartUpdateLineAddOns,
  RESET_SALE,
  SetActiveTab,
} = reduxSlice.actions;

export default reduxSlice.reducer;
