import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const tones = [
  "bg-mint text-ink",
  "bg-gold/45 text-ink",
  "bg-berry/12 text-berry-deep",
  "bg-pine/10 text-pine",
];

export function Avatar({
  name,
  index = 0,
  className,
}: {
  name: string;
  index?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.72rem] font-semibold",
        tones[index % tones.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
