import TableLoading from "@/components/shared/loading/table";
import CustomPagination from "@/components/shared/pagination";
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
import { formattedAmount, handlePagination } from "@/services/utilities";
import { capitalize } from "lodash";
import { Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CustomModal from "./modal";

const Pending = () => {
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
                      <TableHead>Amount</TableHead>
                      <TableHead>Expected Delivery Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {handlePagination(purchases, page, maxPage).map(
                      (purchase, index) => {
                        const {
                          supplier,
                          fuel,
                          expectedDelivery = { from: "", to: "" },
                          amount,
                          liters,
                        } = purchase;
                        const { from = "", to = "" } = expectedDelivery || {};
                        return (
                          <TableRow key={index}>
                            <TableCell>{capitalize(supplier?.name)}</TableCell>
                            <TableCell>{capitalize(fuel.name)}</TableCell>
                            <TableCell>{liters?.incoming}L</TableCell>
                            <TableCell>₱{formattedAmount(amount)}</TableCell>
                            <TableCell>
                              {to ? `${from} to ${to}` : from}
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

export default Pending;
