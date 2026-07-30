
import { useMemo } from "react";
import { Label } from "@gestion/components/ui/label";
import { Input } from "@gestion/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gestion/components/ui/select";
import { Checkbox } from "@gestion/components/ui/checkbox";
import { Badge } from "@gestion/components/ui/badge";
import { Card, CardContent } from "@gestion/components/ui/card";
import { RegimeFiscal, Civilite, ModePaiement } from "@gestion/types/client";
import { computeClientTaxes, formatMoney } from "@gestion/utils/clientFiscalSummary";
import { CenterCombobox } from "./CenterCombobox";


interface ClientProfessionalFieldsProps {
  niu: string;
  centrerattachement: string;
  ville: string;
  secteuractivite: string;
  numerocnps: string;
  regimefiscal: RegimeFiscal;
  civilite: Civilite;
  chiffreaffaires: string;
  iscga: boolean;
  isvendeurboissons: boolean;
  modepaiementigs: ModePaiement;
  modepaiementpsl: ModePaiement;
  gestionexternalisee: boolean;
  contact_principal: string;
  situationimmobiliere?: {
    type: "proprietaire" | "locataire" | "les_deux";
    loyer?: number;
    valeur?: number;
  };
  onChange: (name: string, value: string | boolean) => void;
}

// Source : DGI — Cartographie nationale des CFLP (mise à jour 29/06/2026, 89 CFLP)
const CFLP_OPTIONS = [
  {
    group: "Adamaoua",
    options: [
      { value: "CFLP VINA",         label: "CFLP Vina" },
      { value: "CFLP DJEREM",       label: "CFLP Djerem" },
      { value: "CFLP FARO ET DEO",  label: "CFLP Faro et Deo" },
      { value: "CFLP MAYO BANYO",   label: "CFLP Mayo Banyo" },
      { value: "CFLP MBERE",        label: "CFLP Mbéré" },
    ],
  },
  {
    group: "Centre — Yaoundé",
    options: [
      { value: "CFLP YAOUNDE 1",     label: "CFLP Yaoundé 1" },
      { value: "CFLP YAOUNDE 1 BIS", label: "CFLP Yaoundé 1 Bis" },
      { value: "CFLP YAOUNDE 2",     label: "CFLP Yaoundé 2" },
      { value: "CFLP YAOUNDE 3",     label: "CFLP Yaoundé 3" },
      { value: "CFLP YAOUNDE 4",     label: "CFLP Yaoundé 4" },
      { value: "CFLP YAOUNDE 5",     label: "CFLP Yaoundé 5" },
      { value: "CFLP YAOUNDE 6",     label: "CFLP Yaoundé 6" },
      { value: "CFLP YAOUNDE 7",     label: "CFLP Yaoundé 7" },
    ],
  },
  {
    group: "Centre (hors Yaoundé)",
    options: [
      { value: "CFLP OBALA",            label: "CFLP Obala" },
      { value: "CFLP SAA",              label: "CFLP Sa'a" },
      { value: "CFLP MONATELE",         label: "CFLP Monatélé" },
      { value: "CFLP MBAM ET INOUBOU",  label: "CFLP Mbam et Inoubou" },
      { value: "CFLP MBAM ET KIM",      label: "CFLP Mbam et Kim" },
      { value: "CFLP MBANDJOCK",        label: "CFLP Mbandjock" },
      { value: "CFLP NANGA-EBOKO",      label: "CFLP Nanga-Eboko" },
      { value: "CFLP MFOU",             label: "CFLP Mfou" },
      { value: "CFLP SOA",              label: "CFLP Soa" },
      { value: "CFLP NKOABANG",         label: "CFLP Nkoabang" },
      { value: "CFLP NGOUMOU",          label: "CFLP Ngoumou" },
      { value: "CFLP MBANKOMO",         label: "CFLP Mbankomo" },
      { value: "CFLP NYONG ET KELLE",   label: "CFLP Nyong et Kellé" },
      { value: "CFLP NYONG ET MFOUMOU", label: "CFLP Nyong et Mfoumou" },
      { value: "CFLP NYONG ET SOO",     label: "CFLP Nyong et So'o" },
    ],
  },
  {
    group: "Est",
    options: [
      { value: "CFLP BERTOUA",         label: "CFLP Bertoua" },
      { value: "CFLP GAROUA-BOULAI",   label: "CFLP Garoua-Boulaï" },
      { value: "CFLP HAUT-NYONG",      label: "CFLP Haut-Nyong" },
      { value: "CFLP KADEY",           label: "CFLP Kadey" },
      { value: "CFLP BOUMBA ET NGOKO", label: "CFLP Boumba et Ngoko" },
    ],
  },
  {
    group: "Extrême-Nord",
    options: [
      { value: "CFLP DIAMARE",         label: "CFLP Diamaré" },
      { value: "CFLP LOGONE ET CHARI", label: "CFLP Logone et Chari" },
      { value: "CFLP MAYO-DANAY",      label: "CFLP Mayo-Danay" },
      { value: "CFLP MAYO-KANI",       label: "CFLP Mayo-Kani" },
      { value: "CFLP MAYO-SAVA",       label: "CFLP Mayo-Sava" },
      { value: "CFLP MAYO-TSANAGA",    label: "CFLP Mayo-Tsanaga" },
    ],
  },
  {
    group: "Littoral — Douala",
    options: [
      { value: "CFLP DOUALA 1",     label: "CFLP Douala 1" },
      { value: "CFLP DOUALA 1 BIS", label: "CFLP Douala 1 Bis" },
      { value: "CFLP DOUALA 2",     label: "CFLP Douala 2" },
      { value: "CFLP DOUALA 3",     label: "CFLP Douala 3" },
      { value: "CFLP DOUALA 3 BIS", label: "CFLP Douala 3 Bis" },
      { value: "CFLP DOUALA 4",     label: "CFLP Douala 4" },
      { value: "CFLP DOUALA 5",     label: "CFLP Douala 5" },
      { value: "CFLP DOUALA 5 BIS", label: "CFLP Douala 5 Bis" },
    ],
  },
  {
    group: "Littoral (hors Douala)",
    options: [
      { value: "CFLP MBANGA",          label: "CFLP Mbanga" },
      { value: "CFLP NKONGSAMBA",      label: "CFLP Nkongsamba" },
      { value: "CFLP NKAM",            label: "CFLP Nkam" },
      { value: "CFLP SANAGA MARITIME", label: "CFLP Sanaga Maritime" },
    ],
  },
  {
    group: "Nord",
    options: [
      { value: "CFLP BENOUE",      label: "CFLP Bénoué" },
      { value: "CFLP FARO",        label: "CFLP Faro" },
      { value: "CFLP MAYO-LOUTI",  label: "CFLP Mayo-Louti" },
      { value: "CFLP MAYO-REY",    label: "CFLP Mayo-Rey" },
    ],
  },
  {
    group: "Nord-Ouest",
    options: [
      { value: "CFLP MEZAM",         label: "CFLP Mezam" },
      { value: "CFLP MOMO",          label: "CFLP Momo" },
      { value: "CFLP MENCHUM",       label: "CFLP Menchum" },
      { value: "CFLP NGOKETUNJIA",   label: "CFLP Ngoketunjia" },
      { value: "CFLP BOYO",          label: "CFLP Boyo" },
      { value: "CFLP BUI",           label: "CFLP Bui" },
      { value: "CFLP DONGA MANTUNG", label: "CFLP Donga Mantung" },
    ],
  },
  {
    group: "Ouest",
    options: [
      { value: "CFLP BAFOUSSAM 1",    label: "CFLP Bafoussam 1" },
      { value: "CFLP BAFOUSSAM 2",    label: "CFLP Bafoussam 2" },
      { value: "CFLP BAFOUSSAM 3",    label: "CFLP Bafoussam 3" },
      { value: "CFLP BAMBOUTOS",      label: "CFLP Bamboutos" },
      { value: "CFLP MENOUA",         label: "CFLP Menoua" },
      { value: "CFLP HAUT-NKAM",      label: "CFLP Haut-Nkam" },
      { value: "CFLP HAUTS-PLATEAUX", label: "CFLP Hauts-Plateaux" },
      { value: "CFLP KOUNG-KHI",      label: "CFLP Koung-Khi" },
      { value: "CFLP NDE",            label: "CFLP Ndé" },
      { value: "CFLP FOUMBAN",        label: "CFLP Foumban" },
      { value: "CFLP FOUMBOT",        label: "CFLP Foumbot" },
    ],
  },
  {
    group: "Sud",
    options: [
      { value: "CFLP KRIBI 1",        label: "CFLP Kribi 1" },
      { value: "CFLP KRIBI 2",        label: "CFLP Kribi 2" },
      { value: "CFLP MVILA",          label: "CFLP Mvila" },
      { value: "CFLP SANGMELIMA",     label: "CFLP Sangmélima" },
      { value: "CFLP MEYOMESSALA",    label: "CFLP Meyomessala" },
      { value: "CFLP VALLEE DU NTEM", label: "CFLP Vallée du Ntem" },
    ],
  },
  {
    group: "Sud-Ouest",
    options: [
      { value: "CFLP BUEA",             label: "CFLP Buea" },
      { value: "CFLP LIMBE",            label: "CFLP Limbe" },
      { value: "CFLP TIKO",             label: "CFLP Tiko" },
      { value: "CFLP MUYUKA",           label: "CFLP Muyuka" },
      { value: "CFLP MEME",             label: "CFLP Meme" },
      { value: "CFLP MANYU",            label: "CFLP Manyu" },
      { value: "CFLP BAKASSI",          label: "CFLP Bakassi" },
      { value: "CFLP EKONDO-TITI",      label: "CFLP Ekondo-Titi" },
      { value: "CFLP KOUPE-MANENGOUBA", label: "CFLP Koupé-Manengouba" },
      { value: "CFLP LEBIALEM",         label: "CFLP Lebialem" },
    ],
  },
  {
    group: "",
    options: [
      { value: "Autre", label: "Autre" },
    ],
  },
];

