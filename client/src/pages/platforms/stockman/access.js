import { ClipboardList, Gauge, GitPullRequestArrow } from "lucide-react";
import Dashboard from "./dashboard";
import RequestStock from "./request-stock/create-request";
import MyRequests from "./request-stock/my-requests";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Stock Requests",
    path: "/request-fuel",
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
    path: "/Manage-Orders",
    icon: GitPullRequestArrow,
    children: [
      {
        name: "Order Processing",
        path: "/Order-Processing",
        component: Dashboard,
      },
      {
        name: "Short Deliveries",
        path: "/Short-Deliveries",
        component: Dashboard,
      },
    ],
  },
];

export default access;
