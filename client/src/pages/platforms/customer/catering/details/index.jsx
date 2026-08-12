import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Header from "./header";
import Body from "./body";
import Footer from "./footer";

const Details = ({ selected, setSelected = () => {} }) => {
  return (
    <div className="bg-background p-2 md:p-6">
      <div className="mx-auto max-w-4xl">
        <Card className={"bg-card"}>
          <CardHeader className="space-y-4">
            <button
              type="button"
              onClick={() => setSelected({})}
              className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Catering Packages</span>
            </button>
          </CardHeader>
          <CardContent className={"grid gap-5 relative px-3 md:px-5 "}>
            <Header selected={selected} />
            <Body selected={selected} />
            <Footer selected={selected} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Details;