// Options pour les contribuables du régime Réel (CIME, DGE, CSI)
// Source : DGI — https://www.impots.cm/fr/cartographie-des-centres-regionaux-des-impots
const REEL_OPTIONS = [
  {
    group: "DGE",
    options: [
      { value: "DGE", label: "Direction des Grandes Entreprises (DGE)" },
    ],
  },
  {
    group: "Yaoundé",
    options: [
      { value: "CIME YAOUNDE EST",       label: "CIME Yaoundé-Est" },
      { value: "CIME YAOUNDE OUEST",     label: "CIME Yaoundé-Ouest" },
      { value: "CIME YAOUNDE EXTERIEUR", label: "CIME Yaoundé-Extérieur" },
      { value: "SISPLI YAOUNDE",         label: "CSI Professions Libérales et Immobilier — Yaoundé" },
      { value: "CSI EPA YAOUNDE",        label: "CSI EPA, CTD et Organismes — Yaoundé" },
    ],
  },
  {
    group: "Douala",
    options: [
      { value: "CIME DOUALA AKWA 1",    label: "CIME Douala-Akwa 1" },
      { value: "CIME DOUALA AKWA 2",    label: "CIME Douala-Akwa 2" },
      { value: "CIME DOUALA BONANJO",   label: "CIME Douala-Bonanjo" },
      { value: "CIME DOUALA EXTERIEUR", label: "CIME Douala-Extérieur" },
    ],
  },
  {
    group: "Adamaoua",
    options: [
      { value: "CIME NGAOUNDERE", label: "CIME Ngaoundéré" },
    ],
  },
  {
    group: "Est",
    options: [
      { value: "CIME BERTOUA", label: "CIME Bertoua" },
    ],
  },
  {
    group: "Extrême-Nord",
    options: [
      { value: "CIME MAROUA", label: "CIME Maroua" },
    ],
  },
  {
    group: "Ouest",
    options: [
      { value: "CIME BAFOUSSAM", label: "CIME Bafoussam" },
    ],
  },
  {
    group: "Sud-Ouest",
    options: [
      { value: "CIME LIMBE", label: "CIME Limbe" },
    ],
  },
  {
    group: "",
    options: [
      { value: "Autre", label: "Autre" },
    ],
  },
];

