const SummaryRow = ({ label, value, strong = false }) => {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>

      <span
        className={`max-w-[60%] break-words text-right text-xs ${
          strong ? "font-semibold text-foreground" : "font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default SummaryRow;
