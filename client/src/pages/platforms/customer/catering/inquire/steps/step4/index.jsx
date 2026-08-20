import { RadioGroup } from "@/components/ui/radio-group";
import Header from "../header";

const Step4 = ({ venues, selectedVenueId, setSelectedVenueId }) => {
  return (
    <div>
      <Header
        title="Venue"
        description="Use your own location or request one of Sandy's Kitchen venues."
      />

      <RadioGroup
        value={selectedVenueId}
        onValueChange={setSelectedVenueId}
        className="grid gap-2"
      >
        {venues.map((venue) => (
          <VenueOption key={venue._id} venue={venue} />
        ))}
      </RadioGroup>
    </div>
  );
};

export default Step4;
