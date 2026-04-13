import TableLoading from "@/components/shared/loading/table";
import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Review from "./toReview";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, RESET } from "@/services/redux/slices/assets/purchases";
import Redelivery from "./redelivery";
import Resolved from "./resolved";
import Refunded from "./refunded";

export function ManageOrders() {
  const { token } = useSelector(({ auth }) => auth),
    [activeTab, setActiveTab] = useState("request"),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      BROWSE({
        token,
        params: { status: activeTab.toLowerCase(), isShort: true },
      })
    );
    return () => dispatch(RESET());
  }, [dispatch, token, activeTab]);
  return (
    <Tabs defaultValue="To Review" className="">
      <TabsList className="grid w-full grid-cols-4 w-100">
        <TabsTrigger
          value="To Review"
          onClick={() => setActiveTab("request")}
          className="data-[state=active]:bg-[#FF4F00] data-[state=active]:text-white"
        >
          To Review
        </TabsTrigger>
        <TabsTrigger
          value="Re-Delivery"
          onClick={() => setActiveTab("incoming")}
          className="data-[state=active]:bg-[#FF4F00] data-[state=active]:text-white"
        >
          Re-Delivery
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveTab("received")}
          value="Resolved"
          className="data-[state=active]:bg-[#FF4F00] data-[state=active]:text-white"
        >
          Resolved
        </TabsTrigger>
        <TabsTrigger
          value="Refunded"
          onClick={() => setActiveTab("refunded")}
          className="data-[state=active]:bg-[#FF4F00] data-[state=active]:text-white"
        >
          Refunded
        </TabsTrigger>
      </TabsList>
      <TabsContent value="To Review" className={"-mt-[9.9px] "}>
        <Review />
      </TabsContent>
      <TabsContent value="Re-Delivery" className={"-mt-[9.9px] "}>
        <Redelivery />
      </TabsContent>
      <TabsContent value="Resolved" className={"-mt-[9.9px] "}>
        <Resolved />
      </TabsContent>
      <TabsContent value="Refunded" className={"-mt-[9.9px] "}>
        <Refunded />
      </TabsContent>
    </Tabs>
  );
}
