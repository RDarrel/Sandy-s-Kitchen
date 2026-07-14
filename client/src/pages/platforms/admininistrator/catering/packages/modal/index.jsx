import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SAVE, UPDATE } from "@/services/redux/slices/procurement/suppliers";
import Step1 from "./steps/step1";
import Step2 from "./steps/step2";
import Step3 from "./steps/step3";
const _form = {
  name: "",
  contact: {
    person: "",
    mobile: "",
  },
  address: "",
};
const steps = [
  { title: "Information" },
  { title: "Main Course" },
  { title: "Other Menu Categories" },
  { title: "Guests Served" },
  { title: "Package Inclusion" },
];
const CustomModal = ({
  isOpen,
  setIsOpen,
  willCreate = true,
  selected = {},
}) => {
  const { token } = useSelector(({ auth }) => auth),
    { formSubmitted, isSuccess } = useSelector(({ suppliers }) => suppliers),
    [form, setForm] = useState(_form),
    [mainCourses, setMainCourses] = useState([]),
    [selectedMenus, setSelectedMenus] = useState([]),
    dispatch = useDispatch();

  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (willCreate) {
      setForm(_form);
    } else {
      setForm({ ..._form, ...selected });
    }
  }, [willCreate, selected, isOpen]);

  useEffect(() => {
    if (!formSubmitted && isSuccess && isOpen) {
      setIsOpen(false);
    }
  }, [formSubmitted, isSuccess, isOpen, setIsOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (willCreate) {
      dispatch(SAVE({ token, data: form }));
    } else {
      dispatch(UPDATE({ token, data: form }));
    }
  };

  if (!isOpen) return null;

  console.log("currentStep", currentStep);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{willCreate ? "Add" : "Update"} Supplier</DialogTitle>
          <DialogDescription>
            Enter the supplier's details. Make sure everything is correct before
            saving.
          </DialogDescription>
        </DialogHeader>
        <Stepper
          className="w-full  space-y-8"
          defaultValue={currentStep}
          value={currentStep}
          indicators={{
            completed: <CheckIcon className="size-3.5" />,
            loading: <LoaderCircleIcon className="size-3.5 animate-spin" />,
          }}
        >
          <StepperNav>
            {steps.map((step, index) => (
              <StepperItem
                key={index}
                step={index + 1}
                className="relative flex-1 items-start"
              >
                <StepperTrigger className="flex flex-col gap-2.5">
                  <StepperIndicator>{index + 1}</StepperIndicator>
                  <StepperTitle>{step.title}</StepperTitle>
                </StepperTrigger>
                {steps.length > index + 1 && (
                  <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
                )}
              </StepperItem>
            ))}
          </StepperNav>
          <StepperPanel className="text-sm">
            {[Step1, Step2, Step3].map((Step, index) => (
              <StepperContent key={index} value={index + 1}>
                <Step
                  mainCourses={mainCourses}
                  setMainCourses={setMainCourses}
                  form={form}
                  setForm={setForm}
                />
              </StepperContent>
            ))}
          </StepperPanel>
          <div className="flex items-center justify-between gap-2.5">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={currentStep === steps.length}
            >
              Next
            </Button>
          </div>
        </Stepper>

        {/* <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-3 gap-5">
              <div>
                <Label htmlFor="company">*Name</Label>
                <Input
                  type="text"
                  value={form?.name || ""}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      name: target.value,
                    })
                  }
                  required
                  id="company"
                  placeholder="Enter package name"
                />
              </div>
              <div>
                <Label htmlFor="company">*Price</Label>
                <Input
                  type="text"
                  value={form?.name || ""}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      name: target.value,
                    })
                  }
                  required
                  id="company"
                  placeholder="Enter package price"
                />
              </div>
              <div>
                <Label htmlFor="company">*Additional Price Per Pax</Label>
                <Input
                  type="text"
                  value={form?.name || ""}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      name: target.value,
                    })
                  }
                  required
                  id="company"
                  placeholder="Enter additional price per pax"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="person">Minimum Pax</Label>
                <Input
                  type="text"
                  value={form?.contact?.person || ""}
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      contact: {
                        ...form.contact,
                        person: target.value,
                      },
                    })
                  }
                  id="person"
                  placeholder="Enter contact person here.."
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="phone">* Mobile No.</Label>

                <Input
                  type="text"
                  value={form?.contact?.mobile || ""}
                  required
                  onChange={({ target }) =>
                    setForm({
                      ...form,
                      contact: {
                        ...form.contact,
                        mobile: target.value,
                      },
                    })
                  }
                  id="phone"
                  placeholder="Enter phone number here.."
                />
              </div>
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                type="text-area"
                value={form?.address || ""}
                required
                onChange={({ target }) =>
                  setForm({
                    ...form,
                    address: target.value,
                  })
                }
                id="address"
                placeholder="Enter description here.."
              />
            </div>
            <MenuChoices
              setSelectedMenus={setSelectedMenus}
              selectedMenus={selectedMenus}
            />
            <SelectedMenus
              menus={selectedMenus}
              setSelectedMenus={setSelectedMenus}
            />
          </div>
          <DialogFooter className="mt-5">
            <Button type="submit" disabled={formSubmitted}>
              Submit
              {formSubmitted && (
                <Loader className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </form> */}
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