// Détecte le groupe CFLP/CIME correspondant à la ville saisie
function detectCenterGroup(ville: string): string {
  const v = ville.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  if (!v) return "";

  const cityMap: [string[], string][] = [
    [["yaounde", "soa", "mbankomo", "nkolafamba", "biyem"], "Yaoundé"],
    [["obala", "mbandjock", "monatelé", "monatele", "sa'a", "saa", "mfou", "akonolinga", "eseka", "mbalmayo", "ayos", "nanga-eboko", "nanga eboko", "ntui"], "Région Centre (hors Yaoundé)"],
    [["douala", "bonaberi", "bassa", "ndog"], "Douala"],
    [["ngaoundere", "tibati", "ngaoundal", "meiganga", "banyo", "tignere", "vina"], "Adamaoua"],
    [["bertoua", "abong-mbang", "abong mbang", "yokadouma", "moloundou", "batouri", "belabo"], "Est"],
    [["maroua", "kousseri", "mora", "mokolo", "yagoua", "kaele", "waza", "guime"], "Extrême-Nord"],
    [["garoua", "guider", "poli", "figuil", "touboro", "ngong"], "Nord"],
    [["bamenda", "wum", "kumbo", "bali", "ndop", "nkambe", "tubah", "santa"], "Nord-Ouest"],
    [["bafoussam", "foumbot", "mbouda", "dschang", "bangangte", "foumban", "baham", "bafang", "bafia"], "Ouest"],
    [["ebolowa", "kribi", "sangmelima", "ambam", "meyomessala", "zoetele", "lolodorf", "meyomessala"], "Sud"],
    [["buea", "limbe", "kumba", "mamfe", "tiko", "muyuka", "mundemba", "ekondo"], "Sud-Ouest"],
  ];

  for (const [cities, group] of cityMap) {
    if (cities.some(c => v.includes(c))) return group;
  }
  return "";
}

