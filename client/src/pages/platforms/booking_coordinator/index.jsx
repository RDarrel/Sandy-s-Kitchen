import { Bookings } from "../admininistrator/events";
import CoordinatorTopbar from "./topbar";
import { useState } from "react";
import TableOperation from "./tableOpertaion";
import "./style.css";

const BookingCoordinator = () => {
  const [view, setView] = useState("calendar");
  return (
    <div className="min-h-dvh overflow-x-clip bg-muted/25 text-foreground">
      <CoordinatorTopbar view={view} onViewChange={setView} />

      {view === "table" ? (
        <div key="table" className="coordinator-view-enter">
          <TableOperation />
        </div>
      ) : (
        <div key="calendar" className="coordinator-view-enter">
          <Bookings
            hidePendingRefunds={true}
            className="mx-auto max-w-[1600px] px-4 pb-0 pt-2 sm:px-6"
          />
        </div>
      )}
    </div>
  );
};

export default BookingCoordinator;
