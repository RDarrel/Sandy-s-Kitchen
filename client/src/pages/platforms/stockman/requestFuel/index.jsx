import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/assets/fuels";
import { BROWSE as BROWSE_SUPPLIERS } from "@/services/redux/slices/procurement/suppliers";
import FuelType from "./fuelType";
import Order from "./modal";

const RequestFuel = () => {
  const { token } = useSelector(({ auth }) => auth),
    { collections, isLoading, isSuccess } = useSelector(({ fuels }) => fuels),
    [fuels, setFuels] = useState([]),
    [showModal, setShowModal] = useState(false),
    [selected, setSelected] = useState({}),
    [searchParams] = useSearchParams(),
    refillId = searchParams.get("refill"),
    dispatch = useDispatch();

  useEffect(() => {
    if (refillId && !isLoading) {
      const fuel = collections.find(({ _id }) => _id === refillId);
      if (fuel) {
        setSelected(fuel);
        setShowModal(true);
      }
    }
  }, [refillId, isLoading]);

  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [dispatch, token]);

  useEffect(() => {
    dispatch(BROWSE_SUPPLIERS({ token }));
  }, [dispatch, token]);

  useEffect(() => {
    setFuels(collections);
  }, [collections]);

  const handleOrder = (fuel) => {
    setSelected(fuel);
    setShowModal(true);
  };

  const colors = ["#FF0000", "#008000", "#9C9C01"];
  return (
    <>
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
                handleOrder={handleOrder}
                color={colors[index]}
              />
            ))}
          </>
        )}
      </div>
      <Order isOpen={showModal} setIsOpen={setShowModal} selected={selected} />
    </>
  );
};

export default RequestFuel;
