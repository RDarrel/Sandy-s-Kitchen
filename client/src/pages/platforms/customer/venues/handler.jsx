import Details from "./details";
import Inquire from "./inquire";
import Venue from "@/pages/website/venue";

const ActionRenderer = ({
  selected,
  actionType,
  isReview = false,
  handleBackToCateringPackage = () => {},
  onSelect = () => {},
}) => {
  const handleMap = {
    default: Venue,
    details: Details,
    inquire: Inquire,
  };

  const NotFound = ({ actionType }) => (
    <span>No component found for this action {actionType}.</span>
  );

  const CurrentComponent = handleMap[actionType] || NotFound;
  return (
    <CurrentComponent
      selected={selected}
      actionType={actionType}
      onSelect={onSelect}
      isWebsite={false}
      isReview={isReview}
      handleBackToCateringPackage={handleBackToCateringPackage}
    />
  );
};

export default ActionRenderer;
