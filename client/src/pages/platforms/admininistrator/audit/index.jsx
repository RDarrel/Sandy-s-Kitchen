const CodeExam = () => {
  const temperatures = [73, 74, 75, 71, 69, 72, 76, 73];

  const waitingDays = (temperatures) => {
    const diffDays = [];
    const stack = new Array(7).fill(0);
    const results = [];
    const end = temperatures.length;
    for (let i = 0; i < end; i++) {
      stack.push();
    }
    return diffDays;
  };

  console.log("result:", waitingDays(temperatures));

  return <div>Code Exam</div>;
};

export default CodeExam;

// import React from "react";
// import { Card } from "@/components/ui/card";

// import Header from "./header";
// import Body from "./body";

// const Audit = () => {
//   return (
//     <div className="bg-background p-4 md:p-6">
//       <div className="mx-auto max-w-7xl">
//         <Card>
//           <Header />
//           <Body />
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Audit;
