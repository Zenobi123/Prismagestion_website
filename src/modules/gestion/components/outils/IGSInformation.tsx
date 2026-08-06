import type { ReactNode } from "react";
import { BAREME_IGS, CGA_REDUCTION } from "@gestion/lib/spec/fiscal-constants";

const formatMoney = (amount: number) => Math.round(amount || 0).toLocaleString("fr-FR");

const formatRange = (classe: number, min: number, max: number) =>
  classe === 1 ? `Moins de ${formatMoney(max + 1)}` : `De ${formatMoney(min)} à ${formatMoney(max)}`;

const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="text-lg sm:text-xl font-semibold mt-6 mb-3">{children}</h3>
);

/**
 * Présentation détaillée de l'IGS, reprise de la rubrique « Outils Pratiques »
 * du site vitrine PRISMA GESTION (partie IGS uniquement).
 * Les barèmes affichés sont générés depuis la source unique de vérité
 * (`src/lib/spec/fiscal-constants.ts`) — ne pas les dupliquer en dur.
 */
const IGSInformation = () => {
  return (
    <div className="mt-8 bg-neutral-50 border border-neutral-200 p-4 sm:p-8 rounded-lg text-sm sm:text-base leading-relaxed">
      <h2 className="text-xl sm:text-2xl font-bold text-primary mb-4">
        Présentation de l'Impôt Général Synthétique (IGS) au Cameroun
      </h2>

      <H3>Introduction</H3>
      <p>
        L'Impôt Général Synthétique (IGS) est un régime fiscal instauré au Cameroun par la{" "}
        <strong>loi n° 2024/020 du 23 décembre 2024</strong> relative à la fiscalité locale. Ce
        régime a pour objectif principal de simplifier le système fiscal pour les petites
        entreprises en remplaçant plusieurs taxes par une imposition unique et forfaitaire.
      </p>

      <H3>Fondement juridique et objectifs</H3>
      <p>L'IGS est défini par les articles C 38 à C 48 de la loi n° 2024/020. Il vise à :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>Simplifier le système fiscal pour les petites entreprises</li>
        <li>Améliorer la conformité fiscale au sein des PME</li>
        <li>Accroître les recettes fiscales des collectivités territoriales décentralisées (CTD)</li>
        <li>Lutter contre la sous-déclaration des revenus</li>
      </ul>
      <p>
        Cette réforme s'inscrit dans une volonté plus large d'améliorer le rendement fiscal des
        Collectivités Territoriales Décentralisées, de moderniser les méthodes de collecte des
        impôts locaux et de supprimer les impôts locaux à faible rendement.
      </p>

      <H3>Régimes fiscaux remplacés</H3>
      <p>L'IGS remplace :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>
          L'Impôt Libératoire (IL), qui s'appliquait aux entreprises individuelles dont le chiffre
          d'affaires annuel était inférieur à 10 millions de F CFA
        </li>
        <li>
          Le « régime du simplifié », qui concernait les entreprises dont le chiffre d'affaires se
          situait entre 10 et 50 millions de F CFA
        </li>
      </ul>
      <p>Sont également supprimées et remplacées par l'IGS les taxes suivantes :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>Taxe communale sur le bétail</li>
        <li>Taxe d'hygiène et salubrité</li>
        <li>Droit d'occupation temporaire de la voie publique (OTVP)</li>
        <li>Ticket de quai</li>
        <li>Taxe de spectacle</li>
        <li>Taxe de stationnement</li>
        <li>Droits de stade</li>
        <li>Taxe sur la publicité</li>
      </ul>

      <H3>Contribuables concernés</H3>
      <p>L'IGS s'applique aux contribuables (personnes physiques et morales) :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>Exerçant une activité commerciale, industrielle, artisanale ou agropastorale</li>
        <li>Ne relevant pas du « régime réel » d'imposition</li>
        <li>Dont le chiffre d'affaires annuel hors taxes est inférieur à 50 000 000 de francs CFA</li>
      </ul>
      <p>Sont exclus du régime de l'IGS :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>Les conseils fiscaux, comptables agréés et experts-comptables</li>
        <li>Les entreprises agréées au Code des Investissements</li>
        <li>Les personnes ayant opté pour le « régime réel » d'imposition</li>
        <li>Les entreprises dont le chiffre d'affaires dépasse 50 millions de F CFA</li>
      </ul>

      <H3>Barème de l'IGS</H3>
      <p>
        Le calcul de l'IGS est basé sur le chiffre d'affaires annuel hors taxes du contribuable.
        Conformément à l'article C 40 paragraphe 1 de la loi n° 2024/020, le barème se compose de
        dix classes, chacune correspondant à une fourchette spécifique de chiffre d'affaires, avec
        un montant d'impôt fixe à payer pour chaque classe.
      </p>
      <p className="font-semibold mt-4 mb-2">Barème officiel :</p>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-neutral-300 text-xs sm:text-sm">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 px-3 py-2 text-left">Classe</th>
              <th className="border border-neutral-300 px-3 py-2 text-left">
                Fourchette du chiffre d'affaires (F CFA)
              </th>
              <th className="border border-neutral-300 px-3 py-2 text-left">
                Montant à payer (F CFA)
              </th>
            </tr>
          </thead>
          <tbody>
            {BAREME_IGS.map((t) => (
              <tr key={t.classe}>
                <td className="border border-neutral-300 px-3 py-2">{t.classe}</td>
                <td className="border border-neutral-300 px-3 py-2">
                  {formatRange(t.classe, t.min, t.max)}
                </td>
                <td className="border border-neutral-300 px-3 py-2">{formatMoney(t.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H3>Dispositions spéciales</H3>
      <p>
        L'article C 40 paragraphe 2 de la loi n° 2024/020 prévoit une incitation notable pour les
        contribuables adhérant à un centre de gestion agréé. En effet, les taux de l'IGS stipulés
        dans le barème sont divisés par deux pour les membres de ces centres.
      </p>
      <p className="font-semibold mt-4 mb-2">
        Barème réduit pour les membres des centres de gestion agréés :
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-neutral-300 text-xs sm:text-sm">
          <thead>
            <tr className="bg-neutral-100">
              <th className="border border-neutral-300 px-3 py-2 text-left">Classe</th>
              <th className="border border-neutral-300 px-3 py-2 text-left">
                Fourchette du chiffre d'affaires (F CFA)
              </th>
              <th className="border border-neutral-300 px-3 py-2 text-left">
                Montant Standard (F CFA)
              </th>
              <th className="border border-neutral-300 px-3 py-2 text-left">
                Montant Réduit (F CFA)
              </th>
            </tr>
          </thead>
          <tbody>
            {BAREME_IGS.map((t) => (
              <tr key={t.classe}>
                <td className="border border-neutral-300 px-3 py-2">{t.classe}</td>
                <td className="border border-neutral-300 px-3 py-2">
                  {formatRange(t.classe, t.min, t.max)}
                </td>
                <td className="border border-neutral-300 px-3 py-2">{formatMoney(t.montant)}</td>
                <td className="border border-neutral-300 px-3 py-2">
                  {formatMoney(t.montant * CGA_REDUCTION)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H3>Cas particuliers</H3>
      <p>
        Pour les activités de vente de boissons non alcoolisées, la contribution des licences est
        égale à une (01) fois le montant de l'impôt général synthétique applicable en fonction de
        leur tranche de chiffre d'affaires.
      </p>
      <p className="mt-2">
        Pour les activités de vente de boissons alcoolisées, d'armes à feu, de munitions,
        d'explosifs et de jeux de hasard, la contribution des licences est égale à deux (02) fois
        le montant de l'impôt général synthétique applicable en fonction de leur tranche de
        chiffre d'affaires.
      </p>

      <H3>Exonérations et options</H3>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>
          Les entreprises relevant du régime de l'IGS bénéficient d'une exonération de cet impôt
          pour leur première année civile d'activité.
        </li>
        <li>
          Les contribuables qui remplissent les conditions pour le régime de l'IGS ont la
          possibilité de choisir volontairement le « régime réel » d'imposition à la place.
        </li>
        <li>
          Pour exercer cette option, les contribuables doivent en faire la demande formellement
          avant le 1er novembre de chaque année, et le choix prendra effet le 1er janvier de
          l'année suivante.
        </li>
        <li>
          Une fois choisi, le « régime réel » est irrévocable pour une période de trois exercices
          fiscaux consécutifs.
        </li>
      </ul>

      <H3>Procédures de déclaration et de paiement</H3>
      <p>
        Tout contribuable soumis à l'IGS est légalement tenu de souscrire une déclaration détaillée
        de ses revenus perçus au cours de l'année fiscale précédente. Cette déclaration doit être
        déposée au plus tard le 15 juin de chaque année au centre des impôts compétent pour son
        lieu d'imposition.
      </p>
      <p className="mt-2">La déclaration et le paiement doivent être effectués :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>Exclusivement en ligne</li>
        <li>
          Exclusivement dans les nouveaux « centres de fiscalité locale et de particuliers »
          (remplaçant les anciens centres divisionnaires)
        </li>
      </ul>
      <p>
        L'Impôt Général Synthétique lui-même est acquitté sur une base trimestrielle. Ces paiements
        trimestriels doivent être effectués selon le calendrier d'échéances suivant :
      </p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>1er Trimestre (1er janvier au 31 mars) : Paiement exigible avant le 15 février.</li>
        <li>2ème Trimestre (1er avril au 30 juin) : Paiement exigible avant le 15 mai.</li>
        <li>3ème Trimestre (1er juillet au 30 septembre) : Paiement exigible avant le 15 août.</li>
        <li>
          4ème Trimestre (1er octobre au 31 décembre) : Paiement exigible avant le 15 novembre.
        </li>
      </ul>
      <p>
        Par ailleurs, pour les personnes physiques soumises à l'IGS, une déclaration annuelle de
        revenus de particulier doit être déposée au plus tard le 31 Mars.
      </p>

      <H3>Obligations comptables</H3>
      <p>
        Les contribuables réalisant un chiffre d'affaires entre 10 et 50 millions F CFA doivent
        tenir une comptabilité selon le « système minimal de trésorerie ».
      </p>

      <H3>Sanctions et pénalités</H3>
      <p>
        Le non-règlement des sommes dues au titre de l'IGS dans les délais trimestriels prescrits
        entraîne une pénalité de cinquante pour cent (50 %) du montant de l'impôt exigible. En plus
        de la pénalité financière, le non-paiement de l'IGS dans les délais prévus entraîne la
        fermeture d'office et immédiate de l'établissement ou des établissements du contribuable
        défaillant.
      </p>
      <p className="mt-2">
        Les contribuables relevant du régime de l'IGS qui sont légalement tenus de tenir une
        comptabilité conforme au Système Comptable Ouest Africain (SYSCOA) et qui ne le font pas
        s'exposent à la fermeture de leur établissement et à une amende fiscale d'un million
        (1 000 000) de francs CFA.
      </p>
      <p className="mt-2">
        Si l'administration fiscale constate que le chiffre d'affaires annuel d'un contribuable
        soumis à l'IGS a dépassé 50 000 000 de F CFA, ce contribuable sera automatiquement exclu du
        régime de l'IGS et soumis à la patente et au « régime réel » d'imposition.
      </p>

      <H3>Conclusion</H3>
      <p>
        L'Impôt Général Synthétique représente une évolution notable dans la fiscalité des petites
        entreprises au Cameroun. Il vise à simplifier le système fiscal en remplaçant l'Impôt
        Libératoire et le régime simplifié par une taxe unique et forfaitaire basée sur le chiffre
        d'affaires annuel inférieur à 50 millions de F CFA.
      </p>
      <p className="mt-2">Pour les entreprises, ce régime présente :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>
          L'avantage d'une simplification administrative (regroupement de plusieurs taxes en une
          seule)
        </li>
        <li>Une prévisibilité accrue du montant d'impôt à payer</li>
        <li>Des incitations fiscales pour les membres des centres de gestion agréés</li>
        <li>
          Des obligations de déclaration et de paiement électroniques qui nécessitent un accès à
          l'infrastructure numérique
        </li>
      </ul>
      <p className="mt-2">Il est recommandé aux contribuables de :</p>
      <ul className="list-disc pl-5 my-4 space-y-1">
        <li>Évaluer avec précision leur chiffre d'affaires annuel</li>
        <li>
          Respecter scrupuleusement les délais de déclaration annuelle et de paiement trimestriel
        </li>
        <li>Utiliser le système de déclaration et de paiement électronique</li>
        <li>
          Envisager l'adhésion à un Centre de Gestion Agréé pour bénéficier de taux réduits
        </li>
        <li>Se tenir informé des mises à jour éventuelles de la Direction Générale des Impôts</li>
      </ul>
    </div>
  );
};

export default IGSInformation;
