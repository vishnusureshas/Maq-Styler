import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal } from './Reveal';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const subscribe = () => {
    if (!email.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setEmail('');
      toast.success('Subscribed! Check your inbox for a welcome gift 🎁');
    }, 900);
  };

  return (
    <section className="container py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white via-sky-50 to-violet-50 px-6 py-14 text-center shadow-xl shadow-sky-200/40 sm:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-blue-300/30 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-xl">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/30">
              <Mail className="h-7 w-7" />
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Get 10% off your first order
            </h2>
            <p className="mt-3 text-slate-500">
              Join 20,000+ shoppers. Get deals, drops and style tips straight to your inbox — no
              spam, ever.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                subscribe();
              }}
              className="mx-auto mt-7 flex max-w-md items-center gap-2 rounded-full border border-white/80 bg-white/80 p-1.5 shadow-sm backdrop-blur"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                disabled={submitting || !email.trim()}
                className="h-10 shrink-0 rounded-full px-6"
              >
                <Send className="mr-1.5 h-4 w-4" />
                {submitting ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </div>
      </Reveal>
    </section>
  );
}