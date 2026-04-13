import TableLoading from "@/components/shared/loading/table";
import CustomPagination from "@/components/shared/pagination";

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
  handlePagination,
} from "@/services/utilities";
import { capitalize } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Refunded = () => {
  const { collections, isLoading } = useSelector(({ purchases }) => purchases),
    [purchases, setPurchases] = useState([]),
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
                      <TableHead>Refunded Date </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {handlePagination(purchases, page, maxPage).map(
                      (purchase, index) => {
                        const {
                          fuel,
                          amount,
                          liters,
                          updatedAt = "",
                          supplier,
                        } = purchase;
                        const { order = 0, firstDelivery = 0 } = liters || {};

                        const remainingLiters = order - firstDelivery;
                        return (
                          <TableRow key={index}>
                            <TableCell>{capitalize(supplier?.name)}</TableCell>
                            <TableCell>{capitalize(fuel?.name)}</TableCell>
                            <TableCell>
                              <h2>{remainingLiters?.toLocaleString()}L</h2>
                            </TableCell>
                            <TableCell>
                              <h2>₱{formattedAmount(amount)}</h2>
                            </TableCell>
                            <TableCell>
                              <h2>{formattedDate(updatedAt)}</h2>
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
    </>
  );
};

export default Refunded;
