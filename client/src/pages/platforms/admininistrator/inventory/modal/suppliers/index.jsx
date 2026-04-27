import { useSelector } from "react-redux";

const Suppliers = ({ form, setForm = () => {} }) => {
  const { collections: suppliers } = useSelector(({ suppliers }) => suppliers);
  return (
    <div>
      <div className="grid grid-cols-2">
        <div></div>
      </div>
    </div>
  );
};

export default Suppliers;
