const SectionHeader = ({ title, description }) => {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>

      {description && (
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
