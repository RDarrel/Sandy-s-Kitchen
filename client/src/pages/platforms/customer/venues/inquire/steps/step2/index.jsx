import Header from "../header";
import { Users, Clock, Eye, Check, Beef, Salad, Utensils } from "lucide-react";
import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCallback, useMemo } from "react";

const Step4 = ({
  packages = [],
  selected,
  form,
  menuSelections,
  setForm = () => {},
}) => {
  const navigate = useNavigate();

  const handleView = useCallback(
    (caterPackage) => {
      sessionStorage.setItem(
        "cateringDraft",
        JSON.stringify({
          selected,
          form,
          menuSelections,
        }),
      );

      sessionStorage.setItem(
        "catering-package-review",
        JSON.stringify(caterPackage),
      );

      navigate("/platforms/catering/package-review");
    },
    [selected, form, menuSelections, navigate],
  );

  return (
    <div className="w-full min-w-0">
      <Header
        title="Catering Package"
        description="Choose a catering package that fits your event."
      />

      <div className="grid w-full gap-2.5">
        {packages.map((caterPackage) => (
          <PackageOption
            key={caterPackage._id}
            caterPackage={caterPackage}
            selected={form?.catering?.item === caterPackage._id}
            onSelect={() =>
              setForm((prev) => ({
                ...prev,
                catering: {
                  ...prev?.catering,
                  item: caterPackage._id,
                  packageName: caterPackage.name,
                  includedGuests: caterPackage.includedGuests,
                  basePrice: caterPackage.basePrice,
                },
              }))
            }
            handleView={handleView}
          />
        ))}
      </div>
    </div>
  );
};

export default Step4;

