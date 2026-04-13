import React, { useEffect, useState } from "react";
import FuelType from "./fuelType";
import "./index.css";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, RESET, UPDATE } from "@/services/redux/slices/assets/fuels";
import { toast } from "sonner";

const Fuels = () => {
  const { token, auth } = useSelector(({ auth }) => auth),
    { collections, formSubmitted, isSuccess, message, isLoading } = useSelector(
      ({ fuels }) => fuels
    ),
    [fuels, setFuels] = useState([]),
    [selected, setSelected] = useState({}),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [dispatch, token]);

  useEffect(() => {
    if (message && isSuccess) {
      toast.success(message);
      setSelected({});
      dispatch(RESET());
    }
  }, [message, isSuccess, dispatch]);

  useEffect(() => {
    setFuels(collections);
  }, [collections]);

  const handleSubmit = (key, value, _id, markup, description) => {
    dispatch(
      UPDATE({
        token,
        data: {
          _id,
          updateKey: key,
          value,
          markup,
          description,
          performBy: auth?._id,
        },
      })
    );
  };
  const colors = ["#FF0000", "#008000", "#9C9C01"];
  return (
    <div className="grid grid-cols-3 gap-5">
      {isLoading ? (
        new Array(3)
          .fill("")
          .map((_, index) => <FuelType key={index} isLoading={true} />)
      ) : (
        <>
          {fuels.map((fuel, index) => (
            <FuelType
              key={fuel._id}
              fuel={fuel}
              color={colors[index]}
              title={fuel.name}
              selected={selected}
              setSelected={setSelected}
              formSubmitted={formSubmitted}
              handleSubmit={handleSubmit}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default Fuels;
