import { Bookings } from "../admininistrator/events";
import CoordinatorTopbar from "./topbar";

const BookingCoordinator = () => {
  return (
    <div className="min-h-dvh overflow-x-clip bg-muted/25 text-foreground">
      <Bookings
        className="mx-auto max-w-[1600px] px-4 pb-0 pt-2 sm:px-6"
        renderTopbar={(searchProps) => (
          <CoordinatorTopbar searchProps={searchProps} />
        )}
      />
    </div>
  );
};

export default BookingCoordinator;
