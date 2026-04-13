import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "@/services/utilities";
import { SetCART } from "@/services/redux/slices/pos";
import { Trash2 } from "lucide-react";
const Items = () => {
  const { cart = [] } = useSelector(({ pos }) => pos),
    [hoveredRow, setHoveredRow] = useState(null),
    dispatch = useDispatch();

  useEffect(() => {
    setHoveredRow(null);
  }, [cart]);

  const handleDelete = (index) => {
    const _cart = [...cart];
    _cart.splice(index, 1);
    dispatch(SetCART(_cart));
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Liters</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cart.length > 0 ? (
          cart.map((item, index) => {
            const { fuel = {} } = item;

            return (
              <TableRow
                key={index}
                className="cursor-pointer hover:bg-[#EC682D] hover:text-white hover:rounded-lg"
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <TableCell className="font-medium">{fuel?.name}</TableCell>
                <TableCell>{format.peso(item?.amount || 0)}</TableCell>
                <TableCell>
                  <div className="flex items-center ">
                    {hoveredRow === index ? (
                      <button
                        onClick={() => handleDelete(index)}
                        className="cursor-pointer ml-3"
                        type="button"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    ) : (
                      <span>{format.liters(item?.amount, fuel.srp)}</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-4 text-gray-500">
              No fuel selected yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default Items;
