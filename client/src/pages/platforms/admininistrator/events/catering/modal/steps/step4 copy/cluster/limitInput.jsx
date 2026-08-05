import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";

const LimitInput = ({
  label,
  limit,
  isMainCourse,
  categoryId,
  onUpdateCategoryLimit = () => {},
}) => {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <InputGroup className="h-8 w-36 bg-background shadow-none">
        <InputGroupInput
          className="h-8 min-w-0 text-center text-sm font-medium"
          min="1"
          placeholder="0"
          type="number"
          onChange={({ target }) =>
            onUpdateCategoryLimit(
              isMainCourse,
              categoryId,
              Number(target.value),
            )
          }
          value={String(limit || "")}
        />
        <InputGroupAddon
          align="inline-end"
          className="pr-2 text-xs font-normal"
        >
          menus
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default LimitInput;
