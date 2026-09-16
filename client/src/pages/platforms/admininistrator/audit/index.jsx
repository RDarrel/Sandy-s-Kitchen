import React from "react";
import { Card } from "@/components/ui/card";

import Header from "./header";
import Body from "./body";

const Audit = () => {
  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <Card>
          <Header />
          <Body />
        </Card>
      </div>
    </div>
  );
};

export default Audit;
