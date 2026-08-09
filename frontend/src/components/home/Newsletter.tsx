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
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-700 px-6 py-16 text-center shadow-2xl shadow-violet-300/50 sm:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-3xl" />
            <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-blue-400/30 blur-3xl" />
            <div className="bg-grid absolute inset-0 opacity-20" />
          </div>

          <div className="relative mx-auto max-w-xl">
            <span className="animate-float mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-pink-500 text-white shadow-lg shadow-fuchsia-500/40">
              <Mail className="h-8 w-8" />
            </span>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Join Our Newsletter
            </h2>
            <p className="mt-3 text-lg text-white/85">Get exclusive deals &amp; new arrivals &amp; updates.</p>
            <p className="mt-1 text-sm text-white/60">Join 20,000+ shoppers — no spam, ever.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                subscribe();
              }}
              className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full bg-white/95 p-1.5 shadow-xl shadow-violet-900/20"
            >
              <Mail className="ml-3 h-5 w-5 shrink-0 text-violet-600" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                disabled={submitting || !email.trim()}
                className="h-11 shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-7 shadow-lg shadow-violet-500/30"
              >
                <Send className="mr-1.5 h-4 w-4" />
                {submitting ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </form>

            <p className="mt-4 text-xs text-white/60">
              By subscribing you agree to our Privacy Policy &amp; Terms.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}