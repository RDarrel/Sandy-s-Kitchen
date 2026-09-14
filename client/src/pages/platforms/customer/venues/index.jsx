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
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    const getDraft = (sessionKey) => sessionStorage.getItem(sessionKey);
    if (from && venueToReview) {
    } else if (from === "catering" && !returnTo) {
      const venueToReview = getDraft("venue-review");
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
    navigate("/platforms/catering?returnTo=catering&from=venue");
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
