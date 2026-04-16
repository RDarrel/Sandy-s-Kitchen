import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader, TriangleAlert } from "lucide-react";

export function CustomAlert({
  isOpen,
  capture, // performing of function
  setIsOpen,
  title = "Warning",
  showCancelButton = false,
  formSubmitted = false,
  className = "",
  message = "",
  buttonClassName = "",
  buttonTitle = "OK",
  index = 1, // THIS IS FOR DELETE OR UPDATE
}) {
  const haveIndex = index > -1;
  return (
    <AlertDialog open={isOpen} onOpenChange={haveIndex ? () => {} : capture}>
      <AlertDialogContent className={className}>
        <AlertDialogHeader className="gap-3">
          <AlertDialogTitle className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <TriangleAlert className="h-5 w-5" />
            </span>
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={"mt-4 gap-2"}>
          {showCancelButton && (
            <AlertDialogCancel
              onClickCapture={() => setIsOpen(false)}
              className="mt-0"
            >
              Cancel
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClickCapture={() => {
              if (haveIndex) {
                capture(index);
              } else {
                capture(false);
              }
            }}
            className={`gap-2 ${buttonClassName}`}
          >
            {buttonTitle}
            {formSubmitted && <Loader className="animate-spin" />}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