type CenterOption = { group: string; options: { value: string; label: string }[] };

function filterByVille(options: CenterOption[], ville: string, alwaysShow?: string[]): CenterOption[] {
  const group = detectCenterGroup(ville);
  if (!group) return options;
  return options.filter(g =>
    g.group === group ||
    g.group === "" ||
    (alwaysShow?.includes(g.group) ?? false)
  );
}

function getIGSEcheances(modePaiement: ModePaiement, year: number) {
  if (modePaiement === "trimestriel") {
    return [
      { label: "1er trim.", echeance: new Date(year, 0, 15), part: "25%" },
      { label: "2e trim.", echeance: new Date(year, 2, 15), part: "25%" },
      { label: "3e trim.", echeance: new Date(year, 6, 15), part: "25%" },
      { label: "4e trim.", echeance: new Date(year, 9, 15), part: "25%" },
    ];
  }
  return [
    { label: "Annuel", echeance: new Date(year, 2, 1), part: "100%" },
  ];
}

function getEcheanceStatus(echeance: Date) {
  const now = new Date();
  const graceDate = new Date(echeance);
  graceDate.setDate(graceDate.getDate() + 30);

  if (now < echeance) return { label: "À venir", color: "bg-blue-100 text-blue-700" };
  if (now < graceDate) return { label: "En délai", color: "bg-yellow-100 text-yellow-700" };
  return { label: "En retard", color: "bg-red-100 text-red-700" };
}

