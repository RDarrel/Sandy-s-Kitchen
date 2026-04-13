import TableLoading from "@/components/shared/loading/table";
import CustomPagination from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formattedAmount,
  formattedDate,
  fullName,
  handlePagination,
} from "@/services/utilities";
import { capitalize, create } from "lodash";
import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CustomModal from "./modal";

const Review = () => {
  const { collections, isLoading } = useSelector(({ purchases }) => purchases),
    [purchases, setPurchases] = useState([]),
    [selected, setSelected] = useState({}),
    [isOpen, setIsOpen] = useState(false),
    [page, setPage] = useState(1),
    [maxPage, setMaxPage] = useState(5);

  useEffect(() => {
    setPurchases(collections);
  }, [collections]);

  return (
    <>
      <Card className={"m-0 p-0 "}>
        <CardContent>
          {!isLoading ? (
            <>
              <div className="border rounded-md bg-white mt-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Fuel Type</TableHead>
                      <TableHead>Liters</TableHead>
                      <TableHead>Received Date </TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {handlePagination(purchases, page, maxPage).map(
                      (purchase, index) => {
                        const {
                          fuel,
                          amount,
                          liters,
                          request = {},
                          createdAt = "",
                          supplier,
                        } = purchase;
                        const { by = {} } = request || {};
                        const { order = 0, firstDelivery = 0 } = liters || {};
                        const amountOrder = order * fuel?.pricing?.cost;
                        const amountDiscrepancy =
                          firstDelivery * fuel?.pricing?.cost;

                        const remainingLiters = order - firstDelivery;
                        return (
                          <TableRow key={index}>
                            <TableCell>{capitalize(supplier?.name)}</TableCell>
                            <TableCell>{capitalize(fuel?.name)}</TableCell>
                            <TableCell>
                              <div className={"flex flex-col gap-2"}>
                                <div className="flex items-center gap-2">
                                  <h2>Order:</h2>
                                  <Badge
                                    className={"bg-[#F5F2ED] text-[#FF4F00]"}
                                  >
                                    <h2>{order?.toLocaleString()}L</h2>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <h2>Received:</h2>
                                  <Badge
                                    className={"bg-[#F5F2ED] text-[#FF4F00]"}
                                  >
                                    <h2>{firstDelivery?.toLocaleString()}L</h2>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <h2>Remaining:</h2>
                                  <Badge
                                    className={"bg-[#F5F2ED] text-[#FF4F00]"}
                                  >
                                    <h2>
                                      {remainingLiters?.toLocaleString()}L
                                    </h2>
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <h2>{formattedDate(createdAt)}</h2>
                            </TableCell>

                            <TableCell>
                              <Button
                                onClick={() => {
                                  setSelected(purchase);
                                  setIsOpen(true);
                                }}
                                className={
                                  "bg-[#FF4F00] hover:bg-[#e24700] cursor-pointer"
                                }
                              >
                                <Eye />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mb-4">
                <CustomPagination
                  className="mb-2"
                  title="Pending order"
                  titleExtension="s"
                  page={page}
                  setPage={setPage}
                  maxPage={maxPage}
                  setMaxPage={setMaxPage}
                  datas={purchases}
                />
              </div>
            </>
          ) : (
            <TableLoading
              numberOfColumns={5}
              className={"mt-4 mb-5"}
              paginationClassName="mb-3"
            />
          )}
        </CardContent>
      </Card>
      <CustomModal isOpen={isOpen} setIsOpen={setIsOpen} selected={selected} />
    </>
  );
};

export default Review;
