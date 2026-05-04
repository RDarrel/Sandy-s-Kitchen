import { ClipboardList, Gauge, GitPullRequestArrow } from "lucide-react";
import Dashboard from "./dashboard";

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
  },
  {
    name: "Orders",
    path: "/Manage-Orders",
    icon: GitPullRequestArrow,
    children: [
      {
        name: "Order Processing",
        path: "/Order-Processing",
      },
      {
        name: "Short Deliveries",
        path: "/Short-Deliveries",
      },
    ],
  },
];

export default access;
