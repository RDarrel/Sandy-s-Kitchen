import { memo, useCallback, useMemo } from "react";
import { Formatter } from "@/services/utilities";
import { Check, UsersRound, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Actions from "./actions";
import Gallery from "./gallery";

const Venue = ({ venue = {}, handleAction = () => {} }) => {
  const getVisibleItems = useCallback((items, maxVisible) => {
    const hasHidden = venue?.inclusions?.length > maxVisible;
    const visibleItems = items?.slice(0, maxVisible);
    const hiddenItems = items?.length - visibleItems?.length;

    return { hasHidden, visibleItems, hiddenItems };
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
    return getVisibleItems(venue?.types, 7);
  }, [venue, getVisibleItems]);

  const { duration = {}, additionalCharges = {} } = venue || {};
  const { perPax = 0, perHour = 0 } = additionalCharges || {};
  return (
    <article className="admin-venue-card">
      <Gallery venue={venue} handleAction={handleAction} />
      <div className="admin-venue-card__body">
        <div className="admin-venue-card__top">
          <div>
            <h2>{venue?.name}</h2>
            <p>
              <MapPin />
              {venue?.address}
            </p>
            <small>{venue?.description}</small>
          </div>

          <div className="admin-venue-card__rate">
            <div className="flex gap-2">
              <div className="text-start">
                <strong>{Formatter.amount(venue?.basePrice)}</strong>
                {perHour || perPax ? (
                  <>
                    <AdditionalCharge price={perPax} label="guest" />
                    <AdditionalCharge price={perHour} label="hour" />
                  </>
                ) : (
                  <small>Start Price</small>
                )}
              </div>
              <Actions handleAction={handleAction} item={venue} />
            </div>
          </div>
        </div>

        <div className="admin-venue-card__meta">
          <span>
            <UsersRound />
            <small>Capacity</small>
            <strong>Up to {venue.capacity} guests</strong>
          </span>
          <span>
            <Clock />
            <small>Booking Duration</small>
            <strong>
              {duration?.min} – {duration?.max} hours
            </strong>
            {/* <strong>
  {min === max ? `${min} hour${min !== 1 ? "s" : ""}` : `${min}–${max} hours`}
</strong> */}
          </span>
        </div>

        <div className="admin-venue-card__details">
          <div>
            <h3>Best for</h3>
            <div className="admin-venue-card__chips">
              {visibleTypes?.map((item) => (
                <span key={item}>{item}</span>
              ))}
              {hasHiddenTypes && (
                <li className="admin-venue-card__more">+{hiddenTypes} more</li>
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
                <li className="admin-venue-card__more">
                  +{hiddenIncludes} more
                </li>
              )}
            </ul>
          </div>
        </div>

        <Button
          className="admin-venue-card__button"
          variant="outline"
          onClick={() => handleAction("view", venue)}
        >
          View Details
        </Button>
      </div>
    </article>
  );
};

export default memo(Venue);

const AdditionalCharge = ({ price = 0, label = "" }) => {
  if (!price) return;

  return (
    <small>
      + {Formatter.amount(price)} / {label}
    </small>
  );
};
