import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-16 w-16', className)}>
      <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-500/50 via-violet-500/50 to-cyan-400/50 blur-xl" />
      <div className="relative h-full w-full animate-spin rounded-full border-[3px] border-slate-200/80 border-t-blue-600 border-r-violet-500" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/40">
          <ShoppingBag className="h-5 w-5" />
        </span>
      </span>
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[95] overflow-hidden">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl" />
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob-float absolute left-1/4 top-1/4 h-72 w-72 -translate-y-1/2 rounded-full bg-blue-300/40 blur-3xl" />
        <div
          className="animate-blob-float absolute bottom-1/4 right-1/4 h-72 w-72 translate-y-1/2 rounded-full bg-violet-300/40 blur-3xl"
          style={{ animationDelay: '-8s' }}
        />
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center gap-5">
        <Loader />
        <div className="flex flex-col items-center gap-1.5">
          <p className="animate-pulse text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            {message}
          </p>
          <p className="text-xs text-slate-400">This will only take a moment</p>
        </div>
      </div>
    </div>
  );
}