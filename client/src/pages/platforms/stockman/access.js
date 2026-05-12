import { ClipboardList, Gauge, GitPullRequestArrow } from "lucide-react";
import Dashboard from "./dashboard";
import RequestStock from "./request-stock/create-request";
import MyRequests from "./request-stock/my-requests";
import orderList from "./orders/order-list";
import shortDeliveries from "./orders/short-deliveries";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Stock Requests",
    path: "/stock-requests",
    icon: ClipboardList,
    children: [
      {
        name: "Create Request",
        path: "/Create-Request",
        component: RequestStock,
      },
      {
        name: "My Requests",
        path: "/My-Requests",
        component: MyRequests,
      },
    ],
  },
  {
    name: "Orders",
    path: "/Orders",
    icon: GitPullRequestArrow,
    children: [
      {
        name: "Order-List",
        path: "/Order-Processing",
        component: orderList,
      },
      {
        name: "Short Deliveries",
        path: "/Short-Deliveries",
        component: shortDeliveries,
      },
    ],
  },
];

export default access;
