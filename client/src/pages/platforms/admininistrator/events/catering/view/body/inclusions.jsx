import { useMemo } from "react";
import { Check, Gift } from "lucide-react";

const Inclusions = ({ catering }) => {
  const { inclusions = [] } = catering;

  const { services = {}, equipment = {} } = useMemo(() => {
    if (!inclusions.length) {
      return {};
    }

    const getByModule = (module) =>
      inclusions.filter(({ model }) => model === module);

    const groupByCategory = (datas) =>
      Object.groupBy(datas, (data) => data.item?.category);

    return {
      services: groupByCategory(getByModule("Services")),
      equipment: groupByCategory(getByModule("Equipment")),
    };
  }, [inclusions]);

  return (
    <section className="rounded-sm border">
      {/* Header */}
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <h2 className="font-bold text-xl mb-2 flex items-center gap-2">
          <Gift />
          Inclusions
        </h2>
      </div>

      <div className="px-4">
        {/* Services */}
        <InclusionItems inclusions={services} title="Services" />

        {/* Equipment */}
        <div className="border-t">
          <InclusionItems inclusions={equipment} title="Equipment" />
        </div>
      </div>
    </section>
  );
};

const InclusionItems = ({ inclusions, title }) => {
  const categories = Object.entries(inclusions);

  if (!categories.length) return null;

  return (
    <section className="py-4">
      {/* Section title */}
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
        {categories.map(([category, values]) => (
          <div key={category} className="min-w-0">
            <p className="mb-1.5 text-sm font-medium uppercase tracking-wide text-muted-foreground ">
              {category}
            </p>

            <ul className="space-y-1">
              {values?.map(({ item }) => (
                <li
                  key={item?.name}
                  className="flex  items-start gap-2 text-md "
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 leading-5 break-words">
                    {item?.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Inclusions;
