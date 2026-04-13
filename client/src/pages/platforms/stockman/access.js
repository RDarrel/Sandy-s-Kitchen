import { ClipboardList, Gauge, GitPullRequestArrow } from "lucide-react";
import Dashboard from "./dashboard";
import RequestFuel from "./requestFuel";
import { OrderProcessing } from "./manageOrders/orderProcessing";
import { ShortDeliveries } from "./manageOrders/shortDeliveries";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Request Fuel",
    path: "/request-fuel",
    icon: ClipboardList,
    component: RequestFuel,
  },
  {
    name: "Manage Fuel Orders",
    path: "/Manage-Orders",
    icon: GitPullRequestArrow,
    children: [
      {
        name: "Order Processing",
        path: "/Order-Processing",
        component: OrderProcessing,
      },
      {
        name: "Short Deliveries",
        path: "/Short-Deliveries",
        component: ShortDeliveries,
      },
    ],
  },
];

export default access;
