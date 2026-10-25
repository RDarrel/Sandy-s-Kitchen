import { Bookings } from "../admininistrator/events";
import CoordinatorTopbar from "./topbar";

const BookingCoordinator = () => {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground">
      <CoordinatorTopbar />

      <main
        className="relative mx-auto w-full max-w-screen-2xl px-4 pb-4 lg:px-6 lg:pb-6"
        style={{ paddingTop: "var(--cashier-topbar-height, 65px)" }}
      >
        <Bookings />
      </main>
    </div>
  );
};

export default BookingCoordinator;
