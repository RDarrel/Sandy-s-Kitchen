const Availability = ({ item = {}, handleAction = () => {} }) => {
  const { isAvailable = false } = item;
  return (
    <div className="flex items-center space-x-2 absolute">
      <button
        type="button"
        onClick={() => handleAction("availability", item)}
        className={`inline-flex items-center mt-1 ml-1 gap-1.5 rounded-full border px-2 py-1 text-[10px] font-semibold shadow-md backdrop-blur-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
          isAvailable
            ? "border-emerald-200 bg-emerald-50/95 text-emerald-700"
            : "border-white/30 bg-black/55 text-white"
        }`}
      >
        <span>{isAvailable ? "Available" : "Unavailable"}</span>
        <span
          className={`relative h-3.5 w-6 rounded-full transition ${
            isAvailable ? "bg-emerald-500/90" : "bg-white/30"
          }`}
        >
          <span
            className={`absolute top-0.5 h-2.5 w-2.5 rounded-full bg-white transition ${
              isAvailable ? "left-3" : "left-0.5"
            }`}
          />
        </span>
      </button>
    </div>
  );
};

export default Availability;
