import CustomPagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pen, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/assets/suppliers";
import TableLoading from "@/components/shared/loading/table";
import { globalSearch, handlePagination, mobile } from "@/services/utilities";
import { capitalize, isEmpty } from "lodash";
import { RESET, DESTROY } from "@/services/redux/slices/assets/suppliers";
import { toast } from "sonner";
import Search from "@/components/shared/search";
import CustomModal from "./modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { CustomAlert } from "@/components/shared/alert";

const Suppliers = () => {
  const { token } = useSelector(({ auth }) => auth),
    { collections, isLoading, message, isSuccess, formSubmitted } = useSelector(
      ({ suppliers }) => suppliers
    ),
    [suppliers, setSuppliers] = useState([]),
    [selected, setSelected] = useState({}),
    [deletedIndex, setDeletedIndex] = useState(-1),
    [page, setPage] = useState(1),
    [maxPage, setMaxPage] = useState(5),
    [search, setSearch] = useState(""),
    [isOpen, setIsOpen] = useState(false),
    [showAlert, setShowAlert] = useState(false),
    [willCreate, setWillCreate] = useState(true),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [token]);

  useEffect(() => {
    if (message && isSuccess) {
      toast.success(message);
      setShowAlert(false);
      dispatch(RESET());
    }
  }, [message, isSuccess, dispatch]);

  useEffect(() => {
    setSuppliers(collections);
  }, [collections]);

  useEffect(() => {
    if (!search) setSuppliers(collections);
    if (search) {
      const results = globalSearch(suppliers, search.toUpperCase());
      setSuppliers(results);
    }
  }, [search]);

  const handleCreate = () => {
    setWillCreate(true);
    setIsOpen(true);
  };

  const handleDelete = () => {
    dispatch(DESTROY({ token, data: { _id: suppliers[deletedIndex]?._id } }));
  };

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between">
          <h2 className="text-[#FF4F00] font-[600] text-2xl">Supplier List</h2>
          <Search
            search={search}
            setSearch={setSearch}
            setIsOpen={handleCreate}
            title="suppliers"
          />
        </CardHeader>
        <CardContent className={"-mt-5"}>
          {!isLoading ? (
            <>
              <div className="border rounded-md bg-white mt-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!isEmpty(suppliers) ? (
                      <>
                        {handlePagination(suppliers, page, maxPage).map(
                          (supplier, index) => {
                            const {
                              name = "",
                              address = "",
                              phone = "",
                            } = supplier;
                            return (
                              <TableRow key={supplier._id}>
                                <TableCell>{capitalize(name)}</TableCell>
                                <TableCell>{mobile(phone)}</TableCell>
                                <TableCell>{capitalize(address)}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        className="flex items-center justify-center"
                                      >
                                        <p className="font-bold mb-2 text-h3 text-[#FF4F00]">
                                          ...
                                        </p>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[9rem]">
                                      <DropdownMenuLabel>
                                        Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuGroup>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setIsOpen(true);
                                            setSelected(supplier);
                                            setWillCreate(false);
                                          }}
                                        >
                                          <Pen />
                                          Update
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setDeletedIndex(index);
                                            setShowAlert(true);
                                          }}
                                        >
                                          <Trash />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            );
                          }
                        )}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell className={"text-center"} colSpan={5}>
                          No Record.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <CustomPagination
                title="Supplier"
                titleExtension="s"
                page={page}
                setPage={setPage}
                maxPage={maxPage}
                setMaxPage={setMaxPage}
                datas={suppliers}
              />
            </>
          ) : (
            <TableLoading className={"mt-5"} />
          )}
        </CardContent>
      </Card>
      <CustomModal
        selected={selected}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        willCreate={willCreate}
      />
      <CustomAlert
        isOpen={showAlert}
        capture={handleDelete}
        setIsOpen={setShowAlert}
        formSubmitted={formSubmitted}
        message={
          <>
            Are you sure you want to delete
            <span className="font-[700] mr-1 ml-1">
              {suppliers[deletedIndex]?.name}
            </span>
            ?
          </>
        }
        showCancelButton
        className="w-[22rem]"
        buttonTitle="Yes, Delete"
        buttonClassName="bg-red-600 hover:bg-red-700 cursor-pointer"
        index={deletedIndex}
      />
    </>
  );
};

export default Suppliers;
