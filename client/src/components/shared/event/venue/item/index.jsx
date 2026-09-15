import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  Home,
  MapPin,
  UsersRound,
} from "lucide-react";
import Gallery from "./gallery";
import { Formatter } from "@/services/utilities";

const Item = ({ isWebsite = true, venue, handleInquire = () => {} }) => {
  const getVisibleItems = useCallback((items, maxVisible) => {
    const hasHidden = venue?.inclusions?.length > maxVisible;
    const visibleItems = items?.slice(0, maxVisible);
    const hiddenItems = items?.length - visibleItems?.length;

    return { hasHidden: hasHidden && hiddenItems, visibleItems, hiddenItems };
  }, []);

  const {
    hasHidden: hasHiddenIncludes,
    visibleItems: visibleIncludes,
    hiddenItems: hiddenIncludes,
  } = useMemo(() => {
    return getVisibleItems(venue?.inclusions, 5);
  }, [venue, getVisibleItems]);

  const {
    hasHidden: hasHiddenTypes,
    visibleItems: visibleTypes,
    hiddenItems: hiddenTypes,
  } = useMemo(() => {
    return getVisibleItems(venue?.types, 4);
  }, [venue, getVisibleItems]);

  return (
    <article className="venue-card" key={venue.name}>
      <Gallery venue={venue} />

      <div className="venue-card__body">
        <div className="venue-card__top">
          <div>
            <h2>{venue.name}</h2>
            <p>
              <MapPin />
              {venue?.address}
            </p>
            <small>{venue.description}</small>
          </div>

          <div className="venue-card__rate">
            <strong>{Formatter.amount(venue.basePrice)}</strong>
            <small>Starting Rate</small>
          </div>
        </div>

        <div className="venue-card__meta grid grid-cols-2 md:grid-cols-3 gap-2">
          <span>
            <UsersRound />
            <small>Capacity</small>
            <strong>Up to {venue.capacity} guests</strong>
          </span>
          <span>
            <Clock />
            <small>Booking Duration</small>
            <strong>
              {venue.duration?.min} – {venue.duration?.max} hours{" "}
            </strong>
          </span>
          <span className="col-span-2 md:col-span-1">
            <Home />
            <small>Venue Setting</small>
            <strong>{venue?.setting || ""}</strong>
          </span>
        </div>

        <div className="venue-card__details">
          <div>
            <h3>Best for</h3>
            <div className="venue-card__chips">
              {visibleTypes.map((item) => (
                <span key={item}>{item}</span>
              ))}
              {hasHiddenTypes ? (
                <li className="venue-card__more">+{hiddenTypes} more</li>
              ) : (
                ""
              )}
            </div>
          </div>

          <div>
            <h3>Included</h3>
            <ul>
              {visibleIncludes.map(({ item }) => (
                <li key={item?._id}>
                  <Check />
                  {item?.name}
                </li>
              ))}
              {hasHiddenIncludes && (
                <li className="venue-card__more">+{hiddenIncludes} more</li>
              )}
            </ul>
          </div>
        </div>

        {isWebsite ? (
          <Button
            className="venue-card__button"
            variant="outline"
            onClick={() => handleInquire(venue)}
          >
            Inquire Package
          </Button>
        ) : (
          <div className=" grid grid-cols-2 gap-3 self-end pt-3">
            <Button
              variant="outline"
              className="gap-2 rounded-lg"
              onClick={() => handleInquire(venue, "details")}
            >
              View Details
              <Eye className="size-4" />
            </Button>

            <Button
              className="gap-2 rounded-lg"
              onClick={() => handleInquire(venue, "inquire")}
            >
              Inquire Now
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </article>
  );
};

export default memo(Item);
