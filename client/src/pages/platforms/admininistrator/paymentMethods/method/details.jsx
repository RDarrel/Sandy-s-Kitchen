const Details = ({ method }) => {
  if (method.type === "cash") {
    return (
      <p className="text-xs font-medium text-foreground">
        Pay at Sandy&apos;s Kitchenette
      </p>
    );
  }

  return (
    <div className="min-w-0">
      {method.accountNumber && (
        <p className="truncate text-xs font-medium text-foreground">
          {method.accountNumber}
        </p>
      )}
    </div>
  );
};

export default Details;
