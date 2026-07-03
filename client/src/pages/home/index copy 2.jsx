import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChefHat,
  Clock3,
  HeartHandshake,
  MapPin,
  Menu,
  PartyPopper,
  Phone,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const navItems = [
  { label: "Home", href: "#hero" },
  { label: "Specialties", href: "#specialties" },
  { label: "Services", href: "#services" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Book", href: "#book" },
];

const featuredDishes = [
  {
    name: "Kare-Kare Fiesta Tray",
    description:
      "Slow-braised, deeply savory, and finished with the rich peanut sauce guests remember.",
    price: "Starts at PHP 1,850",
    accent: "from-amber-300/70 via-orange-300/40 to-transparent",
  },
  {
    name: "Lechon Kawali Platter",
    description:
      "Crisp, juicy, and celebration-ready with house liver sauce and bright atchara.",
    price: "Starts at PHP 1,450",
    accent: "from-emerald-300/70 via-lime-300/40 to-transparent",
  },
  {
    name: "Signature Bilao Set",
    description:
      "A generous Filipino spread curated for birthdays, reunions, and office gatherings.",
    price: "Starts at PHP 2,400",
    accent: "from-rose-300/70 via-orange-200/40 to-transparent",
  },
];

const services = [
  {
    title: "Intimate Celebrations",
    description:
      "Thoughtful setups for birthdays, baptisms, and family lunches that still feel elevated.",
    icon: PartyPopper,
  },
  {
    title: "Full Catering Service",
    description:
      "From buffet styling to food flow, we help events feel polished and easy to host.",
    icon: UtensilsCrossed,
  },
  {
    title: "Venue + Food Packages",
    description:
      "A smoother all-in option when you want one team to handle the dining experience.",
    icon: Store,
  },
];

const highlights = [
  "Freshly cooked Filipino comfort food",
  "Elegant setup with warm hospitality",
  "Flexible packages for small to large events",
  "Fast inquiry response for reservations",
];

const testimonials = [
  {
    name: "Maria Santos",
    occasion: "Family reunion",
    quote:
      "The food felt festive, the styling looked premium, and the whole event ran smoothly from start to finish.",
  },
  {
    name: "Jose Reyes",
    occasion: "Corporate dinner",
    quote:
      "What stood out most was the balance of presentation and taste. Guests kept asking where we booked the catering.",
  },
  {
    name: "Ana Villanueva",
    occasion: "Wedding reception",
    quote:
      "Sandy's Kitchenette made the celebration feel personal, elegant, and incredibly easy for our family.",
  },
];

const stats = [
  { value: "500+", label: "Events served" },
  { value: "4.9/5", label: "Guest rating" },
  { value: "24 hrs", label: "Inquiry response" },
  { value: "100%", label: "Cooked fresh" },
];

const contactCards = [
  {
    title: "Call us",
    value: "+63 917 123 4567",
    icon: Phone,
  },
  {
    title: "Visit us",
    value: "General Tinio, Nueva Ecija",
    icon: MapPin,
  },
  {
    title: "Fast booking",
    value: "Dining, catering, and venue packages",
    icon: CalendarDays,
  },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  service: "catering",
  date: "",
  guests: "",
  message: "",
};

function SectionLabel({ children }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-px w-10 bg-emerald-700/40" />
      <span className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-900/70">
        {children}
      </span>
    </div>
  );
}

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    setForm(initialForm);

    window.setTimeout(() => {
      setSent(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen scroll-smooth bg-[linear-gradient(180deg,#fcfaf1_0%,#f4efe2_45%,#fffdf8_100%)] text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap');
        .home-serif { font-family: 'Cormorant Garamond', serif; }
        .home-sans { font-family: 'Manrope', sans-serif; }
      `}</style>

      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-emerald-900/10 bg-[#fffaf0]/90 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#hero" className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-lg shadow-emerald-950/20">
              <ChefHat className="size-5" />
            </div>
            <div>
              <p className="home-serif text-2xl font-bold leading-none text-emerald-950">
                Sandy&apos;s
              </p>
              <p className="home-sans text-[0.68rem] uppercase tracking-[0.35em] text-amber-700">
                Kitchenette
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="home-sans text-sm font-semibold text-slate-700 transition hover:text-emerald-900"
              >
                {item.label}
              </a>
            ))}
            <Button
              asChild
              className="home-sans rounded-full bg-emerald-900 px-6 text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-800"
            >
              <a href="#book">Reserve Now</a>
            </Button>
          </nav>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-emerald-900/20 bg-white/80 md:hidden"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="home-sans border-l-0 bg-[#fff9ee] px-6"
            >
              <SheetHeader className="px-0 pt-10">
                <SheetTitle className="home-serif text-3xl text-emerald-950">
                  Sandy&apos;s Kitchenette
                </SheetTitle>
                <SheetDescription className="text-slate-600">
                  Warm dining, memorable catering, and polished celebrations.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-3">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <a
                      href={item.href}
                      className="rounded-2xl border border-emerald-900/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                    >
                      {item.label}
                    </a>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button
                    asChild
                    className="mt-3 rounded-full bg-emerald-900 text-white hover:bg-emerald-800"
                  >
                    <a href="#book">Book Your Event</a>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="home-sans">
        <section id="hero" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.25),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.18),transparent_25%),linear-gradient(135deg,#fff9ee_0%,#f6f0df_38%,#eef7ef_100%)]" />
          <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:pb-28 lg:pt-16">
            <div className="flex flex-col justify-center">
              <Badge className="mb-5 w-fit rounded-full bg-white/80 px-4 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-emerald-900 shadow-sm">
                Elevated Filipino Dining
              </Badge>
              <h1 className="home-serif max-w-3xl text-5xl leading-none font-semibold text-emerald-950 sm:text-6xl lg:text-8xl">
                Celebrations feel warmer when the table looks this good.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                Sandy&apos;s Kitchenette blends comforting Filipino flavors with a
                refined event-ready presentation, so your home page now feels
                like a brand guests can trust at first glance.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-emerald-900 px-7 text-white shadow-xl shadow-emerald-950/20 hover:bg-emerald-800"
                >
                  <a href="#book">
                    Book an Event
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-emerald-900/20 bg-white/70 px-7 text-emerald-950 hover:bg-white"
                >
                  <a href="#specialties">View Specialties</a>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: Clock3,
                    title: "Quick replies",
                    value: "Within 24 hours",
                  },
                  {
                    icon: HeartHandshake,
                    title: "Packages",
                    value: "Dining, venue, catering",
                  },
                  {
                    icon: MapPin,
                    title: "Serving",
                    value: "General Tinio and nearby areas",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-lg shadow-amber-100/40 backdrop-blur"
                  >
                    <item.icon className="mb-3 size-5 text-emerald-900" />
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center">
              <div className="absolute inset-x-10 bottom-6 top-12 rounded-[2rem] bg-emerald-950/10 blur-3xl" />
              <Card className="relative overflow-hidden rounded-[2rem] border-white/70 bg-white/80 shadow-2xl shadow-emerald-950/10 backdrop-blur">
                <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(135deg,rgba(5,150,105,0.95),rgba(22,101,52,0.95),rgba(251,191,36,0.75))]" />
                <CardHeader className="relative pt-10">
                  <div className="mb-5 flex items-center justify-between">
                    <Badge className="rounded-full bg-white/90 px-3 py-1 text-emerald-900">
                      Signature Experience
                    </Badge>
                    <div className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-amber-600">
                      <Star className="size-4 fill-current" />
                      4.9
                    </div>
                  </div>
                  <CardTitle className="home-serif mt-16 text-4xl text-emerald-950">
                    Crafted for memorable gatherings
                  </CardTitle>
                  <CardDescription className="text-base leading-7 text-slate-600">
                    A homepage that looks more premium, more intentional, and
                    better aligned with a catering brand people can book.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 pb-8">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contactCards.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-emerald-900/10 bg-[#fffaf2] p-4"
                      >
                        <item.icon className="mb-3 size-5 text-emerald-900" />
                        <p className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-3xl bg-emerald-950 p-6 text-white">
                    <div className="flex items-center gap-2 text-amber-300">
                      <Sparkles className="size-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.28em]">
                        Brand Highlight
                      </span>
                    </div>
                    <p className="home-serif mt-3 text-3xl leading-tight">
                      From everyday dining to milestone events, everything feels
                      cohesive and celebration-ready.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-y border-emerald-950/10 bg-white/70">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((item) => (
              <div key={item.label} className="rounded-3xl bg-white px-6 py-5 shadow-sm">
                <p className="home-serif text-4xl font-semibold text-emerald-950">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="specialties" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionLabel>Featured Specialties</SectionLabel>
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="home-serif text-4xl font-semibold text-emerald-950 sm:text-5xl">
                A richer, cleaner showcase for your best dishes.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                Instead of one long visual wall, the page now guides visitors
                through standout offerings with stronger contrast, better card
                composition, and more premium spacing.
              </p>
              <div className="mt-8 space-y-4">
                {highlights.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 text-emerald-700" />
                    <p className="text-sm leading-7 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {featuredDishes.map((dish) => (
                <Card
                  key={dish.name}
                  className="group relative overflow-hidden rounded-[1.75rem] border-0 bg-slate-950 text-white shadow-xl shadow-slate-900/10"
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-36 bg-gradient-to-br ${dish.accent}`}
                  />
                  <CardHeader className="relative pt-8">
                    <Badge className="w-fit rounded-full bg-white/12 text-white backdrop-blur">
                      Crowd Favorite
                    </Badge>
                    <CardTitle className="home-serif mt-8 text-3xl leading-tight">
                      {dish.name}
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      {dish.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative flex items-end justify-between pb-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
                      {dish.price}
                    </p>
                    <ArrowRight className="size-5 text-white/70 transition group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="services"
          className="bg-[linear-gradient(135deg,#103d31_0%,#164e3d_45%,#173225_100%)] py-20 text-white"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionLabel>Services</SectionLabel>
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="home-serif text-4xl font-semibold sm:text-5xl">
                  A fuller event story, not just a pretty hero section.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-emerald-50/75">
                  The new layout gives each offer its own space so visitors can
                  understand what you do quickly and feel confident booking.
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 px-6 text-white hover:bg-white/15 hover:text-white"
              >
                <a href="#book">Start an Inquiry</a>
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {services.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-[1.75rem] border border-white/10 bg-white/8 text-white shadow-none backdrop-blur"
                >
                  <CardHeader>
                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white/12">
                      <item.icon className="size-5 text-amber-300" />
                    </div>
                    <CardTitle className="home-serif text-3xl">
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-emerald-50/75">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="testimonials"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <SectionLabel>Testimonials</SectionLabel>
          <div className="mb-10 max-w-3xl">
            <h2 className="home-serif text-4xl font-semibold text-emerald-950 sm:text-5xl">
              Social proof now reads cleaner and feels more trustworthy.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              I also shifted this section into calmer cards so reviews support
              the brand instead of visually competing with the rest of the page.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {testimonials.map((item) => (
              <Card
                key={item.name}
                className="rounded-[1.75rem] border-emerald-950/10 bg-white/80 shadow-lg shadow-emerald-950/5"
              >
                <CardHeader>
                  <div className="mb-2 flex gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={`${item.name}-${index}`} className="size-4 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-base leading-8 text-slate-700">
                    &ldquo;{item.quote}&rdquo;
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.occasion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          id="book"
          className="relative overflow-hidden bg-[linear-gradient(180deg,#fff8ea_0%,#f6f0e0_100%)] py-20"
        >
          <div className="absolute left-0 top-20 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute bottom-0 right-12 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <div>
              <SectionLabel>Booking</SectionLabel>
              <h2 className="home-serif text-4xl font-semibold text-emerald-950 sm:text-5xl">
                Let guests feel the celebration before they even arrive.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                This booking area is now more polished and easier to scan, with
                shadcn/ui form controls that match the rest of the page.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Ideal for birthdays, reunions, weddings, and corporate events",
                  "Clear call-to-action with stronger visual contrast",
                  "Cleaner mobile experience with a proper slide-in menu",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 text-emerald-700" />
                    <p className="text-sm leading-7 text-slate-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="rounded-[2rem] border-white/60 bg-white/85 shadow-2xl shadow-emerald-950/10 backdrop-blur">
              <CardHeader>
                <Badge className="mb-3 w-fit rounded-full bg-emerald-900 px-3 py-1 text-white">
                  Reservation Form
                </Badge>
                <CardTitle className="home-serif text-4xl text-emerald-950">
                  Plan your next event
                </CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Share a few details and your team can follow up with a custom
                  package or reservation flow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sent ? (
                  <div className="rounded-[1.5rem] bg-emerald-950 px-6 py-10 text-center text-white">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/10">
                      <PartyPopper className="size-7 text-amber-300" />
                    </div>
                    <h3 className="home-serif mt-5 text-3xl">Inquiry sent</h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/75">
                      Your redesigned booking section is working and ready for
                      the next step once you connect it to a real backend flow.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Full name
                        </label>
                        <Input
                          value={form.name}
                          onChange={(event) =>
                            updateField("name", event.target.value)
                          }
                          placeholder="Juan dela Cruz"
                          className="h-11 rounded-xl border-slate-200 bg-[#fffdf8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(event) =>
                            updateField("email", event.target.value)
                          }
                          placeholder="juan@email.com"
                          className="h-11 rounded-xl border-slate-200 bg-[#fffdf8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Phone
                        </label>
                        <Input
                          value={form.phone}
                          onChange={(event) =>
                            updateField("phone", event.target.value)
                          }
                          placeholder="+63 9XX XXX XXXX"
                          className="h-11 rounded-xl border-slate-200 bg-[#fffdf8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Service
                        </label>
                        <Select
                          value={form.service}
                          onValueChange={(value) => updateField("service", value)}
                        >
                          <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-[#fffdf8]">
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dining">Dining Reservation</SelectItem>
                            <SelectItem value="catering">Catering Service</SelectItem>
                            <SelectItem value="venue">Venue Rental</SelectItem>
                            <SelectItem value="package">
                              Venue and Catering Package
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Event date
                        </label>
                        <Input
                          type="date"
                          value={form.date}
                          onChange={(event) =>
                            updateField("date", event.target.value)
                          }
                          className="h-11 rounded-xl border-slate-200 bg-[#fffdf8]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Guests
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={form.guests}
                          onChange={(event) =>
                            updateField("guests", event.target.value)
                          }
                          placeholder="50"
                          className="h-11 rounded-xl border-slate-200 bg-[#fffdf8]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Notes
                      </label>
                      <Textarea
                        value={form.message}
                        onChange={(event) =>
                          updateField("message", event.target.value)
                        }
                        placeholder="Tell us about the event theme, food preferences, or setup you have in mind."
                        className="min-h-32 rounded-2xl border-slate-200 bg-[#fffdf8]"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full rounded-full bg-emerald-900 text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-800"
                    >
                      Send Booking Request
                      <ArrowRight className="size-4" />
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-emerald-950/10 bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="home-serif text-3xl">Sandy&apos;s Kitchenette</p>
            <p className="mt-1 text-sm text-white/65">
              Warm Filipino dining and event-ready hospitality.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
          <p className="text-sm text-white/55">
            Copyright 2026 Sandy&apos;s Kitchenette. Designed for a stronger first
            impression.
          </p>
        </div>
      </footer>
    </div>
  );
}
