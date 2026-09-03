import Header from "../header";
import { Home, Users, Eye, MapPin, Check } from "lucide-react";
import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import Cloudinary from "@/services/utilities/cloudinary";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

const Step4 = ({ venues, selectedVenueId, setSelectedVenueId }) => {
  const navigate = useNavigate();
  const handleView = useCallback((venue) => {
    sessionStorage.setItem("venue-review", JSON.stringify(venue));
    navigate("/platforms/venues?from=catering");
  }, []);
  return (
    <div className="w-full min-w-0">
      <Header
        title="Venue"
        description="Choose one of Sandy's Kitchen venues or use your own location."
      />

      <div className="grid w-full gap-2.5">
        {venues.map((venue) => (
          <VenueOption
            key={venue._id}
            venue={venue}
            selected={selectedVenueId === venue._id}
            onSelect={() => setSelectedVenueId(venue._id)}
            handleView={handleView}
          />
        ))}
      </div>
    </div>
  );
};

export default Step4;

/* -------------------------------------------------------------------------- */
/* VENUE OPTION                                                               */
/* -------------------------------------------------------------------------- */

const VenueOption = ({
  venue,
  selected,
  onSelect = () => {},
  handleView = () => {},
}) => {
  const isOwnVenue = venue._id === "own-venue";
  const image = venue?.images?.[0];

  const imageUrl =
    !isOwnVenue && image
      ? Cloudinary.getVenueImg(image?.version, venue?._id, `image-${image?.id}`)
      : null;

  return (
    <div
      role="button"
      tabIndex={0}
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
        {/* ---------------------------------------------------------------- */}
        {/* SELECTION                                                        */}
        {/* ---------------------------------------------------------------- */}

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

        {/* ---------------------------------------------------------------- */}
        {/* IMAGE                                                             */}
        {/* ---------------------------------------------------------------- */}

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
              alt={venue.name}
              className="
                h-full
                brightness-95
                w-full
                object-cover
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

        {/* ---------------------------------------------------------------- */}
        {/* MAIN CONTENT                                                      */}
        {/* ---------------------------------------------------------------- */}

        <div className="min-w-0">
          {/* NAME */}

          <h3 className="truncate text-sm font-semibold sm:text-[14px]">
            {venue.name}
          </h3>

          {/* ADDRESS */}

          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />

            <span className="truncate">
              {isOwnVenue ? "Use your own location" : venue.address}
            </span>
          </p>

          {/* VENUE DETAILS */}

          {!isOwnVenue && (
            <div
              className="
                mt-2
                flex
                flex-wrap
                gap-x-3
                gap-y-1
                text-xs
                text-muted-foreground
              "
            >
              <span className="inline-flex items-center gap-1">
                <Users className="size-3.5 shrink-0" />
                Up to {venue.capacity}
              </span>

              <span className="inline-flex items-center gap-1">
                <Home className="size-3.5 shrink-0" />
                {venue.setting}
              </span>
            </div>
          )}

          {isOwnVenue && (
            <p className="mt-2 text-xs text-muted-foreground">
              No additional venue charges
            </p>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* MOBILE PRICE + BUTTON                                            */}
          {/* ---------------------------------------------------------------- */}

          <div
            className="
              mt-2.5
              flex
              items-center
              justify-between
              gap-2

              sm:hidden
            "
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <span className="text-sm font-bold text-primary">
              {isOwnVenue ? "Free" : Formatter.amount(venue.basePrice)}
            </span>

            {!isOwnVenue && (
              <DetailsButton venue={venue} handleView={handleView} />
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* DESKTOP PRICE + BUTTON                                            */}
        {/* ---------------------------------------------------------------- */}

        <div
          className="
            hidden
            shrink-0
            flex-col
            items-end
            justify-center
            gap-1.5

            sm:flex
          "
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <span className="whitespace-nowrap text-sm font-bold text-primary">
            {isOwnVenue ? "Free" : Formatter.amount(venue.basePrice)}
          </span>

          {!isOwnVenue && (
            <DetailsButton venue={venue} handleView={handleView} />
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* STATIC DETAILS BUTTON                                                      */
/* -------------------------------------------------------------------------- */

const DetailsButton = ({ venue, handleView = () => {} }) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="
        h-7
        shrink-0
        gap-1
        px-2
        text-xs
        text-muted-foreground
        hover:text-foreground
      "
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
