import { VenueList } from "@/components/shared/event";
import { BROWSE } from "@/services/redux/slices/events/venues";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Venue = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);
  return <VenueList />;
};

export default Venue;
