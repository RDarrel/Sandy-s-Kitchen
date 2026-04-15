import {
  BookKey,
  BrickWall,
  ContactRound,
  Container,
  Fuel,
  Gauge,
  GitPullRequestArrow,
  TruckElectric,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import Dashboard from "./dashboard";
import Staffs from "./staffs";
import Suppliers from "./suppliers";
import Fuels from "./fuels";
import OrderFuel from "./orderFuel";
import Stocks from "../stockman/dashboard";
import { ManageOrders } from "./manageOrders/shortDeliveries";
import { OrderProcessing } from "./manageOrders/orderProcessing";
import Transactions from "./reports/transactions";
import Sales from "./reports/sales";
import Audit from "./audit";
import Items from "./menu/items";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
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
    name: "Stocks",
    path: "/stocks",
    icon: Container,
    component: Stocks,
  },

  {
    name: "Fuels",
    path: "/fuels",
    icon: Fuel,
    component: Fuels,
  },
  {
    name: "Order Fuel",
    path: "/order-fuel",
    icon: TruckElectric,
    component: OrderFuel,
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
