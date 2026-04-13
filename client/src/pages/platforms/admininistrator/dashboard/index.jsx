import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import "./index.css";
import Sales from "./sales";
import TopProduct from "./topProduct";
import TotalTransactions from "./totalTransactions";
import WeeklyAverage from "./weeklyAverage";
import FuelPrice from "./fuelPrice";
import Stocks from "../../stockman/dashboard";
const Dashboard = () => {
  return (
    <div className="grid grid-cols-4 gap-5">
      <Card className={"col-span-3"}>
        <CardContent className="grid grid-cols-2 gap-4">
          <Sales />
          <TopProduct />
          <TotalTransactions />
        </CardContent>
      </Card>
      <div className="grid grid-rows-2 gap-3">
        <WeeklyAverage />
        <FuelPrice />
      </div>
      <div className="col-span-4 ">
        <Stocks isAdmin />
      </div>
    </div>
  );
};

export default Dashboard;
