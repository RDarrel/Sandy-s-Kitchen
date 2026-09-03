import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ActionRenderer from "./handler";
const CateringParent = () => {
  const [selected, setSelected] = useState({});
  const [actionType, setActionType] = useState("default");
  const [isReview, setIsReview] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get("from");

  useEffect(() => {
    const venueToReview = sessionStorage.getItem("venue-review");
    if (from && venueToReview) {
      setIsReview(true);
      setSelected(JSON.parse(venueToReview));
      setActionType("details");
    } else {
      setIsReview(false);
    }
  }, [from]);

  const onSelect = (selected, actionType) => {
    setSelected(selected);
    setActionType(actionType);
  };
  const handleBackToCateringPackage = () => {
    navigate("/platforms/catering?from=venue");
    setSelected({});
    setActionType("default");
    setIsReview(false);
  };
  return (
    <div>
      <ActionRenderer
        actionType={actionType}
        selected={selected}
        onSelect={onSelect}
        isReview={isReview}
        handleBackToCateringPackage={handleBackToCateringPackage}
      />
    </div>
  );
};

export default CateringParent;
