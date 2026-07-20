import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import {
  SAVE,
  TOGGLE,
  UPDATE,
} from "@/services/redux/slices/resources/services";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CATEGORIES, INITIAL_FORM, TYPES } from "./constant";
import { getExistingCategory } from "./utils";
import { NameWarning, FormField } from "./components";
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/shared/spinner";
import { capitalize } from "lodash";
import { CircleHelp } from "lucide-react";

const InventoryModal = () => {
  const { showModal, willCreate, formSubmitted, selected, collections } =
    useSelector(({ services }) => services);
  const [form, setForm] = useState(INITIAL_FORM);
  const dispatch = useDispatch();

  const toggle = () => dispatch(TOGGLE());

  useEffect(() => {
    if (showModal) {
      if (!willCreate && selected) {
        setForm({
          ...INITIAL_FORM,
          ...selected,
        });
      } else {
        setForm({ ...INITIAL_FORM });
      }
    }
  }, [willCreate, selected, showModal]);
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const hasDuplicateName = !!getExistingCategory(
    collections,
    form.name,
    selected?._id,
  );

  const handleSave = () => {
    dispatch(
      SAVE({
        data: form,
      }),
    )
      .unwrap()
      .then((action) => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success(action.success);
      })
      .catch((error) =>
        toast.error(error?.message || error || "Failed to save category."),
      );
  };

  const handleUpdate = () => {
    dispatch(
      UPDATE({
        data: form,
      }),
    )
      .unwrap()
      .then((action) => {
        toggle();
        setForm(INITIAL_FORM);
        toast.success(action.success);
      })
      .catch((error) =>
        toast.error(error?.message || error || "Failed to update category."),
      );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (hasDuplicateName) {
      toast.error("This equipment name already exists.");
      return;
    }

    if (willCreate) {
      handleSave();
    } else {
      handleUpdate();
    }
  };

  const availableForChange = (value) => {
    const availableFor = [...(form?.availableFor || [])];
    const index = availableFor.indexOf(value);
    if (index > -1) {
      availableFor.splice(index, 1);
    } else {
      availableFor.push(value);
    }
    setForm((prev) => ({ ...prev, availableFor }));
  };

  return (
    <Dialog open={showModal} onOpenChange={toggle}>
      <DialogContent className=" overflow-y-auto border-border bg-card sm:max-w-md">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-2xl text-foreground">
            {willCreate ? "Add" : "Update"} Service
          </DialogTitle>
          <DialogDescription>
            Enter the details for the service you want to offer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 mb-5 gap-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <FormField
                  label="Name"
                  content={
                    <>
                      <Input
                        required
                        value={form.name}
                        onChange={(event) =>
                          handleChange("name", event.target.value)
                        }
                        placeholder="Enter service name"
                      />
                      <NameWarning
                        name={form.name}
                        selectedId={selected?._id}
                        collections={collections}
                      />
                    </>
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form?.category}
                  // onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Category</SelectLabel>
                      {CATEGORIES.map((category, idx) => (
                        <SelectItem value={category} key={idx}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3 grid gap-1">
              <div>
                <Label>Available For</Label>
                <p className="text-xs text-forge">
                  Choose where this service can be used.
                </p>
              </div>
              <div className="flex gap-6 ">
                {["catering", "venue"].map((option, idx) => (
                  <div
                    className="flex items-center space-x-2"
                    key={`${idx}-${option}`}
                  >
                    <Checkbox
                      id={option}
                      required={!form?.availableFor?.length}
                      checked={form?.availableFor?.includes(option)}
                      onCheckedChange={() => availableForChange(option)}
                    />
                    <Label htmlFor={option}>{capitalize(option)}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 grid gap-1">
              <div>
                <Label>Service Type</Label>
                <p className="text-xs text-forge">
                  Choose how this service should be provided.
                </p>
              </div>
              <RadioGroup
                defaultValue="comfortable"
                className="w-fit flex gap-7"
              >
                {TYPES.map(({ value, label, description }, idx) => (
                  <div className="flex items-center gap-3" key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-help">
                          <RadioGroupItem value={value} id={value} />
                          <Label htmlFor={value}>{label}</Label>
                        </div>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>{description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <FormField
                label="Description"
                content={
                  <Textarea
                    value={form.description}
                    onChange={(event) =>
                      handleChange("description", event.target.value)
                    }
                    placeholder="Describe this service (optional)"
                    rows={5}
                  />
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={toggle}>
              Cancel
            </Button>
            <Button type="submit" disabled={formSubmitted || hasDuplicateName}>
              {willCreate ? "Save" : "Update"}
              <Spinner formSubmitted={formSubmitted} />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
