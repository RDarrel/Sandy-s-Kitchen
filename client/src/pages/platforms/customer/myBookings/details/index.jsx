import { Button } from "@/components/ui/button";
import { GET_BOOKING_DETAILS } from "@/services/redux/slices/events/bookings";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBookingAction,
  getDateParts,
  getPaymentSummary,
  getServices,
  getStatusMeta,
} from "../utils";
import PaymentSummary from "./financial/summary";
import PaymentHistory from "./financial/history";
import RefundDetails from "./financial/refundDetails";
import TermsSummary from "./financial/terms";
import {
  PaymentHistorySkeleton,
  PaymentSummarySkeleton,
  TermsSkeleton,
} from "./financial/skeleton";
import { BookingOverview, ReservationOverview } from "./overview";
import {
  BookingOverviewSkeleton,
  ScheduleSkeleton,
  ServiceDetailsSkeleton,
} from "./overview/skeletons";
import CateringDetails from "./service/catering";
import VenueDetails from "./service/venue";
import CustomerInformation, { ContactSkeleton } from "./customerInformation";
import NotesAndRequests from "./notes";
import NotFound from "./notFound";
import { BROWSE } from "@/services/redux/slices/events/paymentMethods";

const BookingDetails = () => {
  const { selected: booking, isLoadingBookingDetails } = useSelector(
    ({ bookings }) => bookings,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reference } = useParams();

  useEffect(() => {
    dispatch(GET_BOOKING_DETAILS(reference));
    dispatch(BROWSE());
  }, [dispatch, reference]);

  if (isLoadingBookingDetails) {
    return <DetailsSkeleton />;
  }

  if (!booking?._id) {
    return <NotFound navigate={navigate} reference={reference} />;
  }

  const status = getStatusMeta(booking);
  const services = getServices(booking);
  const payment = getPaymentSummary(booking);
  const action = getBookingAction(booking, payment);
  const date = getDateParts(booking?.date);

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-3 md:px-5 md:py-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-ml-2 mb-2 h-8 gap-1.5 px-2 text-xs text-muted-foreground"
        onClick={() => navigate("/platforms/my-bookings")}
      >
        <ArrowLeft className="size-3.5" />
        My bookings
      </Button>

      {/* Mobile */}
      <div className="space-y-3 lg:hidden">
        <BookingOverview
          booking={booking}
          status={status}
          date={date}
          action={action}
        />

        <PaymentSummary booking={booking} payment={payment} action={action} />

        <ReservationOverview services={services} />

        <RefundDetails booking={booking} />

        <PaymentHistory booking={booking} payments={booking?.payments || []} />

        {booking?.catering && <CateringDetails booking={booking} />}

        {booking?.venue && <VenueDetails booking={booking} />}

        <CustomerInformation booking={booking} />

        <TermsSummary terms={booking?.terms} />
      </div>

      {/* Desktop */}
      <div className="hidden items-start gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <aside className="order-1 space-y-3 lg:sticky lg:top-3 lg:order-2">
          <PaymentSummary booking={booking} payment={payment} action={action} />

          <RefundDetails booking={booking} />

          <PaymentHistory
            booking={booking}
            payments={booking?.payments || []}
          />

          <TermsSummary terms={booking?.terms} />
        </aside>

        <div className="order-2 min-w-0 space-y-3 lg:order-1">
          <BookingOverview
            booking={booking}
            status={status}
            date={date}
            action={action}
          />

          <ReservationOverview services={services} />

          {booking?.catering && <CateringDetails booking={booking} />}

          {booking?.venue && <VenueDetails booking={booking} />}
          <NotesAndRequests booking={booking} />
          <CustomerInformation booking={booking} />
        </div>
      </div>
    </main>
  );
};

export default BookingDetails;

const SkeletonBlock = ({ className }) => {
  return <div className={`animate-pulse rounded bg-muted/50 ${className}`} />;
};

const DetailsSkeleton = () => {
  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-3 md:px-5 md:py-4">
      <SkeletonBlock className="mb-2 h-8 w-24 rounded-md" />

      <div className="space-y-3 lg:hidden">
        <BookingOverviewSkeleton />
        <PaymentSummarySkeleton />
        <ScheduleSkeleton />
        <PaymentHistorySkeleton />
        <ServiceDetailsSkeleton withMenus />
        <ServiceDetailsSkeleton />
        <ContactSkeleton />
        <TermsSkeleton />
      </div>

      <div className="hidden items-start gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="order-2 space-y-3 lg:order-1">
          <BookingOverviewSkeleton />
          <ScheduleSkeleton />
          <ServiceDetailsSkeleton withMenus />
          <ServiceDetailsSkeleton />
          <ContactSkeleton />
        </div>

        <div className="order-1 space-y-3 lg:order-2">
          <PaymentSummarySkeleton />
          <PaymentHistorySkeleton />
          <TermsSkeleton />
        </div>
      </div>
    </main>
  );
};
