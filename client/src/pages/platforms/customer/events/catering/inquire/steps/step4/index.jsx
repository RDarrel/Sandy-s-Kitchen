import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Home, Users, Eye, MapPin, Check, Clock, Pencil } from "lucide-react";

import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Cloudinary from "@/services/utilities/cloudinary";
import Header from "../header";

/* -------------------------------------------------------------------------- */
/* STEP 4                                                                     */
/* -------------------------------------------------------------------------- */

const Step4 = ({ venues = [], form, setForm = () => {} }) => {
  const { isLoading } = useSelector(({ venues }) => venues);
  const navigate = useNavigate();

  const handleView = useCallback(
    (venue) => {
      sessionStorage.setItem(
        "venueDraft",
        JSON.stringify({
          selected: venue,
          isReview: true,
        }),
      );

      navigate("/platforms/venues/details");
    },
    [navigate],
  );

  const filteredVenues = useMemo(() => {
    const requestedPax = Number(form?.venue?.pax) || 0;

    if (!requestedPax) return venues;

    return venues.filter((venue) => {
      if (venue?._id === "own-venue") return true;

      return Number(venue?.capacity) >= requestedPax;
    });
  }, [form?.venue?.pax, venues]);

  if (isLoading) {
    return <Step4Skeleton />;
  }

  return (
    <div className="w-full min-w-0">
      <VenueHeader form={form} count={venues.length} />

      <div className="grid w-full gap-2">
        {venues.map((venue) => (
          <VenueOption
            key={venue._id}
            venue={venue}
            selected={form?.venue?.item === venue._id}
            onSelect={() =>
              setForm((prev) => ({
                ...prev,
                venue: {
                  ...prev?.venue,
                  item: venue._id,
                },
              }))
            }
            handleView={handleView}
          />
        ))}

        {!filteredVenues.length && <NoMatchingVenues />}
      </div>
    </div>
  );
};

export default Step4;

/* -------------------------------------------------------------------------- */
/* VENUE HEADER                                                               */
/* -------------------------------------------------------------------------- */

