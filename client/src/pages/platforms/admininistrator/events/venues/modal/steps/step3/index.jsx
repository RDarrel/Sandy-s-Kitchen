import { BriefcaseBusiness, PackageCheck } from "lucide-react";
import { useSelector } from "react-redux";
import Cluster from "./cluster";
import { useMemo } from "react";

const Step3 = ({ form, setForm = () => {} }) => {
  const { collections: equipment = [] } = useSelector(
    ({ equipment }) => equipment,
  );
  const { collections: services } = useSelector(({ services }) => services);
  const { includedServices = [], includedEquipment = [] } = useMemo(() => {
    if (!form?.inclusions?.length)
      return { includedEquipment: [], includedServices: [] };

    const getInclusionsByModule = (module) =>
      form.inclusions.filter(({ model }) => model === module);
    return {
      includedServices: getInclusionsByModule("Services"),
      includedEquipment: getInclusionsByModule("Equipment"),
    };
  }, [form.inclusions]);

  return (
    <div className="grid max-h-[64vh] gap-2 overflow-y-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent md:max-h-none md:overflow-visible md:pr-0 lg:grid-cols-2">
      <Cluster
        title="Equipment"
        subtitle="Select equipment included in this package."
        addTitle="Available equipment"
        detailsTitle="Included equipment"
        icon={<PackageCheck className="size-4" />}
        setForm={setForm}
        items={equipment}
        included={includedEquipment}
        type="Equipment"
        searchPlaceholder="Search equipment"
        emptyTitle="No equipment found"
      />

      <Cluster
        title="Services"
        subtitle="Select services included in this package."
        addTitle="Available services"
        detailsTitle="Included services"
        icon={<BriefcaseBusiness className="size-4" />}
        items={services}
        type="Services"
        setForm={setForm}
        included={includedServices}
        searchPlaceholder="Search services"
        emptyTitle="No services found"
      />
    </div>
  );
};

export default Step3;
