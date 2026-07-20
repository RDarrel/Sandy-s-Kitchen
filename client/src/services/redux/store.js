import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/persons/auth";
import staffs from "./slices/persons/staffs";
import pos from "./slices/pos";
import deals from "./slices/commerce/deals";
import transactions from "./slices/commerce/transactions";
import audit from "./slices/audit";
import dashboard from "./slices/dashboard";
import { addOns, menus, menuCategories } from "./slices/menu";
import {
  inventoryItems,
  stockBatch,
  stockMovements,
  equipment,
} from "./slices/inventory";
import { cashier } from "./slices/stations";
import { suppliers, purchases, stockRequests } from "./slices/procurement";
import { services } from "./slices/resources";
const store = configureStore({
  reducer: {
    stockBatch,
    cashier,
    auth,
    addOns,
    menus,
    stockMovements,
    menuCategories,
    inventoryItems,
    staffs,
    suppliers,
    stockRequests,
    purchases,
    pos,
    deals,
    transactions,
    dashboard,
    audit,
    equipment,
    services,
  },
});

export default store;
