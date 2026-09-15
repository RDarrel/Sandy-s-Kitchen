import { Building2, ClipboardList, Gauge, UtensilsIcon } from "lucide-react";
import Dashboard from "./dashboard";
import { Catering, Venues } from "./events";

const access = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Gauge,
    component: Dashboard,
  },
  {
    name: "Catering",
    path: "/catering",
    icon: UtensilsIcon,
    component: Catering,
  },
  {
    name: "Venues",
    path: "/venues",
    icon: Building2,
    component: Venues,
  },
  {
    name: "My Inquiries",
    path: "/my-inquiries",
    icon: ClipboardList,
    component: Venues,
  },
];

export default access;
