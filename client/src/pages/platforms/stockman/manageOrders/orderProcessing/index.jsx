import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Pending from "./pending";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE, RESET } from "@/services/redux/slices/assets/purchases";
import { BROWSE as BROWSE_SUPPLIERS } from "@/services/redux/slices/assets/suppliers";
import Received from "./received";
import Request from "./request";

export function OrderProcessing() {
  const { token, auth } = useSelector(({ auth }) => auth),
    [activeTab, setActiveTab] = useState("Request"),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      BROWSE({
        token,
        params: {
          status: activeTab.toLowerCase(),
          ...((activeTab === "Request" || activeTab === "Received") && {
            stockman: auth?._id,
          }),
        },
      })
    );
    return () => dispatch(RESET());
  }, [dispatch, token, activeTab, auth]);

  useEffect(() => {
    dispatch(BROWSE_SUPPLIERS({ token }));
  }, [dispatch, token]);

  return (
    <Tabs defaultValue="request" className="">
      <TabsList className="grid w-full grid-cols-3 w-100 ">
        <TabsTrigger
          value="request"
          onClick={() => setActiveTab("Request")}
          className="data-[state=active]:bg-[#FF4F00] data-[state=active]:text-white"
        >
          Requested
        </TabsTrigger>
        <TabsTrigger
          value="Pending"
          className="data-[state=active]:bg-[#FF4F00] data-[state=active]:text-white"
          onClick={() => setActiveTab("Incoming")}
        >
          Incoming
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveTab("Received")}
          value="Received"
          className="data-[state=active]:bg-[#FF4F00] data-[state=active]:text-white"
        >
          Received
        </TabsTrigger>
      </TabsList>
      <TabsContent value="request" className={"-mt-[10.5px] "}>
        <Request />
      </TabsContent>
      <TabsContent value="Pending" className={"-mt-[9.9px] "}>
        <Pending />
      </TabsContent>
      <TabsContent value="Received" className={"-mt-[9.9px] "}>
        <Received />
      </TabsContent>
    </Tabs>
  );
}
