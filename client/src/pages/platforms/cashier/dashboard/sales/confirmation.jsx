import { format } from "@/services/utilities";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { DESTROY } from "@/services/redux/slices/pos";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";
import { useState } from "react";

const Confirmation = ({ isOpen, setIsOpen, selected }) => {
  const { token, auth } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ pos }) => pos);
  const dispatch = useDispatch();
  const [reason, setReason] = useState("");

  const handleDelete = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for deletion.");
      return;
    }

    dispatch(
      DESTROY({
        data: { ...selected, reason, cashier: auth._id },
        token,
        reason,
      })
    ).then(() => {
      toast.success("Successfully deleted sales.");
      setReason(""); // reset reason
      setIsOpen(false);
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete this sale record.
            <br />
            <br />
            <span className="font-semibold">Fuels:</span>
            <ul className="list-disc ml-6 mt-1">
              {selected?.cart.map((c, i) => (
                <li key={i}>
                  {c.fuel?.name} — {format.peso(c.amount)}
                </li>
              ))}
            </ul>
            <br />
            <span className="font-semibold">Total Amount:</span>{" "}
            <span className="text-[#FF4F00] font-semibold">
              {format.peso(selected?.amount)}
            </span>
            <br />
            <br />
            ⚠️ <strong>Once deleted, this cannot be undone.</strong> This action
            will be logged and visible to the administrator.
            <br />
            <br />
            <label className="block font-semibold mb-1">
              Reason for deletion:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              placeholder="Provide a reason for deleting this transaction..."
              rows={3}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-end gap-2">
          {/* Cancel Button */}
          <Button
            variant="ghost"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={() => {
              setIsOpen(false);
              setReason("");
            }}
          >
            Cancel
          </Button>

          {/* Confirm Button */}
          <Button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleDelete}
          >
            Yes, Delete <Spinner formSubmitted={formSubmitted} />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Confirmation;
