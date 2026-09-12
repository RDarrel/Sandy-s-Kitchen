const Section = ({ title, children }) => {
  return (
    <section>
      <div className="mb-3 flex items-center gap-3">
        <h3 className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>

        <div className="h-px flex-1 bg-border" />
      </div>

      {children}
    </section>
  );
};

export default Section;
