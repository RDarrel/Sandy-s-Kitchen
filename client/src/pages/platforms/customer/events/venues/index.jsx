import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BROWSE } from "@/services/redux/slices/events/venues";
import { VenueList } from "@/components/shared/event";

const CateringParent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  const onSelect = (selected, actionType) => {
    sessionStorage.setItem("venueDraft", JSON.stringify({ selected }));
    navigate(`/platforms/venues/${actionType}`);
  };

  return (
    <div>
      <VenueList onSelect={onSelect} isWebsite={false} />
    </div>
  );
};

export default CateringParent;
