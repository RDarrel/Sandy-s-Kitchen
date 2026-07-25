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
import Step1 from "./steps/step1";
import Step2 from "./steps/step2";
import Step3 from "./steps/step3";
import Step4 from "./steps/step4";
import Step5 from "./steps/step5";
import { toast } from "sonner";
import { SAVE } from "@/services/redux/slices/cateringPackages";
import Cloudinary from "@/services/utilities/cloudinary";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import Spinner from "@/components/shared/spinner";
const _form = {
  name: "",
  img: "",
  minimumGuests: 0,
  mainCourseLimit: 3,
  inclusions: [],
  mainCourses: [],
  sideMenus: [],
};
const steps = [
  { title: "Information" },
  { title: "Main Course" },
  { title: "Side Menus" },
  { title: "Rules" },
  { title: "Inclusions" },
];
const CustomModal = ({
  isOpen,
  setIsOpen,
  willCreate = true,
  selected = {},
}) => {
  const [form, setForm] = useState(_form),
    [isDraft, setIsDraft] = useState(false),
    [currentStep, setCurrentStep] = useState(1),
    [isSubmitting, setIsSubmitting] = useState(false),
    dispatch = useDispatch();

  if (!isOpen) return null;

  const getIncludedMenusLength = (menuCategories) =>
    menuCategories.reduce((acc, curr) => acc + curr.choices.length, 0);
  const handleSubmit = (e) => {
    e.preventDefault();
    const {
      mainCourses = [],
      sideMenus = [],
      inclusions = [],
      mainCourseLimit = 0,
      ...rest
    } = form;
    const action = e.nativeEvent.submitter.dataset.action;
    if (currentStep === 1 && !form?.img)
      return toast.warning("Please upload a package image.");

    if (
      currentStep === 2 &&
      getIncludedMenusLength(mainCourses) < mainCourseLimit
    ) {
      return toast.warning(
        `Select at least ${mainCourseLimit} main course menus to match the main course limit.`,
      );
    }

    if (currentStep !== 5) return setCurrentStep((prev) => prev + 1);

    const menuCategoriesFormatted = (datas) =>
      datas.map(({ choices, category, limit = 1 }) => {
        const _choices = choices.map(({ _id }) => _id);
        return { choices: _choices, limit, category: category._id };
      });
    const data = {
      ...rest,
      mainCourseLimit,
      mainCourseCategories: menuCategoriesFormatted(mainCourses),
      ...(sideMenus?.length > 0 && {
        sideMenuCategories: menuCategoriesFormatted(sideMenus),
      }),
      ...(inclusions?.length > 0 && {
        inclusions: inclusions.map((data) => ({
          ...data,
          item: data.item?._id,
        })),
      }),
    };
    setIsSubmitting(true);
    dispatch(SAVE(data))
      .unwrap()
      .then(({ data }) => {
        const imgBuild = Cloudinary.buildFileForm(
          form.img,
          "packages",
          data._id,
        );

        dispatch(UPLOAD({ data: imgBuild }))
          .then(() => {
            setIsOpen(false);
            setIsSubmitting(false);
            setForm(_form);
          })
          .catch((error) => {
            setIsSubmitting(false);
            toast.error(
              error?.message ||
                error ||
                "Failed to upload the image. Please try again.",
            );
          });
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast.error(error?.message || error || "Failed to created package.");
      });
  };
  console.log("form", form);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{willCreate ? "Add" : "Update"} Package</DialogTitle>
          <DialogDescription>
            Enter the package details. Make sure everything is correct before
            saving.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
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
              {[Step1, Step2, Step3, Step4, Step5].map((Step, index) => (
                <StepperContent key={index} value={index + 1}>
                  <Step form={form} setForm={setForm} isDraft={isDraft} />
                </StepperContent>
              ))}
            </StepperPanel>
            <div className="flex items-center justify-between gap-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <div className="flex gap-5">
                {/* <Button
                  variant={"outline"}
                  disabled={currentStep === steps.length}
                  onClick={() => setIsDraft(true)}
                  type="submit"
                  data-action="draft"
                >
                  Save as Draft
                </Button> */}
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  data-action="next"
                  onClick={() => setIsDraft(false)}
                >
                  {currentStep === 5 ? "Submit" : "Next"}{" "}
                  <Spinner formSubmitted={isSubmitting} />
                </Button>
              </div>
            </div>
          </Stepper>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
