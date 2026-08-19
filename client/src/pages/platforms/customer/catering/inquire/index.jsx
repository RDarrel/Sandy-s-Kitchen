import { cn } from "@/lib/utils";

import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  MapPin,
  Package,
  Salad,
  Utensils,
  UserRound,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/* =========================================================
   STEPS
========================================================= */

const steps = [
  {
    title: "Package",
    description: "Package details",
    icon: Package,
  },
  {
    title: "Main Courses",
    description: "Choose main dishes",
    icon: Utensils,
  },
  {
    title: "Side Menus",
    description: "Choose side dishes",
    icon: Salad,
  },
  {
    title: "Venue",
    description: "Choose a venue",
    icon: MapPin,
  },
  {
    title: "Details",
    description: "Your information",
    icon: UserRound,
  },
  {
    title: "Review",
    description: "Confirm inquiry",
    icon: ClipboardCheck,
  },
];

/* =========================================================
   STATIC DATA
========================================================= */

const mainCourseCategories = [
  {
    name: "Beef",
    limit: 1,
    choices: ["Beef Steak", "Beef Caldereta", "Beef Pepper Steak"],
  },
  {
    name: "Chicken",
    limit: 1,
    choices: ["Chicken BBQ", "Fried Chicken", "Chicken Teriyaki"],
  },
  {
    name: "Pork",
    limit: 1,
    choices: ["Crispy Pata", "Pork BBQ", "Pork Caldereta"],
  },
];

const sideMenuCategories = [
  {
    name: "Pasta",
    limit: 1,
    choices: ["Carbonara", "Spaghetti", "Baked Macaroni"],
  },
  {
    name: "Bilao",
    limit: 1,
    choices: ["Pancit Bihon", "Pancit Canton"],
  },
];

const venues = [
  {
    id: "venue-1",
    name: "Garden Pavilion",
    location: "General Tinio, Nueva Ecija",
    capacity: "Up to 100 guests",
    price: "₱15,000",
    recommended: true,
  },
  {
    id: "venue-2",
    name: "Grand Hall",
    location: "Cabanatuan City",
    capacity: "Up to 150 guests",
    price: "₱20,000",
  },
  {
    id: "venue-3",
    name: "Function Room",
    location: "Gapan City",
    capacity: "Up to 80 guests",
    price: "₱10,000",
  },
];

/* =========================================================
   MAIN
========================================================= */

