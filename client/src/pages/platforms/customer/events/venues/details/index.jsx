import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header";
import Body from "./body";
import Footer from "./footer";

const VenueDetails = () => {
  const [selected, setSelected] = useState({});
  const [isReview, setIsReview] = useState(false);
  const [isAutomaticRedirect, setIsAutomaticRedirect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const draft = JSON.parse(sessionStorage.getItem("venueDraft") || "{}");
    setSelected(draft?.selected);
    setIsReview(draft?.isReview);
    setIsAutomaticRedirect(draft?.isAutomaticRedirect);
  }, []);

  const onSelect = (actionType = "") => {
    if (isReview && actionType === "select") {
      const cateringDraft = JSON.parse(
        sessionStorage.getItem("cateringDraft") || "{}",
      );

      sessionStorage.setItem(
        "cateringDraft",
        JSON.stringify({
          ...cateringDraft,
          form: {
            ...cateringDraft?.form,
            venue: { ...cateringDraft?.form?.venue, item: selected?._id },
          },
        }),
      );
      navigate("/platforms/catering/inquire");
    } else if (actionType === "inquire") {
      sessionStorage.setItem(
        "venueDraft",
        JSON.stringify({ selected, currentStep: 1 }),
      );
      navigate("/platforms/venues/inquire");
    } else if (isAutomaticRedirect) {
      sessionStorage.removeItem("venueDraft");
      navigate("/platforms/venues");
    } else {
      sessionStorage.removeItem("venueDraft");
      navigate(-1);
    }
  };
  return (
    <div className="bg-background p-2 md:p-6">
      <div className="mx-auto max-w-4xl">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-2 h-8 gap-1.5 px-2 text-xs"
          onClick={onSelect}
        >
          <ArrowLeft className="size-3.5" />
          {isReview ? "Back to Inquiry" : "Back to Venues"}
        </Button>

        <Card className={"bg-card"}>
          <CardContent className={"grid gap-5 relative px-3 md:px-5  "}>
            <Header selected={selected} />
            <Body selected={selected} />
            <Footer
              selected={selected}
              onSelect={onSelect}
              isReview={isReview}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VenueDetails;
