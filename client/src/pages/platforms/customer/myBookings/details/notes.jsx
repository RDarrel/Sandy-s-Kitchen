import { NotebookText } from "lucide-react";

const NotesAndRequests = ({ booking }) => {
  const specialRequests = booking?.contact?.specialRequests?.trim();
  const notes = booking?.notes?.trim();

  if (!specialRequests && !notes) {
    return null;
  }

  return (
    <Section title="Notes & special requests" icon={NotebookText}>
      <div className="space-y-3">
        {specialRequests && (
          <div>
            <p className="text-[11px] font-medium text-muted-foreground">
              Special requests
            </p>

            <p className="mt-1 whitespace-pre-line text-xs leading-5">
              {specialRequests}
            </p>
          </div>
        )}

        {notes && (
          <div className={specialRequests ? "border-t pt-3" : ""}>
            <p className="text-[11px] font-medium text-muted-foreground">
              Notes
            </p>

            <p className="mt-1 whitespace-pre-line text-xs leading-5">
              {notes}
            </p>
          </div>
        )}
      </div>
    </Section>
  );
};

export default NotesAndRequests;
