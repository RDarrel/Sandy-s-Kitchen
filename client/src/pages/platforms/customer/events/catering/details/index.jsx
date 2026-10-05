import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Header from "./header";
import Body from "./body";
import Footer from "./footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CateringDetails = () => {
  const [selected, setSelected] = useState({});
  const [isReview, setIsReview] = useState(false);
  const [isAutomaticRedirect, setIsAutomaticRedirect] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const draft = JSON.parse(sessionStorage.getItem("cateringDraft") || "{}");
    setSelected(draft?.selected);
    setIsReview(draft?.isReview);
    setIsAutomaticRedirect(draft?.isAutomaticRedirect);
  }, []);

  const onSelect = (actionType = "") => {
    if (isReview && actionType === "select") {
      const venueDraft = JSON.parse(
        sessionStorage.getItem("venueDraft") || "{}",
      );
      sessionStorage.setItem(
        "venueDraft",
        JSON.stringify({
          ...venueDraft,
          form: {
            ...venueDraft?.form,
            catering: { ...venueDraft?.form?.catering, item: selected?._id },
          },
        }),
      );
      navigate("/platforms/venues/inquire");
    } else if (actionType === "inquire") {
      sessionStorage.setItem(
        "venueDraft",
        JSON.stringify({ selected, currentStep: 1 }),
      );
      navigate("/platforms/catering/inquire");
    } else if (isAutomaticRedirect) {
      sessionStorage.removeItem("cateringDraft");
      navigate("/platforms/catering");
    } else {
      sessionStorage.removeItem("cateringDraft");
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
          {isReview ? "Back to Inquiry" : "Back to Packages"}
        </Button>

        <Card className={"bg-card"}>
          <CardContent className={"grid gap-5 relative px-3 md:px-5 "}>
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

export default CateringDetails;