const Inquire = () => {
  return (
    <div className="min-h-screen bg-muted/30 p-3 sm:p-5">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <button
          type="button"
          className="
            mb-3
            flex
            items-center
            gap-1.5
            text-xs
            font-medium
            text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          <ArrowLeft className="size-3.5" />
          Back to Packages
        </button>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {/* =================================================
              PACKAGE HEADER
          ================================================= */}

          <PackageHeader />

          {/* =================================================
              STEPPER
          ================================================= */}

          <Stepper
            defaultValue={1}
            orientation="vertical"
            className="
              grid
              grid-cols-[54px_minmax(0,1fr)]
              sm:grid-cols-[165px_minmax(0,1fr)]
            "
            indicators={{
              completed: <Check className="size-3.5" />,
            }}
          >
            {/* LEFT STEPPER */}
            <div
              className="
                border-r
                bg-muted/10
                px-1.5
                py-5
                sm:px-3
              "
            >
              <StepperNav>
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <StepperItem
                      key={step.title}
                      step={index + 1}
                      className="relative items-start not-last:flex-1"
                    >
                      <StepperTrigger
                        className="
                          w-full
                          items-start
                          gap-2.5
                          pb-9
                          last:pb-0
                        "
                      >
                        <StepperIndicator
                          className="
                            size-7
                            shrink-0
                            border
                            bg-background
                            data-[state=active]:border-primary
                            data-[state=active]:bg-primary
                            data-[state=active]:text-primary-foreground
                            data-[state=completed]:border-primary
                            data-[state=completed]:bg-primary
                            data-[state=completed]:text-white
                          "
                        >
                          <Icon className="size-3.5 sm:hidden" />

                          <span className="hidden text-xs sm:inline">
                            {index + 1}
                          </span>
                        </StepperIndicator>

                        {/* Desktop */}
                        <div className="hidden min-w-0 pt-0.5 text-left sm:block">
                          <StepperTitle className="truncate text-xs font-semibold">
                            {step.title}
                          </StepperTitle>

                          <StepperDescription className="mt-0.5 truncate text-[10px]">
                            {step.description}
                          </StepperDescription>
                        </div>
                      </StepperTrigger>

                      {index < steps.length - 1 && (
                        <StepperSeparator
                          className="
                            absolute
                            left-3.5
                            top-8
                            -order-1
                            m-0
                            h-[calc(100%-2rem)]
                            -translate-x-1/2
                            bg-border
                            group-data-[state=completed]/step:bg-primary
                          "
                        />
                      )}
                    </StepperItem>
                  );
                })}
              </StepperNav>
            </div>

            {/* RIGHT CONTENT */}
            <StepperPanel className="min-w-0">
              {/* =================================================
                  1. PACKAGE
              ================================================= */}

              <StepperContent value={1} className="p-4 sm:p-5">
                <StepHeader
                  title="Package Details"
                  description="Tell us about your event before customizing your package."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Number of Guests" required>
                    <Input type="number" placeholder="e.g. 80" />

                    <FieldHint>Minimum of 50 guests</FieldHint>
                  </Field>

                  <Field label="Event Type" required>
                    <select
                      className="
                        h-9
                        w-full
                        rounded-md
                        border
                        bg-background
                        px-3
                        text-sm
                        outline-none
                        focus:border-primary
                        focus:ring-2
                        focus:ring-primary/10
                      "
                    >
                      <option value="">Select event type</option>
                      <option>Wedding</option>
                      <option>Birthday Party</option>
                      <option>Debut</option>
                      <option>Christening / Baptism</option>
                      <option>Corporate Event</option>
                    </select>
                  </Field>

                  <Field label="Preferred Date" required>
                    <Input type="date" />
                  </Field>

                  <Field label="Preferred Time">
                    <Input type="time" />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Event Location">
                      <Input placeholder="City / Municipality" />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Additional Notes">
                      <Textarea
                        className="min-h-20 resize-none"
                        placeholder="Tell us anything else we should know..."
                      />
                    </Field>
                  </div>
                </div>

                <StepActions />
              </StepperContent>

              {/* =================================================
                  2. MAIN COURSES
              ================================================= */}

              <StepperContent value={2} className="p-4 sm:p-5">
                <StepHeader
                  title="Main Courses"
                  description="Select the main dishes you want in your catering package."
                  badge="Choose up to 3"
                />

                <MenuSelection
                  categories={mainCourseCategories}
                  totalLimit={3}
                />

                <StepActions />
              </StepperContent>

              {/* =================================================
                  3. SIDE MENUS
              ================================================= */}

              <StepperContent value={3} className="p-4 sm:p-5">
                <StepHeader
                  title="Side Menus"
                  description="Complete your package by selecting your preferred side dishes."
                  badge="Choose up to 2"
                />

                <MenuSelection categories={sideMenuCategories} totalLimit={2} />

                <StepActions />
              </StepperContent>

              {/* =================================================
                  4. VENUE
              ================================================= */}

              <StepperContent value={4} className="p-4 sm:p-5">
                <StepHeader
                  title="Choose a Venue"
                  description="Reserve one of our available venues together with your catering package."
                />

                <div className="mb-3 flex items-center gap-2 rounded-md border border-primary/15 bg-primary/5 px-3 py-2">
                  <MapPin className="size-4 shrink-0 text-primary" />

                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      Venue is optional.
                    </span>{" "}
                    You can also provide your own venue.
                  </p>
                </div>

                <RadioGroup defaultValue="venue-1" className="space-y-2">
                  {venues.map((venue) => (
                    <VenueOption key={venue.id} {...venue} />
                  ))}
                </RadioGroup>

                <StepActions />
              </StepperContent>

              {/* =================================================
                  5. DETAILS
              ================================================= */}

              <StepperContent value={5} className="p-4 sm:p-5">
                <StepHeader
                  title="Contact Details"
                  description="We'll use these details to respond to your inquiry."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Full Name" required>
                      <Input placeholder="Juan Dela Cruz" />
                    </Field>
                  </div>

                  <Field label="Email Address" required>
                    <Input type="email" placeholder="juan@email.com" />
                  </Field>

                  <Field label="Phone Number" required>
                    <Input placeholder="09XXXXXXXXX" />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Additional Request">
                      <Textarea
                        className="min-h-20 resize-none"
                        placeholder="Any special requests?"
                      />
                    </Field>
                  </div>
                </div>

                <StepActions />
              </StepperContent>

              {/* =================================================
                  6. REVIEW
              ================================================= */}

              <StepperContent value={6} className="p-4 sm:p-5">
                <StepHeader
                  title="Review Your Inquiry"
                  description="Review your package selections before sending."
                />

                <div className="space-y-3">
                  <ReviewCard
                    title="Package"
                    icon={Package}
                    items={[
                      ["Package", "Family Feast"],
                      ["Base Price", "₱20,000"],
                    ]}
                  />

                  <ReviewCard
                    title="Event"
                    icon={CalendarDays}
                    items={[
                      ["Guests", "80"],
                      ["Event Type", "Birthday Party"],
                      ["Date", "August 30, 2026"],
                      ["Time", "5:00 PM"],
                    ]}
                  />

                  <ReviewCard
                    title="Main Courses"
                    icon={Utensils}
                    items={[
                      ["Selected", "Beef Steak, Chicken BBQ, Crispy Pata"],
                    ]}
                  />

                  <ReviewCard
                    title="Side Menus"
                    icon={Salad}
                    items={[["Selected", "Carbonara, Pancit Bihon"]]}
                  />

                  <ReviewCard
                    title="Venue"
                    icon={MapPin}
                    items={[
                      ["Venue", "Garden Pavilion"],
                      ["Venue Fee", "₱15,000"],
                    ]}
                  />
                </div>

                {/* TOTAL */}
                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-between
                    gap-4
                    rounded-lg
                    border
                    border-primary/20
                    bg-primary/5
                    px-4
                    py-3
                  "
                >
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Estimated Total
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      Final amount will be confirmed.
                    </p>
                  </div>

                  <p className="text-xl font-bold text-primary">₱35,000</p>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button size="sm" className="h-9 gap-1.5 px-4">
                    Send Inquiry
                    <Check className="size-3.5" />
                  </Button>
                </div>
              </StepperContent>
            </StepperPanel>
          </Stepper>
        </div>
      </div>
    </div>
  );
};