const VenueHeader = ({ form, count = 0 }) => {
  const pax = form?.venue?.pax;
  const start = form?.venue?.time?.start;
  const end = form?.venue?.time?.end;

  return (
    <div className="mb-2.5">
      <Header
        title={" Venue requirements"}
        description={" Review the guest count and time needed for the venue."}
      />
      {/* Compact booking details */}

      <div className="-mt-1 flex min-w-0 items-center rounded-md border border-border bg-card px-2 py-1">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden text-[11px] sm:text-xs">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-muted/40 px-1.5 py-1">
            <Users className="size-3 text-muted-foreground sm:size-3.5" />

            <span className="font-medium text-foreground">{pax || "—"}</span>

            <span className="text-muted-foreground">guests</span>
          </span>

          <span className="mx-2 h-3 w-px shrink-0 bg-border" />

          <span className="inline-flex min-w-0 items-center gap-1 rounded-sm bg-muted/40 px-1.5 py-1">
            <Clock className="size-3 shrink-0 text-muted-foreground sm:size-3.5" />

            <span className="truncate font-medium text-foreground">
              {formatTime(start)} – {formatTime(end)}
            </span>
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-1 h-6 shrink-0 gap-1 px-1.5 text-[11px] text-primary hover:bg-primary/5 hover:text-primary sm:h-7 sm:text-xs"
        >
          <Pencil className="size-3" />
          <span className="hidden xs:inline">Change</span>
          <span className="xs:hidden">Edit</span>
        </Button>
      </div>
      <div className="mt-3 mb-2 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            Available venues
          </h3>

          <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
            Select a venue that best fits your event.
          </p>
        </div>

        <span className="mb-0.5 shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {count} {count === 1 ? "venue" : "venues"}
        </span>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* FORMAT TIME                                                                */
/* -------------------------------------------------------------------------- */

const formatTime = (time) => {
  if (!time) return "—";

  const [hours, minutes] = String(time).split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

/* -------------------------------------------------------------------------- */
/* NO MATCHING VENUES                                                         */
/* -------------------------------------------------------------------------- */

const NoMatchingVenues = () => {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-4 text-center">
      <p className="text-sm font-medium text-foreground">No matching venues</p>

      <p className="mx-auto mt-0.5 max-w-md text-[11px] leading-4 text-muted-foreground sm:text-xs">
        No venues match your current guest count and schedule. Change your
        booking details to see other options.
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* STEP SKELETON                                                              */
/* -------------------------------------------------------------------------- */

const Step4Skeleton = () => {
  return (
    <div className="w-full min-w-0">
      <div className="mb-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-1 h-3 w-40" />
          </div>

          <Skeleton className="h-3 w-10" />
        </div>

        <div className="mt-1.5 flex h-8 items-center justify-between rounded-md border border-border px-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-24" />
          </div>

          <Skeleton className="h-5 w-12" />
        </div>
      </div>

      <div className="grid w-full gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <VenueOptionSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* VENUE OPTION SKELETON                                                      */
/* -------------------------------------------------------------------------- */

const VenueOptionSkeleton = () => {
  return (
    <div className="w-full min-w-0 rounded-lg border border-border p-2">
      <div className="flex min-w-0 items-center gap-2">
        <Skeleton className="size-4 shrink-0 rounded-full" />

        <Skeleton className="size-14 shrink-0 rounded-md sm:h-16 sm:w-20" />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-14" />
          </div>

          <Skeleton className="mt-1 h-3 w-4/5" />

          <div className="mt-1.5 flex gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* VENUE OPTION                                                               */
/* -------------------------------------------------------------------------- */

const VenueOption = ({
  venue,
  selected,
  onSelect = () => {},
  handleView = () => {},
}) => {
  const isOwnVenue = venue?._id === "own-venue";
  const image = venue?.images?.[0];

  const imageUrl =
    !isOwnVenue && image
      ? Cloudinary.getVenueImg(image?.version, venue?._id, `image-${image?.id}`)
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`
        group w-full min-w-0 cursor-pointer rounded-lg border
        p-2 outline-none transition-colors
        hover:border-primary/40 hover:bg-primary/[0.02]
        focus-visible:ring-2 focus-visible:ring-primary/30
        sm:p-2.5
        ${selected ? "border-primary bg-primary/5" : "border-border"}
      `}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        {/* Selection */}
        <div
          className={`
            flex size-4 shrink-0 items-center justify-center
            rounded-full border
            ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }
          `}
        >
          {selected && <Check className="size-2.5" />}
        </div>

        {/* Image */}
        <div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted sm:h-16 sm:w-20">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={venue?.name || "Venue"}
              className="h-full w-full object-cover brightness-95 transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Home className="size-5 text-muted-foreground/40 sm:size-6" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name + price */}
          <div className="flex min-w-0 items-start justify-between gap-2">
            <h3 className="min-w-0 truncate text-xs font-semibold text-foreground sm:text-sm">
              {venue?.name}
            </h3>

            <span className="shrink-0 whitespace-nowrap text-xs font-bold text-primary sm:text-sm">
              {isOwnVenue ? "Free" : Formatter.amount(venue?.basePrice)}
            </span>
          </div>

          {/* Address */}
          <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[10px] leading-4 text-muted-foreground sm:text-xs">
            <MapPin className="size-3 shrink-0" />

            <span className="truncate">
              {isOwnVenue ? "Use your own location" : venue?.address}
            </span>
          </p>

          {/* Bottom information */}
          <div className="mt-1 flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-[10px] text-muted-foreground sm:gap-3 sm:text-xs">
              {!isOwnVenue ? (
                <>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <Users className="size-3" />
                    {venue?.capacity}
                  </span>

                  <span className="inline-flex min-w-0 items-center gap-1">
                    <Home className="size-3 shrink-0" />

                    <span className="truncate">{venue?.setting}</span>
                  </span>
                </>
              ) : (
                <span className="truncate">No additional venue charges</span>
              )}
            </div>

            {!isOwnVenue && (
              <DetailsButton venue={venue} handleView={handleView} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* DETAILS BUTTON                                                             */
/* -------------------------------------------------------------------------- */

const DetailsButton = ({ venue, handleView = () => {} }) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-5 shrink-0 gap-1 px-1 text-[10px] text-muted-foreground hover:text-foreground sm:h-6 sm:px-1.5 sm:text-xs"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        handleView(venue);
      }}
    >
      <Eye className="size-3" />

      <span className="hidden min-[380px]:inline">Details</span>
    </Button>
  );
};
