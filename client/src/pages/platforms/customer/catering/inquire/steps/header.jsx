import { Badge } from "@/components/ui/badge";

const Header = ({ title, description, badge }) => {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {badge && (
        <Badge className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary shadow-none">
          {badge}
        </Badge>
      )}
    </div>
  );
};

export default Header;
