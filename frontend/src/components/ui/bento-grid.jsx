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
        "bg-wax-flower-900/70 dark:bg-wax-flower-900/70 border-wax-flower-700/30 dark:border-wax-flower-700/30",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {header}
        <div className="mt-4">
          {icon}
          <div className="mt-2 font-bold text-wax-flower-200 dark:text-wax-flower-100">
            {title}
          </div>
          <div className="mt-1 text-sm text-wax-flower-300 dark:text-wax-flower-300">
            {description}
          </div>
          {cta && (
            <a
              href={href}
              className="mt-4 inline-flex items-center text-sm font-medium text-wax-flower-500 hover:text-wax-flower-400"
            >
              {cta} →
            </a>
          )}
        </div>
      </div>
      {background}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-wax-flower-500/20 via-transparent to-transparent opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300" />
    </div>
  );
};
