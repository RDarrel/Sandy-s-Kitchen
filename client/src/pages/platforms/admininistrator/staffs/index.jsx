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
import { Key } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddStaff from "./add";
import { useDispatch, useSelector } from "react-redux";
import { BROWSE } from "@/services/redux/slices/persons/staffs";
import TableLoading from "@/components/shared/loading/table";
import { fullName, globalSearch, handlePagination } from "@/services/utilities";
import { capitalize, isEmpty } from "lodash";
import ChangeRole from "./changeRole";
import Search from "@/components/shared/search";

const Staffs = () => {
  const { token } = useSelector(({ auth }) => auth),
    { collections, isLoading } = useSelector(({ staffs }) => staffs),
    [staffs, setStaffs] = useState([]),
    [selected, setSelected] = useState({}),
    [page, setPage] = useState(1),
    [maxPage, setMaxPage] = useState(5),
    [search, setSearch] = useState(""),
    [isOpen, setIsOpen] = useState(false),
    [isChangeRole, setIsChangeRole] = useState(false),
    dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE({ token }));
  }, [token]);

  useEffect(() => {
    console.log(collections);
    setStaffs(collections);
  }, [collections]);

  useEffect(() => {
    if (!search) setStaffs(collections);
    if (search) {
      const results = globalSearch(staffs, search.toUpperCase());
      setStaffs(results);
    }
  }, [search]);

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between">
          <h2 className="text-[#FF4F00] font-[600] text-2xl">Staff List</h2>
          <Search search={search} setSearch={setSearch} setIsOpen={setIsOpen} />
        </CardHeader>
        <CardContent className={"-mt-5"}>
          {!isLoading ? (
            <>
              <div className="border rounded-md bg-white mt-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!isEmpty(staffs) ? (
                      <>
                        {handlePagination(staffs, page, maxPage).map(
                          (staff) => {
                            const { user } = staff;
                            return (
                              <TableRow key={staff._id}>
                                <TableCell>{fullName(user.fullName)}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  {capitalize(user.role?.name)}
                                </TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell>
                                  <Button
                                    title="Change Role"
                                    onClick={() => {
                                      setSelected(staff);
                                      setIsChangeRole(true);
                                    }}
                                    className={
                                      "cursor-pointer bg-[#FF4F00] hover:bg-[#e54400]"
                                    }
                                  >
                                    <Key />
                                  </Button>
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
                title="staff"
                titleExtension="s"
                page={page}
                setPage={setPage}
                maxPage={maxPage}
                setMaxPage={setMaxPage}
                datas={staffs}
              />
            </>
          ) : (
            <TableLoading className={"mt-5"} />
          )}
        </CardContent>
      </Card>
      <AddStaff isOpen={isOpen} setIsOpen={setIsOpen} />
      <ChangeRole
        isOpen={isChangeRole}
        setIsOpen={setIsChangeRole}
        selected={selected}
      />
    </>
  );
};

export default Staffs;
