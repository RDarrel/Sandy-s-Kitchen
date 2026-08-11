import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const Details = ({ selected }) => {
  return (
    <div className="bg-background p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <Card>
          <CardHeader>
            <CardTitle>Test</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Details;
