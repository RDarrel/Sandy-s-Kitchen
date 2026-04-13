import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { format } from "@/services/utilities";
import { useSelector } from "react-redux";
import TableLoading from "@/components/shared/loading/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PopcornIcon, Printer, Trash } from "lucide-react";
import Confirmation from "./confirmation";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Body = () => {
  const { sales: filtered = [], isLoading } = useSelector(({ pos }) => pos);
  const [selected, setSelected] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleted = filtered?.filter((item) => item.deletedAt);
  return (
    <CardContent>
      {!isLoading ? (
        <div className="flex items-center -mt-3">
          <div>
            <h2 className="text-[1.3rem] text-[#FF4F00] font-[500]">
              {format.peso(
                filtered
                  ?.filter(({ deletedAt = "" }) => !deletedAt)
                  .reduce((acc, item) => acc + item.amount, 0)
              )}
            </h2>
          </div>
          <div className="flex-grow border-dashed border-t border-[#FF4F00] mx-2"></div>
          <div>
            <h2 className="text-[1.3rem] text-[#FF4F00] font-[500]">
              @{filtered?.length - deleted?.length} Customer/s
            </h2>
          </div>
        </div>
      ) : (
        <Skeleton className="w-full h-8" />
      )}

      {!isLoading ? (
        <div className="border rounded-md bg-white mt-3">
          <div className="max-h-114 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fuels</TableHead>
                  <TableHead>Payment Details</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((item, index) => {
                    const {
                      amount,
                      cart,
                      cash,
                      deletedAt = "",
                      reason = "",
                    } = item;
                    const isDeleted = deletedAt ? true : false;
                    const time = new Date(item.createdAt).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    );

                    return (
                      <React.Fragment>
                        <TableRow
                          key={index}
                          className={`${isDeleted ? "!bg-red-200" : ""}`}
                        >
                          <TableCell>
                            {cart.map((fuelItem, i) => (
                              <div key={i}>
                                {fuelItem.fuel?.name} -{" "}
                                <span className="text-[#FF4F00]">
                                  {format.peso(fuelItem.amount)}
                                </span>
                              </div>
                            ))}
                          </TableCell>

                          <TableCell>
                            <div>
                              Amount:{" "}
                              <span className="text-[#FF4F00]">
                                {format.peso(amount)}
                              </span>
                            </div>
                            <div className="text-[0.8rem]">
                              Cash: {format.peso(cash)}
                            </div>
                          </TableCell>

                          <TableCell>{time}</TableCell>

                          <TableCell className="flex gap-2">
                            {/* PRINT */}
                            {!isDeleted ? (
                              <>
                                <Button
                                  onClick={() => {
                                    localStorage.setItem(
                                      "claimStub",
                                      JSON.stringify(item)
                                    );
                                    window.open(
                                      "/printout/claimStub",
                                      "Claim Stub",
                                      "top=100px,left=500px,width=400px,height=750px"
                                    );
                                  }}
                                  title="Print Transaction"
                                  className="bg-[#FF4F00] hover:bg-[#e64500] cursor-pointer"
                                >
                                  <Printer />
                                </Button>

                                <Button
                                  onClick={() => {
                                    setSelected(item);
                                    setIsDialogOpen(true);
                                  }}
                                  title="Delete Transaction"
                                  className="bg-red-600 hover:bg-red-700 cursor-pointer"
                                >
                                  <Trash />
                                </Button>
                              </>
                            ) : (
                              <span>Deleted</span>
                            )}
                          </TableCell>
                        </TableRow>
                        {isDeleted && (
                          <TableRow>
                            <TableCell colSpan={4} className={"m-0 p-0 px-2 "}>
                              <span className="text-red-700   italic max-w-[70rem] break-words whitespace-normal">
                                {reason}
                              </span>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No Sales Record.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <TableLoading numberOfColumns={4} className="mt-3" />
      )}

      <Confirmation
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        selected={selected}
      />
    </CardContent>
  );
};

export default Body;
