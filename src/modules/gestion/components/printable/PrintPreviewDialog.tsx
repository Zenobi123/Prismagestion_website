// Dialog d'aperçu avant impression / téléchargement PDF (charte SPEC).
// Impression : iframe (rendu HTML fidèle). Téléchargement : html2canvas + jsPDF
// (port du downloadPDF vanilla) → PDF identique au document de référence.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Printer, FileDown, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@gestion/components/ui/dialog';
import { Button } from '@gestion/components/ui/button';
import {
  usePrintIframe,
  PAGE_STYLE_A4_DEFAULT,
  PAGE_STYLE_A4_COURRIER,
} from '@gestion/lib/spec/usePrint';
import { downloadElementToPdf } from '@gestion/lib/spec/documentExport';
import { useToast } from '@gestion/components/ui/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
  pdfFilename?: string;
  variant?: 'default' | 'courrier';
  /** Bloc @page spécifique au document (marges A4). Prioritaire sur `variant`. */
  pageStyle?: string;
  /** Déclenche automatiquement le téléchargement PDF à l'ouverture. */
  autoDownload?: boolean;
}

export default function PrintPreviewDialog({
  open,
  onOpenChange,
  title,
  children,
  pdfFilename,
  variant = 'default',
  pageStyle,
  autoDownload = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const autoDone = useRef(false);

  const resolvedPageStyle =
    pageStyle ?? (variant === 'courrier' ? PAGE_STYLE_A4_COURRIER : PAGE_STYLE_A4_DEFAULT);
  // Le nom d'impression (et donc le « Enregistrer au format PDF ») reprend le
  // nom du fichier PDF, sans l'extension.
  const documentTitle = pdfFilename ? pdfFilename.replace(/\.pdf$/i, '') : undefined;
  const print = usePrintIframe(() => ref.current, { pageStyle: resolvedPageStyle, documentTitle });

  const handleDownload = async () => {
    const node = ref.current;
    if (!node || downloading) return;
    setDownloading(true);
    try {
      await downloadElementToPdf(node, pdfFilename || 'document.pdf');
      toast({ title: 'PDF téléchargé', description: pdfFilename });
    } catch (err) {
      console.error('Erreur PDF:', err);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de la génération du PDF.' });
    } finally {
      setDownloading(false);
    }
  };

  // Téléchargement automatique (action « Télécharger ») : on attend le rendu
  // complet de l'aperçu avant de lancer la capture.
  useEffect(() => {
    if (!open) {
      autoDone.current = false;
      return;
    }
    if (autoDownload && !autoDone.current) {
      autoDone.current = true;
      const t = window.setTimeout(() => {
        void handleDownload();
      }, 350);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoDownload]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-0 top-0 h-[100dvh] max-h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-none p-0 sm:left-[50%] sm:top-[50%] sm:h-[90vh] sm:max-h-[90vh] sm:w-[calc(100vw-2rem)] sm:max-w-5xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl">
        <DialogHeader className="min-w-0 px-3 py-3 sm:px-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 space-y-0">
          <DialogTitle className="min-w-0 truncate pr-8 text-sm sm:text-base">{title}</DialogTitle>
          <div className="flex w-full flex-wrap items-center gap-2 no-print sm:w-auto sm:flex-nowrap">
            <Button className="flex-1 sm:flex-none" size="sm" variant="outline" onClick={handleDownload} disabled={downloading}>
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-1" />
              )}{' '}
              PDF
            </Button>
            <Button className="flex-1 sm:flex-none" size="sm" onClick={() => print()} style={{ backgroundColor: '#1e3a8a' }}>
              <Printer className="w-4 h-4 mr-1" /> Imprimer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div
          className="min-h-0 overflow-auto overscroll-contain bg-gray-100 p-2 sm:p-4"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x pan-y pinch-zoom' }}
        >
          <div ref={ref} className="mx-auto min-w-full bg-white shadow-md sm:min-w-0 sm:w-fit">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