export default Inquire;

/* =========================================================
   PACKAGE HEADER
========================================================= */

const PackageHeader = () => {
  return (
    <div className="border-b">
      <div className="px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Package name */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-2 py-0.5 text-[10px]"
              >
                Catering Package
              </Badge>
            </div>

            <h1 className="text-xl font-bold tracking-tight">Family Feast</h1>

            <p className="mt-0.5 text-xs text-muted-foreground">
              A complete catering package for your special event.
            </p>
          </div>

          {/* Price */}
          <div className="sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Package Price
            </p>

            <p className="text-2xl font-bold tracking-tight text-primary">
              ₱20,000
            </p>
          </div>
        </div>

        {/* Important package info */}
        <div className="mt-4 grid grid-cols-3 divide-x rounded-lg border bg-muted/20">
          <InfoItem icon={Users} value="50–100" label="Guests" />

          <InfoItem icon={Utensils} value="3" label="Main Courses" />

          <InfoItem icon={Salad} value="2" label="Side Menus" />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   HEADER INFO
========================================================= */

const InfoItem = ({ icon: Icon, value, label }) => {
  return (
    <div className="flex items-center justify-center gap-2 px-2 py-2.5 sm:gap-2.5">
      <Icon className="hidden size-4 text-primary sm:block" />

      <div className="text-center sm:text-left">
        <p className="text-sm font-bold leading-none">{value}</p>

        <p className="mt-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
          {label}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   STEP HEADER
========================================================= */

const StepHeader = ({ title, description, badge }) => {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight sm:text-lg">
            {title}
          </h2>

          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {badge && (
          <Badge
            className="
              shrink-0
              rounded-full
              border
              border-primary/20
              bg-primary/10
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-primary
              shadow-none
            "
          >
            {badge}
          </Badge>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   FIELD
========================================================= */

const Field = ({ label, required, children }) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}

        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      {children}
    </div>
  );
};

const FieldHint = ({ children }) => {
  return <p className="text-[10px] text-muted-foreground">{children}</p>;
};

/* =========================================================
   STEP ACTIONS
========================================================= */

const StepActions = () => {
  return (
    <div className="mt-6 flex items-center justify-between border-t pt-3">
      <Button variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs">
        <ChevronLeft className="size-3.5" />
        Back
      </Button>

      <Button size="sm" className="h-8 gap-1.5 px-3 text-xs">
        Continue
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
};

/* =========================================================
   MENU SELECTION
========================================================= */

const MenuSelection = ({ categories }) => {
  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category.name}
          className="
            overflow-hidden
            rounded-lg
            border
            bg-background
          "
        >
          {/* Category heading */}
          <div className="flex items-center justify-between border-b bg-muted/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary" />

              <h3 className="text-sm font-semibold">{category.name}</h3>
            </div>

            <Badge
              variant="outline"
              className="
                rounded-full
                border-primary/20
                bg-primary/5
                px-2
                py-0.5
                text-[10px]
                font-medium
                text-primary
              "
            >
              {category.limit === 1
                ? "Choose 1"
                : `Choose up to ${category.limit}`}
            </Badge>
          </div>

          {/* Choices */}
          <div className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2">
            {category.choices.map((choice) => (
              <label
                key={choice}
                className="
                  group
                  flex
                  cursor-pointer
                  items-center
                  gap-2
                  rounded-md
                  border
                  border-transparent
                  px-2.5
                  py-2
                  text-xs
                  transition-colors
                  hover:border-primary/15
                  hover:bg-primary/5
                  has-[:checked]:border-primary/20
                  has-[:checked]:bg-primary/5
                "
              >
                <input
                  type="checkbox"
                  className="
                    size-3.5
                    shrink-0
                    accent-primary
                  "
                />

                <span className="leading-4">{choice}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================================================
   VENUE OPTION
========================================================= */

const VenueOption = ({ id, name, location, capacity, price, recommended }) => {
  return (
    <label htmlFor={id} className="block cursor-pointer">
      <div
        className="
          flex
          items-center
          gap-3
          rounded-lg
          border
          px-3
          py-3
          transition-all
          hover:border-primary/30
          hover:bg-primary/[0.02]
          has-[:checked]:border-primary
          has-[:checked]:bg-primary/5
          has-[:checked]:shadow-sm
        "
      >
        <RadioGroupItem id={id} value={id} className="shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{name}</h3>

            {recommended && (
              <Badge
                className="
                  rounded-full
                  bg-primary/10
                  px-1.5
                  py-0
                  text-[9px]
                  text-primary
                  shadow-none
                "
              >
                Recommended
              </Badge>
            )}
          </div>

          <p className="mt-0.5 text-[10px] text-muted-foreground">{location}</p>

          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            <span className="text-muted-foreground">{capacity}</span>

            <span className="font-semibold text-foreground">{price}</span>
          </div>
        </div>
      </div>
    </label>
  );
};

/* =========================================================
   REVIEW CARD
========================================================= */

const ReviewCard = ({ title, icon: Icon, items }) => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2">
        <Icon className="size-3.5 text-primary" />

        <h3 className="text-xs font-semibold">{title}</h3>
      </div>

      <div className="divide-y">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="
              grid
              grid-cols-[90px_minmax(0,1fr)]
              gap-3
              px-3
              py-2
              text-xs
              sm:grid-cols-[120px_minmax(0,1fr)]
            "
          >
            <span className="text-muted-foreground">{label}</span>

            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
