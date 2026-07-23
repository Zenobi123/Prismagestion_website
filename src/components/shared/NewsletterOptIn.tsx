import { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { subscribe } from '@/services/newsletterService';

interface NewsletterOptInProps {
  /** Origine de la capture, ex. 'calculateur-igs'. */
  source: string;
  /** Contexte optionnel transmis avec le lead (secteur, valeur calculée...). */
  context?: string;
  title?: string;
  description?: string;
  cta?: string;
  className?: string;
}

/**
 * Bloc de capture d'email réutilisable (lead magnet).
 * À poser sous les calculateurs, guides et outils pour transformer le trafic
 * qualifié en prospects. Écrit dans `newsletter_subscribers` via le service.
 */
export const NewsletterOptIn = ({
  source,
  context,
  title = 'Recevez votre estimation détaillée par email',
  description = "Laissez votre email : nous vous envoyons le détail de votre calcul et les principales pistes d'optimisation applicables à votre situation.",
  cta = 'Recevoir le détail',
  className = '',
}: NewsletterOptInProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');

    const { ok, error } = await subscribe({ email, source, context });

    if (ok) {
      setStatus('done');
      toast({
        title: 'Merci !',
        description: 'Votre demande est bien enregistrée. Nous revenons vers vous rapidement.',
      });
    } else {
      setStatus('idle');
      toast({
        title: 'Oups',
        description: error ?? "L'inscription n'a pas abouti. Réessayez.",
        variant: 'destructive',
      });
    }
  };

  if (status === 'done') {
    return (
      <div
        className={`rounded-lg border border-prisma-purple/20 bg-prisma-light-gray p-6 text-center ${className}`}
      >
        <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-[#7f8f28]" />
        <p className="font-medium text-prisma-purple">Merci, c'est noté&nbsp;!</p>
        <p className="text-sm text-gray-600">
          Vous recevrez votre document et nos conseils par email.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-prisma-purple/20 bg-prisma-light-gray p-6 ${className}`}>
      <div className="mb-3 flex items-center gap-2 text-prisma-purple">
        <Mail className="h-5 w-5" />
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
      </div>
      <p className="mb-4 text-sm text-gray-600">{description}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          aria-label="Votre adresse email"
          className="flex-1 bg-white"
        />
        <Button type="submit" variant="purple" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi…
            </>
          ) : (
            cta
          )}
        </Button>
      </form>
      <p className="mt-2 text-xs text-gray-500">
        Pas de spam. Désinscription en un clic. Vos données restent confidentielles.
      </p>
    </div>
  );
};

export default NewsletterOptIn;
