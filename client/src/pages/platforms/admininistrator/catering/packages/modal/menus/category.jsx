import { Button } from "@/components/ui/button";
import { memo } from "react";

const Category = ({
  category,
  variant = "outline",
  setActCategory = () => {},
}) => {
  return (
    <Button
      key={category}
      variant={variant}
      type="button"
      className="h-9 justify-start"
      onClick={() => setActCategory(category)}
    >
      {category}
    </Button>
  );
};

export default memo(Category);
