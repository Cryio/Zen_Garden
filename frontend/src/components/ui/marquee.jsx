import { cn } from "@/lib/utils";

export const Marquee = ({
  className,
  reverse,
  pauseOnHover = false,
  children,
}) => {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [--duration:30s] [--gap:1rem]",
        className
      )}
      data-marquee
      data-reverse={reverse}
      data-pause-on-hover={pauseOnHover}
    >
      <div className="flex min-w-full shrink-0 items-center justify-around gap-[--gap]">
        {children}
      </div>
      <div className="flex min-w-full shrink-0 items-center justify-around gap-[--gap]">
        {children}
      </div>
    </div>
  );
}; 