import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BROWSE } from "@/services/redux/slices/events/cateringPackages";
import { CateringList } from "@/components/shared/event";

const CateringParent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  const onSelect = (selected, actionType) => {
    sessionStorage.setItem("cateringDraft", JSON.stringify({ selected }));
    navigate(`/platforms/catering/${actionType}`);
  };

  return (
    <div>
      <CateringList onSelect={onSelect} isWebsite={false} />
    </div>
  );
};

export default CateringParent;
