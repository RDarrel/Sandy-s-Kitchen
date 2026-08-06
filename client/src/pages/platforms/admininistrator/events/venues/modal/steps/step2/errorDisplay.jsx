import { Alert, AlertDescription, AlertTitle } from "@/components/reui/alert";
import { CircleAlertIcon } from "lucide-react";
const ErrorDisplay = ({ errors }) => {
  return (
    <Alert variant="destructive" className="mt-5">
      <CircleAlertIcon />
      <AlertTitle>File upload error(s)</AlertTitle>
      <AlertDescription>
        {errors.map((error, index) => (
          <p key={index} className="last:mb-0">
            {error}
          </p>
        ))}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
