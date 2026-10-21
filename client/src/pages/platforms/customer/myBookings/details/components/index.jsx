import { Frame, FrameHeader, FramePanel } from "@/components/reui/frame";

export const FramedCard = ({ header, children }) => {
  return (
    <Frame className="w-full " spacing="none">
      {header && (
        <FrameHeader className="min-h-0 px-3 py-1">{header}</FrameHeader>
      )}

      <FramePanel className="p-0">{children}</FramePanel>
    </Frame>
  );
};

export const FrameTitle = ({
  icon: Icon,
  title,
  description,
  afterTitle,
  trailing,
}) => {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && (
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-background">
            <Icon className="size-3.5 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold leading-5">
              {title}
            </h2>

            {afterTitle}
          </div>

          {description && (
            <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      {trailing && <div className="flex shrink-0 items-center">{trailing}</div>}
    </div>
  );
};

export const Section = ({
  title,
  description,
  icon: Icon,
  badge,
  children,
}) => {
  return (
    <FramedCard
      header={
        <FrameTitle
          icon={Icon}
          title={title}
          description={description}
          trailing={
            badge ? (
              <span className="shrink-0 rounded-md border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                {badge}
              </span>
            ) : null
          }
        />
      }
    >
      <div className="p-3">{children}</div>
    </FramedCard>
  );
};
