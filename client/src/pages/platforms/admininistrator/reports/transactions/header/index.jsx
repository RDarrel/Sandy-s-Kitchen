import React from "react";

import {
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomCalendar from "./calendar";
import Cashiers from "./cashiers";

const Header = ({ isDeleted = false }) => {
  return (
    <CardHeader className="grid auto-rows-min grid-cols-[1fr_auto] items-start gap-1.5 space-y-0">
      <CardTitle>
        {isDeleted ? "Deleted Transactions" : "Transaction List"}
      </CardTitle>
      {!isDeleted && (
        <>
          <CardDescription>
            <CustomCalendar />
          </CardDescription>
          <CardAction>
            <Cashiers />
          </CardAction>
        </>
      )}
    </CardHeader>
  );
};

export default Header;
