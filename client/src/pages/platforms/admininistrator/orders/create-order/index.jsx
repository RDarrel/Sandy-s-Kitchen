import { BROWSE } from "@/services/redux/slices/inventory/inventoryItems";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const CreateOrder = () => {
  const { token } = useSelector(({ auth }) => auth),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [dispatch, token]);

  return <div>create order</div>;
};

export default CreateOrder;