export function ClientProfessionalFields({
  niu,
  centrerattachement,
  ville,
  secteuractivite,
  numerocnps,
  regimefiscal,
  civilite,
  chiffreaffaires,
  iscga,
  isvendeurboissons,
  modepaiementigs,
  modepaiementpsl,
  gestionexternalisee,
  contact_principal,
  situationimmobiliere,
  onChange,
}: ClientProfessionalFieldsProps) {
  const ca = parseFloat(chiffreaffaires) || 0;

  const taxes = useMemo(() => computeClientTaxes({
    regimefiscal,
    chiffreaffaires: ca,
    iscga,
    isvendeurboissons,
    modepaiementigs,
    modepaiementpsl,
    situationimmobiliere,
  }), [regimefiscal, ca, iscga, isvendeurboissons, modepaiementigs, situationimmobiliere, modepaiementpsl]);

  const showFiscalPreview = ca > 0 && regimefiscal !== "non_professionnel" && regimefiscal !== "obnl";
  const currentYear = new Date().getFullYear();
  const echeances = regimefiscal === "igs" ? getIGSEcheances(modepaiementigs, currentYear) : [];

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Informations professionnelles</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="niu">NIU *</Label>
          <Input
            id="niu"
            name="niu"
            value={niu}
            onChange={(e) => onChange("niu", e.target.value)}
            required
          />
        </div>

        {(regimefiscal === "igs" || regimefiscal === "reel") && (() => {
          const isIgs = regimefiscal === "igs";
          const label    = isIgs ? "CFLP (Centre de rattachement fiscal) *" : "Centre de rattachement fiscal *";
          const placeholder = isIgs ? "Sélectionnez un CFLP" : "Sélectionnez un centre";
          const rawOptions  = isIgs
            ? filterByVille(CFLP_OPTIONS, ville)
            : filterByVille(REEL_OPTIONS, ville, ["DGE"]);

          return (
            <div>
              <Label htmlFor="centrerattachement">{label}</Label>
              <CenterCombobox
                id="centrerattachement"
                value={centrerattachement}
                onChange={(value) => onChange("centrerattachement", value)}
                options={rawOptions}
                placeholder={placeholder}
              />
            </div>
          );
        })()}


        <div>
          <Label htmlFor="civilite">Civilité</Label>
          <Select
            value={civilite}
            onValueChange={(value) => onChange("civilite", value as Civilite)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la civilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M.">M.</SelectItem>
              <SelectItem value="Mme">Mme</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="contact_principal">Nom du contact principal</Label>
          <Input
            id="contact_principal"
            name="contact_principal"
            value={contact_principal}
            onChange={(e) => onChange("contact_principal", e.target.value)}
            placeholder="Ex: M. OBIANG Nathan"
          />
        </div>

        <div>
          <Label htmlFor="secteuractivite">Secteur d'activité *</Label>
          <Input
            id="secteuractivite"
            name="secteuractivite"
            value={secteuractivite}
            onChange={(e) => onChange("secteuractivite", e.target.value)}
            placeholder="Ex: commerce, service, industrie…"
            required
          />
        </div>

        <div>
          <Label htmlFor="numerocnps">Numéro CNPS</Label>
          <Input
            id="numerocnps"
            name="numerocnps"
            value={numerocnps}
            onChange={(e) => onChange("numerocnps", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="gestionexternalisee">Gestion de dossiers clients en portefeuille</Label>
          <Select
            value={gestionexternalisee ? "Oui" : "Non"}
            onValueChange={(value) => onChange("gestionexternalisee", value === "Oui")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Non">Non</SelectItem>
              <SelectItem value="Oui">Oui</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section fiscale */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 pt-3 sm:pt-4 border-t">Situation fiscale</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <Label htmlFor="regimefiscal">Régime fiscal *</Label>
          <Select
            value={regimefiscal}
            onValueChange={(value) => onChange("regimefiscal", value as RegimeFiscal)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le régime fiscal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="igs">Impôt Général Synthétique (IGS)</SelectItem>
              <SelectItem value="reel">Régime Réel</SelectItem>
              <SelectItem value="non_professionnel">Non Professionnel</SelectItem>
              <SelectItem value="obnl">OBNL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="chiffreaffaires">Chiffre d'affaires (F CFA)</Label>
          <Input
            id="chiffreaffaires"
            name="chiffreaffaires"
            type="number"
            value={chiffreaffaires}
            placeholder="Montant en F CFA"
            onChange={(e) => onChange("chiffreaffaires", e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="iscga"
          checked={iscga}
          onCheckedChange={(checked) =>
            onChange("iscga", checked === true)
          }
        />
        <Label htmlFor="iscga" className="font-medium cursor-pointer">
          Adhérent à un Centre de Gestion Agréé (CGA)
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isvendeurboissons"
          checked={isvendeurboissons}
          onCheckedChange={(checked) =>
            onChange("isvendeurboissons", checked === true)
          }
        />
        <Label htmlFor="isvendeurboissons" className="font-medium cursor-pointer">
          Vendeur de boissons (licence)
        </Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {regimefiscal === "igs" && (
          <div>
            <Label htmlFor="modepaiementigs">Mode de paiement IGS</Label>
            <Select
              value={modepaiementigs}
              onValueChange={(value) => onChange("modepaiementigs", value as ModePaiement)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le mode de paiement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annuel">Annuel</SelectItem>
                <SelectItem value="trimestriel">Trimestriel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="modepaiementpsl">Mode de paiement PSL</Label>
          <Select
            value={modepaiementpsl}
            onValueChange={(value) => onChange("modepaiementpsl", value as ModePaiement)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le mode de paiement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annuel">Annuel</SelectItem>
              <SelectItem value="trimestriel">Trimestriel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calculs fiscaux automatiques */}
      {showFiscalPreview && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm font-semibold text-primary mb-3">Impôts calculés automatiquement</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {regimefiscal === "igs" && taxes.igs > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">IGS (Classe {taxes.igsClasse})</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.igs)}</p>
                  {iscga && <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700">CGA -50%</Badge>}
                </div>
              )}
              {regimefiscal === "reel" && taxes.patente > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Patente</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.patente)}</p>
                </div>
              )}
              {taxes.tdl > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">TDL</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.tdl)}</p>
                </div>
              )}
              {taxes.soldeIR > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Solde IR/IS</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.soldeIR)}</p>
                </div>
              )}
              {taxes.licence > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Licence</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.licence)}</p>
                </div>
              )}
              {taxes.psl > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">PSL</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.psl)}</p>
                </div>
              )}
              {taxes.bail > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Bail ({taxes.tauxBail}%)</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.bail)}</p>
                </div>
              )}
              {taxes.tf > 0 && (
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Taxe Foncière</p>
                  <p className="text-sm font-semibold">{formatMoney(taxes.tf)}</p>
                </div>
              )}
            </div>

            {/* Total */}
            {(() => {
              const total = taxes.igs + taxes.patente + taxes.tdl + taxes.soldeIR + taxes.licence + taxes.psl + taxes.bail + taxes.tf;
              return total > 0 ? (
                <div className="mt-3 pt-2 border-t border-primary/20 flex justify-between items-center">
                  <span className="text-sm font-medium">Total obligations fiscales</span>
                  <span className="text-sm font-bold text-primary">{formatMoney(total)}</span>
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}

      {/* Échéancier paiement IGS */}
      {regimefiscal === "igs" && ca > 0 && taxes.igs > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4 pb-3">
            <p className="text-sm font-semibold text-amber-800 mb-3">
              Échéancier IGS {currentYear} ({modepaiementigs === "trimestriel" ? "Trimestriel" : "Annuel"})
            </p>
            <div className="space-y-2">
              {echeances.map((ech, i) => {
                const status = getEcheanceStatus(ech.echeance);
                const montant = modepaiementigs === "trimestriel" ? Math.round(taxes.igs / 4) : taxes.igs;
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${status.color}`}>
                        {status.label}
                      </Badge>
                      <span className="text-muted-foreground">{ech.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {ech.echeance.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="font-medium">{formatMoney(montant)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {modepaiementigs === "trimestriel" && (
              <p className="text-[10px] text-muted-foreground mt-2">
                Pénalité de retard : 10% par mois après 30 jours de grâce
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Indicateur CA hors barème IGS */}
      {regimefiscal === "igs" && ca >= 50000000 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-3">
            <p className="text-sm font-medium text-red-700">
              CA de {formatMoney(ca)} hors barème IGS (max 50 000 000 F CFA). Ce client devrait passer au Régime Réel.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
