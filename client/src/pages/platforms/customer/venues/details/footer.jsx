import { Button } from "@/components/ui/button";
import { Formatter } from "@/services/utilities";
import { ArrowRight } from "lucide-react";

const Footer = ({ selected = {} }) => {
  return (
    <div className="sticky bottom-0 -mx-3 md:-mx-5 border-t bg-background/95 px-4 py-4 -mb-3  backdrop-blur-md">
      <div className="mx-auto max-w-4xl md:flex items-center">
        <div className="mb-3 sm:mb-0 sm:flex-1">
          <p className="font-semibold">Ready to plan your event?</p>

          <p className="text-sm text-muted-foreground">
            Send us an inquiry to get started.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div>
            <p className="text-xs text-muted-foreground">Package Price</p>

            <p className="text-lg font-bold leading-tight">
              {Formatter.amount(selected?.basePrice)}
            </p>
          </div>

          <Button size="lg" className="shrink-0 gap-2">
            Inquire Now
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Footer;
