
import React from "react";

const IGSInformation = () => {
  return (
    <div className="mt-16 bg-prisma-light-gray p-8 rounded-lg">
      <div className="prose max-w-none">
        <h2 className="text-2xl font-bold text-prisma-purple mb-4">Présentation de l'Impôt Général Synthétique (IGS) au Cameroun</h2>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Introduction</h3>
        <p>
          L'Impôt Général Synthétique (IGS) est un régime fiscal instauré au Cameroun par la <strong>loi n° 2024/020 du 23 décembre 2024</strong> relative à la fiscalité locale. Ce régime a pour objectif principal de simplifier le système fiscal pour les petites entreprises en remplaçant plusieurs taxes par une imposition unique et forfaitaire.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Fondement juridique et objectifs</h3>
        <p>
          L'IGS est défini par les articles C 38 à C 48 de la loi n° 2024/020. Il vise à :
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>Simplifier le système fiscal pour les petites entreprises</li>
          <li>Améliorer la conformité fiscale au sein des PME</li>
          <li>Accroître les recettes fiscales des collectivités territoriales décentralisées (CTD)</li>
          <li>Lutter contre la sous-déclaration des revenus</li>
        </ul>
        <p>
          Cette réforme s'inscrit dans une volonté plus large d'améliorer le rendement fiscal des Collectivités Territoriales Décentralisées, de moderniser les méthodes de collecte des impôts locaux et de supprimer les impôts locaux à faible rendement.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Régimes fiscaux remplacés</h3>
        <p>L'IGS remplace :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>L'Impôt Libératoire (IL), qui s'appliquait aux entreprises individuelles dont le chiffre d'affaires annuel était inférieur à 10 millions de F CFA</li>
          <li>Le "régime du simplifié", qui concernait les entreprises dont le chiffre d'affaires se situait entre 10 et 50 millions de F CFA</li>
        </ul>
        <p>Sont également supprimées et remplacées par l'IGS les taxes suivantes :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Taxe communale sur le bétail</li>
          <li>Taxe d'hygiène et salubrité</li>
          <li>Droit d'occupation temporaire de la voie publique (OTVP)</li>
          <li>Ticket de quai</li>
          <li>Taxe de spectacle</li>
          <li>Taxe de stationnement</li>
          <li>Droits de stade</li>
          <li>Taxe sur la publicité</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Contribuables concernés</h3>
        <p>L'IGS s'applique aux contribuables (personnes physiques et morales) :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Exerçant une activité commerciale, industrielle, artisanale ou agropastorale</li>
          <li>Ne relevant pas du "régime réel" d'imposition</li>
          <li>Dont le chiffre d'affaires annuel hors taxes est inférieur à 50 000 000 de francs CFA</li>
        </ul>
        <p>Sont exclus du régime de l'IGS :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Les conseils fiscaux, comptables agréés et experts-comptables</li>
          <li>Les entreprises agréées au Code des Investissements</li>
          <li>Les personnes ayant opté pour le "régime réel" d'imposition</li>
          <li>Les entreprises dont le chiffre d'affaires dépasse 50 millions de F CFA</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Barème de l'IGS</h3>
        <p>
          Le calcul de l'IGS est basé sur le chiffre d'affaires annuel hors taxes du contribuable. Conformément à l'article C 40 paragraphe 1 de la loi n° 2024/020, le barème se compose de dix classes, chacune correspondant à une fourchette spécifique de chiffre d'affaires, avec un montant d'impôt fixe à payer pour chaque classe.
        </p>
        <p className="font-semibold mt-4 mb-2">Barème officiel :</p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Classe</th>
                <th className="border border-gray-300 px-4 py-2">Fourchette du chiffre d'affaires (F CFA)</th>
                <th className="border border-gray-300 px-4 py-2">Montant à payer (F CFA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">Moins de 500 000</td>
                <td className="border border-gray-300 px-4 py-2">20 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">De 500 000 à 999 999</td>
                <td className="border border-gray-300 px-4 py-2">30 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">3</td>
                <td className="border border-gray-300 px-4 py-2">De 1 000 000 à 1 499 999</td>
                <td className="border border-gray-300 px-4 py-2">40 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">4</td>
                <td className="border border-gray-300 px-4 py-2">De 1 500 000 à 1 999 999</td>
                <td className="border border-gray-300 px-4 py-2">50 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">5</td>
                <td className="border border-gray-300 px-4 py-2">De 2 000 000 à 2 499 999</td>
                <td className="border border-gray-300 px-4 py-2">60 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">6</td>
                <td className="border border-gray-300 px-4 py-2">De 2 500 000 à 4 999 999</td>
                <td className="border border-gray-300 px-4 py-2">150 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">7</td>
                <td className="border border-gray-300 px-4 py-2">De 5 000 000 à 9 999 999</td>
                <td className="border border-gray-300 px-4 py-2">300 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">8</td>
                <td className="border border-gray-300 px-4 py-2">De 10 000 000 à 19 999 999</td>
                <td className="border border-gray-300 px-4 py-2">500 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">9</td>
                <td className="border border-gray-300 px-4 py-2">De 20 000 000 à 29 999 999</td>
                <td className="border border-gray-300 px-4 py-2">1 000 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">10</td>
                <td className="border border-gray-300 px-4 py-2">De 30 000 000 à 49 999 999</td>
                <td className="border border-gray-300 px-4 py-2">2 000 000</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Continue with the rest of the IGS information */}
        <h3 className="text-xl font-semibold mt-6 mb-3">Dispositions spéciales</h3>
        <p>
          L'article C 40 paragraphe 2 de la loi n° 2024/020 prévoit une incitation notable pour les contribuables adhérant à un centre de gestion agréé. En effet, les taux de l'IGS stipulés dans le barème sont divisés par deux pour les membres de ces centres.
        </p>
        <p className="font-semibold mt-4 mb-2">Barème réduit pour les membres des centres de gestion agréés :</p>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Classe</th>
                <th className="border border-gray-300 px-4 py-2">Fourchette du chiffre d'affaires (F CFA)</th>
                <th className="border border-gray-300 px-4 py-2">Montant Standard (F CFA)</th>
                <th className="border border-gray-300 px-4 py-2">Montant Réduit (F CFA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">Moins de 500 000</td>
                <td className="border border-gray-300 px-4 py-2">20 000</td>
                <td className="border border-gray-300 px-4 py-2">10 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">De 500 000 à 999 999</td>
                <td className="border border-gray-300 px-4 py-2">30 000</td>
                <td className="border border-gray-300 px-4 py-2">15 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">3</td>
                <td className="border border-gray-300 px-4 py-2">De 1 000 000 à 1 499 999</td>
                <td className="border border-gray-300 px-4 py-2">40 000</td>
                <td className="border border-gray-300 px-4 py-2">20 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">4</td>
                <td className="border border-gray-300 px-4 py-2">De 1 500 000 à 1 999 999</td>
                <td className="border border-gray-300 px-4 py-2">50 000</td>
                <td className="border border-gray-300 px-4 py-2">25 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">5</td>
                <td className="border border-gray-300 px-4 py-2">De 2 000 000 à 2 499 999</td>
                <td className="border border-gray-300 px-4 py-2">60 000</td>
                <td className="border border-gray-300 px-4 py-2">30 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">6</td>
                <td className="border border-gray-300 px-4 py-2">De 2 500 000 à 4 999 999</td>
                <td className="border border-gray-300 px-4 py-2">150 000</td>
                <td className="border border-gray-300 px-4 py-2">75 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">7</td>
                <td className="border border-gray-300 px-4 py-2">De 5 000 000 à 9 999 999</td>
                <td className="border border-gray-300 px-4 py-2">300 000</td>
                <td className="border border-gray-300 px-4 py-2">150 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">8</td>
                <td className="border border-gray-300 px-4 py-2">De 10 000 000 à 19 999 999</td>
                <td className="border border-gray-300 px-4 py-2">500 000</td>
                <td className="border border-gray-300 px-4 py-2">250 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">9</td>
                <td className="border border-gray-300 px-4 py-2">De 20 000 000 à 29 999 999</td>
                <td className="border border-gray-300 px-4 py-2">1 000 000</td>
                <td className="border border-gray-300 px-4 py-2">500 000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">10</td>
                <td className="border border-gray-300 px-4 py-2">De 30 000 000 à 49 999 999</td>
                <td className="border border-gray-300 px-4 py-2">2 000 000</td>
                <td className="border border-gray-300 px-4 py-2">1 000 000</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Cas particuliers</h3>
        <p>
          Pour les activités de vente de boissons non alcoolisées, la contribution des licences est égale à une (01) fois le montant de l'impôt général synthétique applicable en fonction de leur tranche de chiffre d'affaires.
        </p>
        <p className="mt-2">
          Pour les activités de vente de boissons alcoolisées, d'armes à feu, de munitions, d'explosifs et de jeux de hasard, la contribution des licences est égale à deux (02) fois le montant de l'impôt général synthétique applicable en fonction de leur tranche de chiffre d'affaires.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Exonérations et options</h3>
        <ul className="list-disc pl-5 mb-4">
          <li>Les entreprises relevant du régime de l'IGS bénéficient d'une exonération de cet impôt pour leur première année civile d'activité.</li>
          <li>Les contribuables qui remplissent les conditions pour le régime de l'IGS ont la possibilité de choisir volontairement le "régime réel" d'imposition à la place.</li>
          <li>Pour exercer cette option, les contribuables doivent en faire la demande formellement avant le 1er novembre de chaque année, et le choix prendra effet le 1er janvier de l'année suivante.</li>
          <li>Une fois choisi, le "régime réel" est irrévocable pour une période de trois exercices fiscaux consécutifs.</li>
        </ul>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Procédures de déclaration et de paiement</h3>
        <p>
          Tout contribuable soumis à l'IGS est légalement tenu de souscrire une déclaration détaillée de ses revenus perçus au cours de l'année fiscale précédente. Cette déclaration doit être déposée au plus tard le 15 juin de chaque année au centre des impôts compétent pour son lieu d'imposition.
        </p>
        <p className="mt-2">La déclaration et le paiement doivent être effectués :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Exclusivement en ligne</li>
          <li>Exclusivement dans les nouveaux "centres de fiscalité locale et de particuliers" (remplaçant les anciens centres divisionnaires)</li>
        </ul>
        <p>
          L'Impôt Général Synthétique lui-même est acquitté sur une base trimestrielle. Ces paiements trimestriels doivent être effectués selon le calendrier d'échéances suivant :
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li>1er Trimestre (1er janvier au 31 mars) : Paiement exigible avant le 15 février.</li>
          <li>2ème Trimestre (1er avril au 30 juin) : Paiement exigible avant le 15 mai.</li>
          <li>3ème Trimestre (1er juillet au 30 septembre) : Paiement exigible avant le 15 août.</li>
          <li>4ème Trimestre (1er octobre au 31 décembre) : Paiement exigible avant le 15 novembre.</li>
        </ul>
        <p>
          Par ailleurs, pour les personnes physiques soumises à l'IGS, une déclaration annuelle de revenus de particulier doit être déposée au plus tard le 31 Mars.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Obligations comptables</h3>
        <p>
          Les contribuables réalisant un chiffre d'affaires entre 10 et 50 millions F CFA doivent tenir une comptabilité selon le "système minimal de trésorerie".
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Sanctions et pénalités</h3>
        <p>
          Le non-règlement des sommes dues au titre de l'IGS dans les délais trimestriels prescrits entraîne une pénalité de cinquante pour cent (50 %) du montant de l'impôt exigible. En plus de la pénalité financière, le non-paiement de l'IGS dans les délais prévus entraîne la fermeture d'office et immédiate de l'établissement ou des établissements du contribuable défaillant.
        </p>
        <p className="mt-2">
          Les contribuables relevant du régime de l'IGS qui sont légalement tenus de tenir une comptabilité conforme au Système Comptable Ouest Africain (SYSCOA) et qui ne le font pas s'exposent à la fermeture de leur établissement et à une amende fiscale d'un million (1 000 000) de francs CFA.
        </p>
        <p className="mt-2">
          Si l'administration fiscale constate que le chiffre d'affaires annuel d'un contribuable soumis à l'IGS a dépassé 50 000 000 de F CFA, ce contribuable sera automatiquement exclu du régime de l'IGS et soumis à la patente et au "régime réel" d'imposition.
        </p>
        
        <h3 className="text-xl font-semibold mt-6 mb-3">Conclusion</h3>
        <p>
          L'Impôt Général Synthétique représente une évolution notable dans la fiscalité des petites entreprises au Cameroun pour l'année 2025. Il vise à simplifier le système fiscal en remplaçant l'Impôt Libératoire et le régime simplifié par une taxe unique et forfaitaire basée sur le chiffre d'affaires annuel inférieur à 50 millions de F CFA.
        </p>
        <p className="mt-2">Pour les entreprises, ce nouveau régime présente :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>L'avantage d'une simplification administrative (regroupement de plusieurs taxes en une seule)</li>
          <li>Une prévisibilité accrue du montant d'impôt à payer</li>
          <li>Des incitations fiscales pour les membres des centres de gestion agréés</li>
          <li>Des obligations de déclaration et de paiement électroniques qui nécessitent un accès à l'infrastructure numérique</li>
        </ul>
        <p className="mt-2">Il est recommandé aux contribuables de :</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Évaluer avec précision leur chiffre d'affaires annuel</li>
          <li>Respecter scrupuleusement les délais de déclaration annuelle et de paiement trimestriel</li>
          <li>Utiliser le système de déclaration et de paiement électronique</li>
          <li>Envisager l'adhésion à un Centre de Gestion Agréé pour bénéficier de taux réduits</li>
          <li>Se tenir informé des mises à jour éventuelles de la Direction Générale des Impôts</li>
        </ul>
      </div>
    </div>
  );
};

export default IGSInformation;
