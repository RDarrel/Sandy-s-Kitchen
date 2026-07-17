import {
  BrickWall,
  ContactRound,
  Gauge,
  GitPullRequestArrow,
  Package,
  Users,
  UtensilsCrossed,
  ChefHat,
} from "lucide-react";
import Dashboard from "./dashboard";
import Staffs from "./staffs";
import Suppliers from "./suppliers";
import Audit from "./audit";
import Items from "./menu/items";
import Categories from "./menu/categories";
import AddOns from "./menu/addOns";
import CreateOrder from "./orders/create-order";
import OrderList from "./orders/order-list";
import ShortDeliveries from "./orders/short-deliveries";
import StockRequests from "./orders/stock-requests";
import Packages from "./catering/packages";

import { StockItems, Equipment } from "./inventory";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Package,
    children: [
      {
        name: "Stock Items",
        path: "/stock-items",
        component: StockItems,
      },
      {
        name: "Equipment",
        path: "/equipment",
        component: Equipment,
      },
    ],
  },
  // Base Recipes
  {
    name: "Menu",
    path: "/menu",
    icon: UtensilsCrossed,
    children: [
      {
        name: "Items",
        path: "/items",
        component: Items,
      },
      {
        name: "Add Ons",
        path: "/add-ons",
        component: AddOns,
      },
      {
        name: "Categories",
        path: "/categories",
        component: Categories,
      },
    ],
  },
  {
    name: "Catering",
    path: "/catering",
    icon: ChefHat,
    children: [
      {
        name: "Packages",
        path: "/packages",
        component: Packages,
      },
      {
        name: "Add Ons",
        path: "/add-ons",
        component: AddOns,
      },
    ],
  },

  {
    name: "Suppliers",
    path: "/suppliers",
    icon: ContactRound,
    component: Suppliers,
  },
  {
    name: "Staff",
    path: "/staff",
    icon: Users,
    component: Staffs,
  },

  {
    name: "Orders",
    path: "/orders",
    icon: Package,
    children: [
      {
        name: "Stock Requests",
        path: "/stock-requests",
        component: StockRequests,
      },
      {
        name: "Create Order",
        path: "/create-order",
        component: CreateOrder,
      },

      {
        name: "Order List",
        path: "/order-list",
        component: OrderList,
      },
      {
        name: "Short Deliveries",
        path: "/Short-Deliveries",
        icon: GitPullRequestArrow,
        component: ShortDeliveries,
      },
    ],
  },
  // Requests → Orders → Delivered

  {
    name: "Audit Trail",
    path: "/audit",
    icon: BrickWall,
    component: Audit,
  },
];

export default access;
