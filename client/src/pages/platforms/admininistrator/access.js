import {
  ContactRound,
  Gauge,
  GitPullRequestArrow,
  Package,
  Users,
  UtensilsCrossed,
  Boxes,
  CalendarDays,
  BrickWall,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import Dashboard from "./dashboard";
import Staffs from "./staffs";
import Suppliers from "./suppliers";
import Items from "./menu/items";
import Categories from "./menu/categories";
import AddOns from "./menu/addOns";
import CreateOrder from "./orders/create-order";
import OrderList from "./orders/order-list";
import ShortDeliveries from "./orders/short-deliveries";
import StockRequests from "./orders/stock-requests";
import StockItems from "./inventory";
import { Equipment, Services } from "./resources";
import { Bookings, CateringPackages, Venues } from "./events";
import Audit from "./audit";
import Policy from "./policy";

export const ADMIN_MANAGEMENT = [
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
    component: StockItems,
  },
  {
    name: "Resources",
    path: "/resources",
    icon: Boxes,
    children: [
      {
        name: "Equipment",
        path: "/equipment",
        component: Equipment,
      },
      {
        name: "Services",
        path: "/services",
        component: Services,
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
    name: "Events",
    path: "/events",
    icon: CalendarDays,
    children: [
      {
        name: "Catering Packages",
        path: "/packages",
        component: CateringPackages,
      },
      {
        name: "Venues",
        path: "/venues",
        component: Venues,
      },
      {
        name: "Bookings",
        path: "/bookings",
        component: Bookings,
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
];

export const ADMIN_SYSTEM = [
  {
    name: "Audit Trail",
    path: "/audit",
    icon: BrickWall,
    component: Audit,
  },
  {
    name: "Booking Policy",
    path: "/booking-policy",
    icon: ClipboardList,
    component: Policy,
  },
  {
    name: "Payment Methods",
    path: "/payment-methods",
    icon: CreditCard,
    component: Policy,
  },
];
