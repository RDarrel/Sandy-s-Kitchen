import { Textarea } from "@/components/ui/textarea";
import { StickyNote } from "lucide-react";

const ApprovalNotes = ({ value = "", onChange, disabled, readOnly = false }) => (
  <section className="overflow-hidden rounded-md border bg-background">
    <div className="flex items-center gap-2 border-b bg-muted/10 px-3 py-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
        <StickyNote className="size-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide">
          <label htmlFor={readOnly ? undefined : "approval-notes"}>
            Booking remarks
          </label>
        </h3>
        <p id="approval-notes-description" className="text-[10px] leading-4 text-muted-foreground">
          {readOnly
            ? "Booking instructions and arrangements shared with the customer."
            : "Provide booking instructions or confirmed arrangements. These remarks will appear in the customer's booking details."}
        </p>
      </div>
      {!readOnly && (
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          Optional
        </span>
      )}
    </div>
    <div className="p-3">
      {readOnly ? (
        <p className="whitespace-pre-wrap break-words text-xs leading-5">{value}</p>
      ) : (
        <Textarea
          id="approval-notes"
          aria-describedby="approval-notes-description"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter instructions or confirmed arrangements for the customer."
          className="min-h-24 resize-y text-sm"
          disabled={disabled}
        />
      )}
    </div>
  </section>
);

export default ApprovalNotes;
