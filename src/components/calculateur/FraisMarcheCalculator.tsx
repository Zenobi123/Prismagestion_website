import { useMemo, useState } from 'react';
import { AlertTriangle, Info, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuoteDialog } from '@/components/QuoteDialog';
import { toNumber } from '@/utils/numberConversion';
import {
  calculerFraisMarche,
  formatFcfa,
  type LigneLiquidation,
} from '@/utils/fraisMarche';
import {
  BAREMES_DATE_ETAT,
  CNE_REFERENCE_RESOLUTION,
  NB_EXEMPLAIRES_ORIGINAUX,
  TRESORPAY_MIN,
  TRESORPAY_MAX,
} from '@/constants/baremesEnregistrement';

const aujourdhui = () => new Date().toISOString().slice(0, 10);

const LigneMontant = ({ ligne }: { ligne: LigneLiquidation }) => (
  <tr className="border-b border-gray-100 last:border-0">
    <td className="py-2.5 pr-3 text-sm text-gray-800">{ligne.libelle}</td>
    <td className="py-2.5 pr-3 text-xs text-gray-500 hidden sm:table-cell">{ligne.formule}</td>
    <td className="py-2.5 text-right text-sm font-medium whitespace-nowrap">
      {ligne.montant === null ? (
        <span className="text-amber-700">à déterminer</span>
      ) : (
        formatFcfa(ligne.montant)
      )}
    </td>
  </tr>
);

