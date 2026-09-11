import { useEffect, useState } from "react";
import ActionRenderer from "./handler";
import { useSearchParams } from "react-router-dom";
const CateringParent = () => {
  const [selected, setSelected] = useState({});
  const [actionType, setActionType] = useState("default");
  const [isContinuingInquiry, setIsContinuingInquiry] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get("from");
  const returnTo = searchParams.get("returnTo");
  useEffect(() => {
    if (returnTo === "catering" && from === "venue") {
      const savedDraft = sessionStorage.getItem("cateringDraft");
      const { selected } = savedDraft ? JSON.parse(savedDraft) : {};
      setSelected(selected);
      setActionType("inquire");
      setIsContinuingInquiry(true);
      // setSearchParams({}, { replace: true });
    } else {
      setIsContinuingInquiry(false);
    }
  }, [returnTo, from, setSearchParams]);
  const onSelect = (selected, actionType) => {
    setSelected(selected);
    setActionType(actionType);
  };
  return (
    <div>
      <ActionRenderer
        actionType={actionType}
        selected={selected}
        onSelect={onSelect}
        isContinuingInquiry={isContinuingInquiry}
      />
    </div>
  );
};

export default CateringParent;
