import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import ActionRenderer from "./handler";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/events/cateringPackages";

const CateringParent = () => {
  const { isLoading, collections } = useSelector(
    ({ cateringPackages }) => cateringPackages,
  );
  const [selected, setSelected] = useState({});
  const [actionType, setActionType] = useState("default");
  const [isContinuingInquiry, setIsContinuingInquiry] = useState(false);
  const [isReview, setIsReview] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const from = searchParams.get("from");
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  useEffect(() => {
    if (!isLoading && inquiryId && collections?.length) {
      const found = collections.find(({ _id }) => _id === inquiryId);
      setSelected(found);
      setActionType("details");
    }
  }, [inquiryId, isLoading, collections]);

  useEffect(() => {
    const getDraft = (sessionKey) => sessionStorage.getItem(sessionKey);
    const cateringDraft = getDraft("cateringDraft");
    const inquiry = getDraft("inquiry");

    if (cateringDraft) {
      const { selected } = JSON.parse(cateringDraft);
      setSelected(selected);
      setActionType("inquire");
      setIsContinuingInquiry(true);
    } else if (from === "venue" && !returnTo) {
      const sessionKey = "catering-review";
      const saveDraft = getDraft(sessionKey)
        ? JSON.parse(getDraft(sessionKey))
        : {};

      setSelected(saveDraft);
      setActionType("details");
      setIsReview(true);
    } else if (inquiry) {
      setInquiryId(JSON.parse(inquiry)?.id);
      sessionStorage.removeItem("inquiry");
    } else {
      setIsContinuingInquiry(false);
    }
  }, [returnTo, from, setSearchParams]);
  const onSelect = (selected, actionType) => {
    setSelected(selected);
    setActionType(actionType);
  };
  const handleBackToVenue = () => {
    navigate("/platforms/venues?returnTo=venue&from=catering");
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
        isContinuingInquiry={isContinuingInquiry}
        handleBackToVenue={handleBackToVenue}
        isReview={isReview}
      />
    </div>
  );
};

export default CateringParent;
