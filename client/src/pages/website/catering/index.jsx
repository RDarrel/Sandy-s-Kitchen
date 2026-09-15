import { CateringList } from "@/components/shared/event";
import { BROWSE } from "@/services/redux/slices/events/cateringPackages";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const Catering = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);
  return <CateringList />;
};

export default Catering;
