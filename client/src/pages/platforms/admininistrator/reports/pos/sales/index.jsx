import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Sales = () => {
  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>POS Sales Report</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sales;
