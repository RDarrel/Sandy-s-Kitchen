import { Button } from "@/components/ui/button";
import { ReceiptText, ArrowLeft } from "lucide-react";

const NotFound = ({ navigate, reference }) => {
  return (
    <main className="mx-auto w-full max-w-5xl px-3 py-5 md:px-5">
      <section className="rounded-lg border bg-card px-5 py-14 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
          <ReceiptText className="size-5 text-muted-foreground" />
        </div>

        <h1 className="mt-4 text-sm font-semibold">Booking not found</h1>

        <p className="mt-1 text-xs text-muted-foreground">
          We couldn't find the booking details for #{reference}.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-5 h-8 gap-1.5"
          onClick={() => navigate("/platforms/my-bookings")}
        >
          <ArrowLeft className="size-3.5" />
          Back to my bookings
        </Button>
      </section>
    </main>
  );
};
export default NotFound;
