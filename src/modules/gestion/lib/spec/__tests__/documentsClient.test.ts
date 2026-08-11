import { describe, it, expect } from "vitest";
import {
  DOC_ATTESTATION_CONFORMITE_FISCALE,
  DOC_ATTESTATION_IMMATRICULATION,
  extensionDepuisChemin,
  nomFichierTelechargement,
} from "../documentsClient";

describe("extensionDepuisChemin", () => {
  it("lit l'extension du chemin de stockage", () => {
    expect(extensionDepuisChemin("client-1/9f3a-1b2c.pdf")).toBe("pdf");
    expect(extensionDepuisChemin("client-1/9f3a-1b2c.DOCX")).toBe("docx");
  });

  it("retombe sur pdf quand le chemin n'a pas d'extension exploitable", () => {
    expect(extensionDepuisChemin("client-1/9f3a1b2c")).toBe("pdf");
    expect(extensionDepuisChemin("")).toBe("pdf");
  });

  it("refuse une extension que le bucket n'accepte pas", () => {
    // Le nom proposé ne doit pas annoncer un format que le stockage aurait rejeté.
    expect(extensionDepuisChemin("client-1/9f3a.exe")).toBe("pdf");
  });
});

describe("nomFichierTelechargement", () => {
  it("nomme le fichier d'après le libellé du document, pas d'après l'UUID stocké", () => {
    expect(
      nomFichierTelechargement(
        DOC_ATTESTATION_CONFORMITE_FISCALE,
        "9c1e/6b0f-4a21.pdf",
      ),
    ).toBe("Attestation de conformité fiscale.pdf");
  });

  it("conserve l'apostrophe et les accents", () => {
    expect(
      nomFichierTelechargement(DOC_ATTESTATION_IMMATRICULATION, "9c1e/6b0f.jpg"),
    ).toBe("Attestation d'immatriculation.jpg");
  });

  it("neutralise les caractères interdits dans un nom de fichier", () => {
    expect(nomFichierTelechargement("Avis 2026/2027", "x/y.pdf")).toBe(
      "Avis 2026 2027.pdf",
    );
    expect(nomFichierTelechargement('Reçu "T1" <urgent>', "x/y.pdf")).toBe(
      "Reçu T1 urgent.pdf",
    );
  });

  it("retombe sur un nom générique si le libellé est vide", () => {
    expect(nomFichierTelechargement("   ", "x/y.png")).toBe("Document.png");
  });
});
