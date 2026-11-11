import { MessageSquareText } from "lucide-react";
import { Section } from "./components";

const TeamNotes = ({ booking }) => {
  const notes = booking?.approvalNotes?.trim();

  if (!notes) return null;

  return (
    <Section
      title="Notes from our team"
      icon={MessageSquareText}
    >
      <p className="whitespace-pre-wrap break-words text-xs leading-5">
        {notes}
      </p>
    </Section>
  );
};

export default TeamNotes;
