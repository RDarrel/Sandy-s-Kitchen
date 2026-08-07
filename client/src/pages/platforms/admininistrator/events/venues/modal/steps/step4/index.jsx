import { eventCategories } from "./constant";
import Type from "./type";
import { useCallback } from "react";

const Step4 = ({ form, setForm }) => {
  const handleSelected = useCallback((checked, event) => {
    setForm((prev) => ({
      ...prev,
      types: checked
        ? [...(prev.types ?? []), event]
        : (prev.types ?? []).filter((type) => type !== event),
    }));
  }, []);

  return (
    <div className="space-y-5">
      {eventCategories.map((category) => {
        const Icon = category.icon;
        return (
          <section key={category.title}>
            {/* Category */}
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-muted">
                <Icon className="size-3.5" />
              </div>

              <h3 className="text-sm font-semibold">{category.title}</h3>
            </div>

            {/* Event Cards - ALWAYS 3 COLUMNS */}
            <div className="grid grid-cols-3 gap-2">
              {category.events.map((event) => {
                return (
                  <Type
                    event={event}
                    key={event}
                    checked={form?.types?.includes(event) ?? false}
                    handleSelected={handleSelected}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default Step4;
