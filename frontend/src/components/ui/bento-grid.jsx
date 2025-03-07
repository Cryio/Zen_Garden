import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  className,
  title,
  description,
  header,
  icon,
  background,
  href,
  cta,
  ...props
}) => {
  return (
    <div
      className={cn(
        "group/bento relative overflow-hidden rounded-xl border border-border bg-card p-4 hover:shadow-xl transition-all duration-300",
        "bg-white dark:bg-gray-900",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {header}
        <div className="mt-4">
          {icon}
          <div className="mt-2 font-bold text-foreground">
            {title}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {description}
          </div>
          {cta && (
            <a
              href={href}
              className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
            >
              {cta} →
            </a>
          )}
        </div>
      </div>
      {background}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
