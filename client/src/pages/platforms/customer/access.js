import { Building2, ClipboardList, Gauge, UtensilsIcon } from "lucide-react";
import Dashboard from "./dashboard";
import Catering from "./catering";
import Venue from "./venueS";

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
    component: Venue,
  },
  {
    name: "My Inquiries",
    path: "/my-inquiries",
    icon: ClipboardList,
    component: Venue,
  },
];

export default access;
