import Catering from "@/pages/website/catering";
import Details from "./details";
import Inquire from "./inquire";

const ActionRenderer = ({
  selected,
  actionType,
  isContinuingInquiry,
  onSelect = () => {},
}) => {
  const handleMap = {
    default: Catering,
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
      isContinuingInquiry={isContinuingInquiry}
    />
  );
};

export default ActionRenderer;
