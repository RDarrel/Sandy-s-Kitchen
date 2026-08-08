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
import { useDispatch } from "react-redux";
import Step1 from "./steps/step1";
import Step2 from "./steps/step2";
import Step3 from "./steps/step3";
import Step4 from "./steps/step4";
import { toast } from "sonner";
import {
  SAVE,
  SET_NEW_PACKAGE,
  UPDATE,
} from "@/services/redux/slices/events/venues";
import Cloudinary from "@/services/utilities/cloudinary";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import Spinner from "@/components/shared/spinner";
import { buildData } from "./utils";
import { isImgURL } from "@/services/utilities";
const _form = {
  name: "",
  description: "",
  address: "",
  basePrice: 0,
  duration: {
    min: 0,
    max: 0,
  },
  additionalCharges: {
    perHour: 0,
    perPax: 0,
  },
  capacity: 0,
  types: [],
  inclusions: [],
};
const steps = [
  { title: "Basic Information" },
  { title: "Venue Images" },
  { title: "Services & Equipment" },
  { title: "Event Compatibility" },
];
const CustomModal = ({ isOpen, setIsOpen, selected = {} }) => {
  const [form, setForm] = useState(_form),
    [isDraft, setIsDraft] = useState(false),
    [currentStep, setCurrentStep] = useState(1),
    [isSubmitting, setIsSubmitting] = useState(false),
    dispatch = useDispatch();

  const willCreate = !Boolean(selected?._id);

  useEffect(() => {
    if (isOpen && selected?._id) {
      setForm({
        ...selected,
        images: selected.images.map((img) => ({
          ...img,
          src: Cloudinary.getVenueImg(
            img.version,
            selected?._id,
            `image-${img?.id}`,
          ),
        })),
      });
      setCurrentStep(4);
    } else {
      setForm(_form);
      setCurrentStep(1);
    }
  }, [isOpen, selected]);

  if (!isOpen) return null;

  const handleSave = () => {
    const { images = [] } = form;
    dispatch(SAVE(buildData(form)))
      .unwrap()
      .then(async ({ data: item, success }) => {
        try {
          const uploaded = await Promise.all(
            images.map((img, idx) =>
              dispatch(
                UPLOAD({
                  data: Cloudinary.buildFileForm(
                    img,
                    `venues/${item?._id}`,
                    `image-${idx + 1}`,
                  ),
                }),
              ).unwrap(),
            ),
          );

          setIsOpen(false);
          setIsSubmitting(false);
          setForm(_form);
          dispatch(SET_NEW_PACKAGE(item));
          dispatch(
            UPDATE({
              _id: item?._id,
              images: uploaded.map(({ imgId }) => imgId),
            }),
          );
          toast.success(success);
        } catch (error) {
          toast.error(
            error?.message || error || "Failed to save venue images.",
          );
        }
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast.error(error?.message || error || "Failed to created venue.");
      });
  };

  const handleUpdate = async () => {
    let images = [...form?.images];
    const imagesToUpload = images.filter(({ src }) => isImgURL(src) === false);
    if (imagesToUpload?.length > 0) {
      const oldImages = form.images.filter(({ src }) => isImgURL(src));
      const uploaded = await Promise.all(
        imagesToUpload.map(({ src, id }) =>
          dispatch(
            UPLOAD({
              data: Cloudinary.buildFileForm(
                src,
                `venues/${selected?._id}`,
                `image-${id}`,
              ),
            }),
          ).unwrap(),
        ),
      );
      const uploadedVersions = uploaded.map(({ imgId }, idx) => ({
        version: imgId,
        id: imagesToUpload[idx]?.id,
      }));

      images = [...(oldImages || []), ...uploadedVersions];
    }

    dispatch(
      UPDATE({
        ...buildData(form),
        _id: selected?._id,
        images,
      }),
    )
      .unwrap()
      .then((data) => {
        setForm(_form);
        toast.success(data.success);
        setIsOpen(false);
      })
      .catch(() =>
        toast.error(error?.message || error || "Failed to update package."),
      );

    setIsSubmitting(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { images = [], ...rest } = form;
    // const action = e.nativeEvent.submitter.dataset.action;

    if (images?.length === 0 && currentStep === 2) {
      return toast.warning(
        `Please upload at least one venue image to continue.`,
      );
    }

    if (currentStep === 4 && rest.types?.length === 0)
      return toast.warning(
        "Please select at least one event compatibility before saving the venue.",
      );

    if (currentStep !== 4) return setCurrentStep((prev) => prev + 1);
    setIsSubmitting(true);
    if (willCreate) return handleSave();
    return handleUpdate();
  };

  const description = willCreate
    ? "Enter the venue details. Review everything before saving."
    : "Update the venue details. Review your changes before updating.";
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{willCreate ? "Add" : "Update"} Venue</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
                  <StepperTrigger
                    className="flex flex-col gap-2.5 focus-visible:ring-0 focus-visible:outline-none"
                    type="button"
                    onClick={() => {
                      if (willCreate) return;
                      setCurrentStep(index + 1);
                    }}
                  >
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
              {[Step1, Step2, Step3, Step4].map((Step, index) => (
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
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  data-action="next"
                  onClick={() => setIsDraft(false)}
                >
                  {currentStep === 4 ? "Submit" : "Next"}{" "}
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
