/** Shared layout for full-page states (404, crash fallback). */
export default function StatusPage({
  code,
  icon: Icon,
  title,
  message,
  children,
  details,
}) {
  return (
    <section
      aria-labelledby="status-title"
      className="mx-auto flex max-w-xl flex-col items-center gap-5 py-8 text-center sm:py-16"
    >
      <div className="grid w-full max-w-md place-items-center gap-1 rounded-4xl bg-primary px-6 pb-6 pt-8">
        {Icon && <Icon className="size-10 text-ink" aria-hidden="true" />}
        <p
          aria-hidden="true"
          className="font-display text-[7rem] leading-[0.85] text-ink sm:text-[9rem]"
        >
          {code}
        </p>
      </div>

      <h1 id="status-title" className="text-4xl sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-sm text-muted-foreground">{message}</p>

      <div className="flex flex-wrap justify-center gap-3">{children}</div>

      {details && <div className="w-full min-w-0">{details}</div>}
    </section>
  );
}
