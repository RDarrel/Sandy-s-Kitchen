import { MessageSquareText } from "lucide-react";
import { Section } from "./components";

const TeamNotes = ({ booking }) => {
  const notes = booking?.approvalNotes?.trim();

  if (!notes) return null;

  return (
    <Section
      title="Notes from our team"
      description="Reminders and arrangements for your booking."
      icon={MessageSquareText}
    >
      <div className="rounded-md border border-primary/15 bg-primary/5 px-3 py-2.5">
        <p className="whitespace-pre-wrap break-words text-xs leading-5">
          {notes}
        </p>
      </div>
    </Section>
  );
};

export default TeamNotes;
