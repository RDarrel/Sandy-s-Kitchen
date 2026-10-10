import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Eye,
  MapPin,
  Check,
  Clock,
  Pencil,
  SlidersHorizontal,
  TriangleAlert,
} from "lucide-react";
import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AVAILABLE } from "@/services/redux/slices/events/venues";

import Cloudinary from "@/services/utilities/cloudinary";
import EmptyVenues from "./empty";
import Header from "../header";

const Step4 = ({ form, setForm = () => {}, setCurrentStep = () => {} }) => {
  const { isLoading, availableVenues } = useSelector(({ venues }) => venues);
  const dispatch = useDispatch();
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
  useEffect(() => {
    const startAt = form?.venue?.schedule?.startAt;
    const endAt = form?.venue?.schedule?.endAt;
    dispatch(
      AVAILABLE({
        start: startAt ? new Date(startAt).toISOString() : undefined,
        end: endAt ? new Date(endAt).toISOString() : undefined,
        pax: form?.venue?.pax,
        excludeBookingId: form?._id,
      }),
    )
      .unwrap()
      .then(({ data }) => {
        const selectedIsAvailable = data?.some(
          ({ _id }) => form?.venue?.item === _id,
        );
        if (!selectedIsAvailable) {
          setForm((prev) => ({ ...prev, venue: { ...prev?.venue, item: "" } }));
        }
      });
  }, [
    form?.venue?.time?.start,
    form?.venue?.time?.end,
    form?.venue?.pax,
    form?.date,
    form?._id,
    dispatch,
  ]);

  const handleEdit = () => {
    setCurrentStep(1);

    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  };

  if (isLoading) {
    return <Step4Skeleton form={form} />;
  }

  return (
    <div className="w-full min-w-0">
      <VenueHeader form={form} handleEdit={handleEdit} />

      {/* {selectedIsAvailable && (
        <UnavailableVenueNotice venue={form?.venue?.itemName} />
      )} */}

      <AvailableVenuesHeader count={availableVenues.length} />

      <div className="grid w-full gap-2">
        {availableVenues.map((venue) => (
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
                  itemName: venue?.name,
                },
              }))
            }
            handleView={handleView}
          />
        ))}

        {!availableVenues.length && <EmptyVenues handleEdit={handleEdit} />}
      </div>
    </div>
  );
};

export default Step4;

/* -------------------------------------------------------------------------- */
/* VENUE HEADER                                                               */
/* -------------------------------------------------------------------------- */

