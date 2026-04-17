import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/persons/auth";
import staffs from "./slices/persons/staffs";
import suppliers from "./slices/assets/suppliers";
import fuels from "./slices/assets/fuels";
import purchases from "./slices/assets/purchases";
import stocks from "./slices/assets/stocks";
import pos from "./slices/pos";
import deals from "./slices/commerce/deals";
import transactions from "./slices/commerce/transactions";
import audit from "./slices/audit";
import dashboard from "./slices/dashboard";
import { menu, menuCategory } from "./slices/menu";
import { inventoryItem } from "./slices/inventory";
const store = configureStore({
  reducer: {
    auth,
    menu,
    menuCategory,
    inventoryItem,
    staffs,
    suppliers,
    fuels,
    purchases,
    stocks,
    pos,
    deals,
    transactions,
    dashboard,
    audit,
  },
});

export default store;
