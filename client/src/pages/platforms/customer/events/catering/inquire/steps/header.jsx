import { Badge } from "@/components/ui/badge";

const Header = ({ title, description, badge, Icon = null }) => {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 shrink-0 text-primary" />}

          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {title}
          </h2>
        </div>

        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {badge && (
        <Badge
          variant="outline"
          className="shrink-0 rounded-full border-primary/20 bg-primary/[0.06] px-2.5 py-1 text-[10px] font-semibold text-primary"
        >
          {badge}
        </Badge>
      )}
    </div>
  );
};

export default Header;
