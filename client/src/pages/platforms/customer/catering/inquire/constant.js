import {
  CalendarDays,
  ClipboardCheck,
  MapPin,
  Salad,
  Utensils,
  UserRound,
} from "lucide-react";
export const DEFAULT_STEPS = [
  {
    title: "Event",
    description: "Date and guests",
    icon: CalendarDays,
  },
  {
    title: "Menu",
    description: "Food choices",
    icon: Utensils,
  },
  {
    title: "Side Menus",
    description: "Food choices",
    icon: Salad,
  },
  {
    title: "Venue",
    description: "Place setup",
    icon: MapPin,
  },
  {
    title: "Contact",
    description: "Your details",
    icon: UserRound,
  },
  {
    title: "Review",
    description: "Send inquiry",
    icon: ClipboardCheck,
  },
];

const DEFAULT_EVENT = {
  time: {
    start: null,
    end: null,
  },
  notes: null,
};
export const DEFAULT_FORM = {
  contact: {
    name: "",
    email: "",
    phone: "",
    preferredContact: "",
  },
  eventType: "",
  bookingType: "",
  catering: {
    pax: null,
    venueOption: null,
    //for own_venue only
    venue: {
      address: null,
      location: null,
    },
    mainCourses: [],
    sideDishes: [],
    time: {
      start: null,
      end: null,
    },
  },
  venue: {
    pax: 0,
    time: {
      start: null,
      end: null,
    },
  },
  notes: null,
};

export const FALLBACK_VENUES = [
  {
    _id: "own-venue",
    name: "Use my own venue",
    address: "Customer provided location",
    capacity: 0,
    basePrice: 0,
    setting: "External",
  },
];
