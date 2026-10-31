import logo from "../../../assets/logos/kitchenette.jpg";

const AppLoader = () => {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background px-6 py-12 text-foreground">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="flex w-full max-w-sm flex-col items-center text-center"
      >
        <div className="relative mb-8 flex size-36 items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-border"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent motion-safe:animate-spin motion-safe:[animation-duration:2.4s]"
          />
          <div className="flex size-32 items-center justify-center rounded-full border border-border bg-card p-2 shadow-sm">
            <img
              src={logo}
              alt=""
              width="112"
              height="112"
              className="size-28 rounded-full object-cover"
            />
          </div>
        </div>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Sandy&apos;s Kitchenette
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
          Getting everything ready for you...
        </p>
      </div>
    </main>
  );
};

export default AppLoader;
