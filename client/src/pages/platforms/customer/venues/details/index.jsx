import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Header from "./header";
import Body from "./body";
import Footer from "./footer";
import { Button } from "@/components/ui/button";

const Details = ({
  isReview = false,
  selected,
  onSelect: handleSelect = () => {},
  handleBackToCateringPackage = () => {},
}) => {
  const onSelect = (data, actionType) => {
    if (isReview) {
      handleBackToCateringPackage();
    } else {
      handleSelect(data, actionType);
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
          onClick={() => onSelect({}, "default")}
        >
          <ArrowLeft className="size-3.5" />
          {isReview ? "Back to Inquiry" : "Back to Venues"}
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

export default Details;
