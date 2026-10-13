import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Formatter } from "@/services/utilities";
import {
  ChevronDown,
  Mail,
  MessageSquareText,
  Phone,
  StickyNote,
  UsersRound,
} from "lucide-react";

const CustomerDetails = ({ booking, customerName }) => {
  const preferredContact = Formatter.preferredContact(
    booking?.contact?.preferredContact,
  );

  const hasSpecialRequest = Boolean(booking?.contact?.specialRequests?.trim());

  const hasNotes = Boolean(booking?.notes?.trim());

  return (
    <Collapsible
      defaultOpen={false}
      className="overflow-hidden rounded-md border bg-background"
    >
      <CollapsibleTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="group flex cursor-pointer flex-wrap items-center justify-between gap-2 p-3 text-left"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
              <UsersRound className="size-4" />
            </span>

            <span className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold">
                Contact details
              </h3>

              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </span>
          </span>

          {preferredContact && (
            <span className="rounded-md bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground">
              Preferred:{" "}
              <span className="font-medium text-foreground">
                {preferredContact}
              </span>
            </span>
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t p-3">
          {/* Contact */}
          <div className="grid gap-1.5 sm:grid-cols-3">
            <ContactDetail
              icon={<UsersRound className="size-3.5" />}
              label="Name"
              value={customerName}
            />

            <ContactDetail
              icon={<Phone className="size-3.5" />}
              label="Phone"
              value={booking?.contact?.phone}
            />

            <ContactDetail
              icon={<Mail className="size-3.5" />}
              label="Email"
              value={booking?.contact?.email}
            />
          </div>
        </div>

        {/* Request Details */}
        {(hasSpecialRequest || hasNotes) && (
          <div className="border-t bg-muted/5 p-3">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Request details
            </h3>

            <div
              className={`grid gap-2 ${
                hasSpecialRequest && hasNotes ? "md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              {hasSpecialRequest && (
                <RequestDetail
                  icon={<MessageSquareText className="size-3.5" />}
                  label="Special request"
                  value={booking?.contact?.specialRequests}
                />
              )}

              {hasNotes && (
                <RequestDetail
                  icon={<StickyNote className="size-3.5" />}
                  label="Notes"
                  value={booking?.notes}
                />
              )}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CustomerDetails;

const ContactDetail = ({ icon, label, value }) => (
  <div className="flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2">
    <span className="shrink-0 text-muted-foreground">{icon}</span>

    <div className="min-w-0">
      <p className="text-[10px] leading-3 text-muted-foreground">{label}</p>

      <p className="mt-0.5 truncate text-xs font-medium text-foreground">
        {value || "-"}
      </p>
    </div>
  </div>
);

const RequestDetail = ({ icon, label, value }) => (
  <div className="min-w-0 rounded-md border bg-background p-2.5">
    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>

    <p className="line-clamp-3 text-xs leading-5 text-foreground">{value}</p>
  </div>
);