const FraisMarcheCalculator = () => {
  const [montantHT, setMontantHT] = useState('');
  const [nbPages, setNbPages] = useState(String(NB_EXEMPLAIRES_ORIGINAUX));
  const [dateSignature, setDateSignature] = useState(aujourdhui);
  const [fraisTresorpay, setFraisTresorpay] = useState(String(TRESORPAY_MAX));
  const [inclureCne, setInclureCne] = useState(true);
  const [inclureMercuriale, setInclureMercuriale] = useState(true);
  const [inclureAttestations, setInclureAttestations] = useState(true);
  const [calcule, setCalcule] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const montantHTNum = toNumber(montantHT);
  const nbPagesNum = Math.max(0, Math.round(toNumber(nbPages)));

  const resultat = useMemo(
    () =>
      calculerFraisMarche({
        montantHT: montantHTNum,
        nbPagesTimbrees: nbPagesNum,
        dateSignature,
        fraisTresorpay: toNumber(fraisTresorpay),
        inclureCne,
        inclureMercuriale,
        inclureAttestations,
      }),
    [
      montantHTNum,
      nbPagesNum,
      dateSignature,
      fraisTresorpay,
      inclureCne,
      inclureMercuriale,
      inclureAttestations,
    ]
  );

  const montantValide = montantHTNum > 0;
  const afficherResultat = calcule && montantValide;

  return (
    <div className="space-y-8">
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Bon de commande à enregistrer</CardTitle>
          <CardDescription>
            Renseignez le montant hors taxes et les formalités retenues. Le calcul applique les
            barèmes en vigueur au {BAREMES_DATE_ETAT}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="montantHT">Montant HT du bon de commande (F CFA)</Label>
              <Input
                id="montantHT"
                type="text"
                inputMode="numeric"
                placeholder="Ex : 3 500 000"
                value={montantHT}
                onChange={(e) => setMontantHT(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Toujours la valeur hors taxes de la commande publique, jamais le TTC.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateSignature">Date de signature du bon de commande</Label>
              <Input
                id="dateSignature"
                type="date"
                value={dateSignature}
                onChange={(e) => setDateSignature(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Elle détermine le barème CNE applicable, pas la date de dépôt à l'enregistrement.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nbPages">Pages à timbrer</Label>
              <Input
                id="nbPages"
                type="number"
                min={0}
                inputMode="numeric"
                value={nbPages}
                onChange={(e) => setNbPages(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                {NB_EXEMPLAIRES_ORIGINAUX} exemplaires originaux sont exigés par défaut.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tresorpay">Frais de paiement TRESORPAY</Label>
              <Select value={fraisTresorpay} onValueChange={setFraisTresorpay}>
                <SelectTrigger id="tresorpay">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(TRESORPAY_MIN)}>{formatFcfa(TRESORPAY_MIN)}</SelectItem>
                  <SelectItem value={String(TRESORPAY_MAX)}>{formatFcfa(TRESORPAY_MAX)}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                De {formatFcfa(TRESORPAY_MIN)} à {formatFcfa(TRESORPAY_MAX)} selon le montant des
                droits liquidés ; le forfait exact est confirmé à la liquidation automatique.
              </p>
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Formalités à inclure
            </legend>
            <div className="flex items-start gap-2">
              <Checkbox
                id="cne"
                checked={inclureCne}
                onCheckedChange={(v) => setInclureCne(v === true)}
              />
              <Label htmlFor="cne" className="text-sm font-normal leading-snug">
                Certificat de Non Exclusion (CNE-ARMP) — droit de délivrance et frais d'obtention
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="mercuriale"
                checked={inclureMercuriale}
                onCheckedChange={(v) => setInclureMercuriale(v === true)}
              />
              <Label htmlFor="mercuriale" className="text-sm font-normal leading-snug">
                Frais d'exploitation de la mercuriale
              </Label>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="attestations"
                checked={inclureAttestations}
                onCheckedChange={(v) => setInclureAttestations(v === true)}
              />
              <Label htmlFor="attestations" className="text-sm font-normal leading-snug">
                Attestation de conformité fiscale et attestation d'immatriculation
              </Label>
            </div>
          </fieldset>

          <Button
            onClick={() => setCalcule(true)}
            disabled={!montantValide}
            className="w-full sm:w-auto"
          >
            Calculer le coût de la formalité
          </Button>
        </CardContent>
      </Card>

      {afficherResultat && (
        <Card className="border shadow-md">
          <CardHeader>
            <CardTitle>Liquidation</CardTitle>
            <CardDescription>
              Montant HT retenu : {formatFcfa(montantHTNum)}
              {resultat.trancheCne && ` · tranche CNE ${resultat.trancheCne.libelle} F CFA`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {resultat.avertissements.length > 0 && (
              <ul className="space-y-2">
                {resultat.avertissements.map((message) => (
                  <li
                    key={message}
                    className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="overflow-x-auto">
              {/* Sous `sm`, la colonne « formule » est masquée : la table tient alors
                  en pleine largeur, sans défilement horizontal. */}
              <table className="w-full sm:min-w-[520px]">
                <caption className="sr-only">
                  Détail de la liquidation des droits et frais d'enregistrement
                </caption>
                <thead>
                  <tr className="border-b-2 border-prisma-purple/20">
                    <th className="py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-prisma-purple">
                      Élément
                    </th>
                    <th className="py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-prisma-purple hidden sm:table-cell">
                      Formule / assiette
                    </th>
                    <th className="py-2 text-right text-xs font-semibold uppercase tracking-wide text-prisma-purple">
                      Montant
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-prisma-light-gray">
                    <td
                      colSpan={3}
                      className="py-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-600"
                    >
                      Part fiscale
                    </td>
                  </tr>
                  {resultat.lignesFiscales.map((ligne) => (
                    <LigneMontant key={ligne.id} ligne={ligne} />
                  ))}
                  <tr className="border-b border-gray-200">
                    <td className="py-2.5 pr-3 text-sm font-semibold text-prisma-purple">
                      Total fiscal
                    </td>
                    <td className="hidden sm:table-cell" />
                    <td className="py-2.5 text-right text-sm font-bold text-prisma-purple whitespace-nowrap">
                      {resultat.fiscalComplet
                        ? formatFcfa(resultat.totalFiscal)
                        : `${formatFcfa(resultat.totalFiscal)} + postes à déterminer`}
                    </td>
                  </tr>

                  <tr className="bg-prisma-light-gray">
                    <td
                      colSpan={3}
                      className="py-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-600"
                    >
                      Frais annexes
                    </td>
                  </tr>
                  {resultat.lignesAnnexes.map((ligne) => (
                    <LigneMontant key={ligne.id} ligne={ligne} />
                  ))}
                  <tr className="border-b border-gray-200">
                    <td className="py-2.5 pr-3 text-sm font-semibold text-prisma-purple">
                      Total des frais annexes
                    </td>
                    <td className="hidden sm:table-cell" />
                    <td className="py-2.5 text-right text-sm font-bold text-prisma-purple whitespace-nowrap">
                      {resultat.annexesCompletes
                        ? formatFcfa(resultat.totalAnnexes)
                        : `${formatFcfa(resultat.totalAnnexes)} + postes à déterminer`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-prisma-purple p-5 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm text-white/70">Coût total de la formalité</div>
                <div className="text-2xl font-bold">
                  {resultat.coutTotal === null
                    ? 'Incomplet — voir les points signalés'
                    : formatFcfa(resultat.coutTotal)}
                </div>
              </div>
              {resultat.coutTotal !== null && (
                <div className="text-sm text-white/70 sm:text-right">
                  Part fiscale {formatFcfa(resultat.totalFiscal)}
                  <br />
                  Frais annexes {formatFcfa(resultat.totalAnnexes)}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-2">
              <p className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-prisma-purple" />
                <span>
                  Estimation établie sur les barèmes en vigueur au {BAREMES_DATE_ETAT} — base de
                  travail et non source de droit. Les taux et montants sont à confronter au CGI, à
                  la Loi de Finances en vigueur, aux résolutions ARMP et aux notes DGI avant toute
                  diffusion client.
                </span>
              </p>
              <p className="pl-6">Grille CNE : {CNE_REFERENCE_RESOLUTION}.</p>
              <p className="pl-6">
                Le droit versé à l'ARMP et les frais d'obtention du CNE sont présentés sur deux
                lignes distinctes : les agréger masquerait toute hausse de tarif.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setQuoteOpen(true)} variant="purple" className="sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Faire établir le rapport d'évaluation
              </Button>
              <Button
                variant="outline"
                className="sm:w-auto"
                onClick={() => {
                  setCalcule(false);
                  setMontantHT('');
                }}
              >
                Nouveau calcul
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <QuoteDialog
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        serviceTitle="Rapport d'évaluation fiscale — enregistrement de bon de commande"
      />
    </div>
  );
};

export default FraisMarcheCalculator;
