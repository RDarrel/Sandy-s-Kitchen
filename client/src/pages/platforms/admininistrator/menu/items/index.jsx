import React, { useEffect } from "react";

import Modal from "./modal";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/menu/menu";
import Header from "./header";
import Body from "./body";

const Items = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(({ auth }) => auth);

  useEffect(() => {
    if (token) {
      dispatch(BROWSE({ token }));
    }
  }, [token, dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-5">
      <div className="mx-auto max-w-7xl space-y-4">
        <Header />
        <Body />
      </div>

      <Modal />
    </div>
  );
};

export default Items;