const PackageOption = ({
  caterPackage,
  selected,
  onSelect = () => {},
  handleView = () => {},
}) => {
  const { includedHours, includedGuests } = caterPackage;
  const sideDishLimit = useMemo(() => {
    return caterPackage?.sideMenuCategories?.reduce(
      (acc, curr) => curr?.limit + acc,
      0,
    );
  }, [caterPackage]);
  const mainLimit = caterPackage?.mainCourseLimit;
  const inclusion = caterPackage?.inclusions?.length;

  console.log("caterPackage", caterPackage);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`
        group
        w-full
        min-w-0
        cursor-pointer
        rounded-lg
        border
        p-2.5
        outline-none
        transition-all
        hover:border-primary/40
        hover:bg-primary/[0.02]
        focus-visible:ring-2
        focus-visible:ring-primary/30
        sm:p-3.5
        ${
          selected
            ? "border-primary bg-primary/5"
            : "border-border bg-background"
        }
      `}
    >
      {/* =========================================================
          MOBILE LAYOUT
          ========================================================= */}
      <div className="sm:hidden">
        {/* PACKAGE HEADER */}
        <div className="flex min-w-0 gap-2.5">
          {/* SELECTION */}
          <div
            className="
              mt-1
              flex
              size-4
              shrink-0
              items-center
              justify-center
              rounded-full
              border
            "
          >
            {selected && (
              <div
                className="
                  flex
                  size-full
                  items-center
                  justify-center
                  rounded-full
                  bg-primary
                  text-primary-foreground
                "
              >
                <Check className="size-2.5" />
              </div>
            )}
          </div>

          {/* IMAGE */}
          <div
            className="
              h-[72px]
              w-[88px]
              shrink-0
              overflow-hidden
              rounded-md
              bg-muted
            "
          >
            <img
              src={Cloudinary?.getPackageImg(
                caterPackage?.imgId,
                caterPackage?._id,
              )}
              alt={caterPackage?.name || "Catering package"}
              className="
                h-full
                w-full
                object-cover
                brightness-95
                transition-transform
                group-hover:scale-[1.02]
              "
            />
          </div>

          {/* PACKAGE INFORMATION */}
          <div className="min-w-0 flex-1">
            {/* PACKAGE NAME */}
            <h3 className="truncate text-[15px] font-semibold leading-tight">
              {caterPackage?.name}
            </h3>

            {/* MENU LIMITS */}
            <div className="mt-2 grid gap-1">
              <Feature icon={Beef} value={mainLimit} label="Main Dishes" />

              {sideDishLimit && (
                <Feature
                  icon={Salad}
                  value={sideDishLimit}
                  label="Side Dishes"
                />
              )}
            </div>
          </div>
        </div>

        {/* =======================================================
            MOBILE PACKAGE METRICS
            ======================================================= */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-2.5">
          <PackageMetric
            icon={Users}
            label="Included Guests"
            value={includedGuests}
          />

          <PackageMetric
            icon={Clock}
            label="Service Duration"
            value={`${includedHours} hours`}
          />

          <PackageMetric icon={Utensils} label="Inclusions" value={inclusion} />
        </div>

        {/* PRICE + VIEW DETAILS */}
        <div
          className="
            mt-2.5
            flex
            items-center
            justify-between
            gap-2
            border-t
            pt-2.5
          "
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div>
            <span className="text-sm font-bold text-primary">
              {Formatter.amount(caterPackage?.basePrice)}
            </span>

            <span className="ml-1 text-[10px] text-muted-foreground">
              starting price
            </span>
          </div>

          <DetailsButton caterPackage={caterPackage} handleView={handleView} />
        </div>
      </div>

      {/* =========================================================
          DESKTOP LAYOUT
          ========================================================= */}
      <div
        className="
          hidden
          min-w-0
          grid-cols-[auto_90px_minmax(0,1fr)_auto]
          gap-3
          sm:grid
          sm:items-center
        "
      >
        {/* SELECTION */}
        <div
          className="
            flex
            size-[17px]
            shrink-0
            items-center
            justify-center
            rounded-full
            border
          "
        >
          {selected && (
            <div
              className="
                flex
                size-full
                items-center
                justify-center
                rounded-full
                bg-primary
                text-primary-foreground
              "
            >
              <Check className="size-3" />
            </div>
          )}
        </div>

        {/* IMAGE */}
        <div
          className="
            h-[76px]
            w-[90px]
            shrink-0
            overflow-hidden
            rounded-sm
            bg-muted
          "
        >
          <img
            src={Cloudinary?.getPackageImg(
              caterPackage?.imgId,
              caterPackage?._id,
            )}
            alt={caterPackage?.name || "Catering package"}
            className="
              h-full
              w-full
              object-cover
              brightness-95
              transition-transform
              group-hover:scale-[1.02]
            "
          />
        </div>

        {/* =======================================================
            DESKTOP MAIN CONTENT
            ======================================================= */}
        <div className="min-w-0">
          {/* PACKAGE NAME */}
          <h3 className="truncate text-sm font-semibold sm:text-[15px]">
            {caterPackage?.name}
          </h3>

          {/* MENU LIMITS */}
          <div
            className="
              mt-1.5
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-1
            "
          >
            <Feature icon={Beef} value={mainLimit} label="Main Dishes" />

            <Feature icon={Salad} value={sideDishLimit} label="Side Dishes" />
          </div>

          {/* =====================================================
              DESKTOP PACKAGE METRICS
              ===================================================== */}
          <div
            className="
              mt-2.5
              flex
              flex-wrap
              items-start
              gap-x-6
              gap-y-2
            "
          >
            <PackageMetric
              icon={Users}
              label="Included Guests"
              value={includedGuests}
              desktop
            />

            <PackageMetric
              icon={Clock}
              label="Service Duration"
              value={`${includedHours} hours`}
              desktop
            />

            <PackageMetric
              icon={Utensils}
              label="Inclusions"
              value={inclusion}
              desktop
            />
          </div>
        </div>

        {/* =======================================================
            DESKTOP PRICE + VIEW DETAILS
            ======================================================= */}
        <div
          className="
            flex
            shrink-0
            flex-col
            items-end
            justify-center
            gap-1.5
          "
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <span className="whitespace-nowrap text-sm font-bold text-primary">
            {Formatter.amount(caterPackage?.basePrice)}
          </span>

          <span className="text-[10px] text-muted-foreground">
            Starting price
          </span>

          <DetailsButton caterPackage={caterPackage} handleView={handleView} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   FEATURE
   ========================================================= */

const Feature = ({ icon: Icon, value, label }) => {
  if (value === undefined || value === null) {
    return null;
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
      <Icon className="size-3 shrink-0 text-primary" />

      <span className="whitespace-nowrap">
        <span className="font-bold text-foreground">{value}</span> {label}
      </span>
    </span>
  );
};

/* =========================================================
   PACKAGE METRIC
   ========================================================= */

const PackageMetric = ({ icon: Icon, label, value, desktop = false }) => {
  if (desktop) {
    return (
      <div className="flex min-w-0 flex-col">
        {/* LABEL */}
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="size-3 shrink-0 text-primary" />}

          <span className="whitespace-nowrap text-[10px] font-medium leading-none text-muted-foreground">
            {label}
          </span>
        </div>

        {/* VALUE */}
        <span className="mt-1 whitespace-nowrap text-[12px] font-bold leading-none text-foreground">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      {/* LABEL */}
      <div className="flex items-center gap-1">
        {Icon && <Icon className="size-3 shrink-0 text-primary" />}

        <p className="whitespace-nowrap text-[9px] font-medium leading-none text-muted-foreground">
          {label}
        </p>
      </div>

      {/* VALUE */}
      <p className="mt-1 whitespace-nowrap text-[11px] font-bold leading-tight text-foreground">
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   VIEW DETAILS BUTTON
   ========================================================= */

const DetailsButton = ({ caterPackage, handleView = () => {} }) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="
        h-7
        shrink-0
        gap-1
        px-2
        text-xs
        text-muted-foreground
        hover:text-foreground
      "
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        handleView(caterPackage);
      }}
    >
      <Eye className="size-3.5" />
      View Details
    </Button>
  );
};
