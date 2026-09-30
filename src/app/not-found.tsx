import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="font-heading text-2xl font-semibold">That door is not in the house</h1>
      <Link href="/" className={cn(buttonVariants())}>
        Back to the porch
      </Link>
    </main>
  );
}
