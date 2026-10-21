import { Warehouse } from "lucide-react";
import { Section } from "../../components";
import InclusionDetails from "../inclusions";

const VenueDetails = ({ booking }) => {
  const venue = booking?.venue;
  const item = venue?.item || {};
  const inclusions = venue?.inclusions || item?.inclusions || [];

  return (
    <Section title={item?.name || "Venue"} icon={Warehouse} badge="Venue">
      <InclusionDetails items={inclusions} />
    </Section>
  );
};

export default VenueDetails;