const VenueHeader = ({ form, handleEdit }) => {
  const pax = form?.venue?.pax;

  return (
    <div>
      <Header
        title="Venue reservation details"
        Icon={SlidersHorizontal}
        description="Review the guest count and time below."
      />

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
              {Formatter.bookingDateRange(form?.venue?.schedule)}
            </span>
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="ml-1 h-6 shrink-0 gap-1 px-1.5 text-[11px] text-primary  sm:h-7 sm:text-xs"
        >
          <Pencil className="size-3" />

          <span className="hidden xs:inline">Change</span>

          <span className="xs:hidden">Edit</span>
        </Button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* UNAVAILABLE VENUE NOTICE                                                   */
/* -------------------------------------------------------------------------- */

const UnavailableVenueNotice = ({ venueName }) => {
  return (
    <div className="mt-2.5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/60 px-2.5 py-2 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
      <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />

      <div className="min-w-0">
        <p className="text-xs font-semibold leading-4">
          Selected venue is no longer available
        </p>

        <p className="mt-0.5 text-[11px] leading-4 text-amber-800/90 dark:text-amber-200/80 sm:text-xs">
          <span className="font-medium">{venueName}</span> is unavailable for
          your current schedule. Please choose another venue.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* AVAILABLE VENUES HEADER                                                    */
/* -------------------------------------------------------------------------- */

const AvailableVenuesHeader = ({ count = 0, isLoading = false }) => {
  return (
    <div className="mb-2 mt-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">
          Available venues
        </h3>

        <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
          Select another venue that best fits your event.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="mb-0.5 h-5 w-16 shrink-0 rounded-full" />
      ) : (
        <span className="mb-0.5 shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {count} {count === 1 ? "venue" : "venues"}
        </span>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* FORMAT TIME                                                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* STEP SKELETON                                                              */
/* -------------------------------------------------------------------------- */

const Step4Skeleton = ({ form }) => {
  return (
    <div className="w-full min-w-0">
      <VenueHeader form={form} />

      <AvailableVenuesHeader isLoading />

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
    <div className="w-full min-w-0 rounded-lg border border-border p-2.5 sm:p-3">
      <div
        className="
          grid
          min-w-0
          grid-cols-[auto_70px_minmax(0,1fr)]
          gap-2.5
          sm:grid-cols-[auto_85px_minmax(0,1fr)_auto]
          sm:items-center
          sm:gap-3
        "
      >
        <Skeleton className="mt-1 size-4 shrink-0 rounded-full sm:mt-0 sm:size-[17px]" />

        <Skeleton
          className="
            h-[60px]
            w-[70px]
            shrink-0
            rounded-sm
            sm:h-[68px]
            sm:w-[85px]
          "
        />

        <div className="min-w-0">
          <Skeleton className="h-5 w-2/3 max-w-[14rem]" />

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            <Skeleton className="size-3 shrink-0" />
            <Skeleton className="h-4 w-full max-w-[20rem]" />
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <Skeleton className="size-3.5 shrink-0" />
              <Skeleton className="h-4 w-16" />
            </span>

            <span className="inline-flex items-center gap-1">
              <Skeleton className="size-3.5 shrink-0" />
              <Skeleton className="h-4 w-14" />
            </span>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 sm:hidden">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        </div>

        <div className="hidden shrink-0 flex-col items-end justify-center gap-1.5 sm:flex">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-20" />
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
        group
        w-full
        min-w-0
        cursor-pointer
        rounded-lg
        border
        p-2.5
        outline-none
        transition-all
        hover:border-primary/40
        hover:bg-primary/[0.02]
        focus-visible:ring-2
        focus-visible:ring-primary/30
        sm:p-3
        ${selected ? "border-primary bg-primary/5" : "border-border"}
      `}
    >
      <div
        className="
          grid
          min-w-0
          grid-cols-[auto_70px_minmax(0,1fr)]
          gap-2.5
          sm:grid-cols-[auto_85px_minmax(0,1fr)_auto]
          sm:items-center
          sm:gap-3
        "
      >
        {/* Selection */}
        <div
          className="
            mt-1
            flex
            size-4
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            sm:mt-0
            sm:size-[17px]
          "
        >
          {selected && (
            <div
              className="
                flex
                size-full
                items-center
                justify-center
                rounded-full
                bg-primary
                text-primary-foreground
              "
            >
              <Check className="size-2.5 sm:size-3" />
            </div>
          )}
        </div>

        {/* Image */}
        <div
          className="
            h-[60px]
            w-[70px]
            shrink-0
            overflow-hidden
            rounded-sm
            bg-muted
            sm:h-[68px]
            sm:w-[85px]
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={venue?.name || "Venue"}
              className="
                h-full
                w-full
                object-cover
                brightness-95
                transition-transform
                group-hover:scale-[1.02]
              "
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Home className="size-6 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold sm:text-[14px]">
            {venue?.name}
          </h3>

          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />

            <span className="truncate">
              {isOwnVenue ? "Use your own location" : venue?.address}
            </span>
          </p>

          {!isOwnVenue && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5 shrink-0" />
                Up to {venue?.capacity}
              </span>

              <span className="inline-flex items-center gap-1">
                <Home className="size-3.5 shrink-0" />
                {venue?.setting}
              </span>
            </div>
          )}

          {isOwnVenue && (
            <p className="mt-2 text-xs text-muted-foreground">
              No additional venue charges
            </p>
          )}

          {/* Mobile price + button */}
          <div
            className="mt-2.5 flex items-center justify-between gap-2 sm:hidden"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <PriceLabel
              price={isOwnVenue ? "Free" : Formatter.amount(venue?.basePrice)}
              showLabel={!isOwnVenue}
            />

            {!isOwnVenue && (
              <DetailsButton venue={venue} handleView={handleView} />
            )}
          </div>
        </div>

        {/* Desktop price + button */}
        <div
          className="hidden shrink-0 flex-col items-end justify-center gap-1.5 sm:flex"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <PriceLabel
            price={isOwnVenue ? "Free" : Formatter.amount(venue?.basePrice)}
            showLabel={!isOwnVenue}
          />

          {!isOwnVenue && (
            <DetailsButton venue={venue} handleView={handleView} />
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* PRICE LABEL                                                                */
/* -------------------------------------------------------------------------- */

const PriceLabel = ({ price, showLabel = false }) => {
  return (
    <span className="flex shrink-0 flex-col items-start gap-0.5 text-left sm:items-end sm:text-right">
      <span className="whitespace-nowrap text-sm font-bold leading-4 text-primary">
        {price}
      </span>

      {showLabel && (
        <span className="whitespace-nowrap text-[10px] font-medium leading-3 text-muted-foreground">
          Starting rate
        </span>
      )}
    </span>
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
      className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        handleView(venue);
      }}
    >
      <Eye className="size-3.5" />
      Details
    </Button>
  );
};
