import {
  BookKey,
  BrickWall,
  ContactRound,
  Gauge,
  GitPullRequestArrow,
  Package,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Dashboard from "./dashboard";
import Staffs from "./staffs";
import Suppliers from "./suppliers";

import { ManageOrders } from "./manageOrders/shortDeliveries";
import { OrderProcessing } from "./manageOrders/orderProcessing";
import Transactions from "./reports/transactions";
import Sales from "./reports/sales";
import Audit from "./audit";
import Items from "./menu/items";
import Inventory from "./inventory";

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
    component: Inventory,
  },
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
        component: Items,
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
    name: "Manage Fuel Orders",
    path: "/Manage-Orders",
    icon: GitPullRequestArrow,
    children: [
      {
        name: "Order Processing",
        path: "/Order-Processing",
        icon: GitPullRequestArrow,
        component: OrderProcessing,
      },
      {
        name: "Short Deliveries",
        path: "/Short-Deliveries",
        icon: GitPullRequestArrow,
        component: ManageOrders,
      },
    ],
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BookKey,
    children: [
      {
        name: "Sales ",
        path: "/sales",
        icon: GitPullRequestArrow,
        component: Sales,
      },
      {
        name: "Transactions",
        path: "/transactions",
        icon: GitPullRequestArrow,
        component: Transactions,
      },
    ],
  },
  {
    name: "Audit Trail",
    path: "/audit",
    icon: BrickWall,
    component: Audit,
  },
];

export default access;
