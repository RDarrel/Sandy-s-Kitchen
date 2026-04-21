import { Gauge } from "lucide-react";
import Cashier from ".";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Cashier,
  },
];

export default access;
