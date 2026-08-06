import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import PatenteCalculator from "../PatenteCalculator";

describe("PatenteCalculator", () => {
  it("affiche le titre et le champ de saisie du chiffre d'affaires", () => {
    render(<PatenteCalculator />);
    expect(screen.getByText("Calculateur de Contribution des Patentes")).toBeInTheDocument();
    expect(screen.getByLabelText(/Chiffre d'affaires/i)).toBeInTheDocument();
  });

  it("calcule la patente minimale (plancher 141 500) pour un petit chiffre d'affaires", async () => {
    render(<PatenteCalculator />);
    const input = screen.getByLabelText(/Chiffre d'affaires/i);
    const button = screen.getByRole("button", { name: /Calculer la Patente/i });

    await userEvent.type(input, "1000000");
    await userEvent.click(button);

    // 1 000 000 * 0.00283 = 2 830, qui est inférieur au plancher de 141 500
    const elements = screen.getAllByText("141 500 F CFA");
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Plancher minimal légal de 141 500 F CFA appliqué/i)).toBeInTheDocument();
  });

  it("calcule la patente normale (0.283 %) pour un chiffre d'affaires intermédiaire", async () => {
    render(<PatenteCalculator />);
    const input = screen.getByLabelText(/Chiffre d'affaires/i);
    const button = screen.getByRole("button", { name: /Calculer la Patente/i });

    await userEvent.type(input, "100000000");
    await userEvent.click(button);

    // 100 000 000 * 0.00283 = 283 000 F CFA
    expect(screen.getByText("283 000 F CFA")).toBeInTheDocument();
  });

  it("plafonne la patente à 4 500 000 F CFA pour un grand chiffre d'affaires", async () => {
    render(<PatenteCalculator />);
    const input = screen.getByLabelText(/Chiffre d'affaires/i);
    const button = screen.getByRole("button", { name: /Calculer la Patente/i });

    await userEvent.type(input, "2000000000");
    await userEvent.click(button);

    // 2 000 000 000 * 0.00283 = 5 660 000 > 4 500 000 (plafond)
    const elements = screen.getAllByText("4 500 000 F CFA");
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Plafond maximal légal de 4 500 000 F CFA appliqué/i)).toBeInTheDocument();
  });
});
