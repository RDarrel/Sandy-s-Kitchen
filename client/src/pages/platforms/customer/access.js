import { Building2, ClipboardList, Gauge, UtensilsIcon } from "lucide-react";
import { Catering, Venues } from "./events";
import MyBookings from "./myBookings";

const access = [
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
    name: "My Bookings",
    path: "/my-bookings",
    icon: ClipboardList,
    component: MyBookings,
  },
];

export default access;
