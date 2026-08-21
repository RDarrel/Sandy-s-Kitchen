import { useState } from "react";
import ActionRenderer from "./handler";
const CateringParent = () => {
  const [selected, setSelected] = useState({});
  const [actionType, setActionType] = useState("default");

  const onSelect = (selected, actionType) => {
    setSelected(selected);
    setActionType(actionType);
  };
  return (
    <div>
      <ActionRenderer
        actionType={actionType}
        selected={selected}
        onSelect={onSelect}
      />
    </div>
  );
};

export default CateringParent;
