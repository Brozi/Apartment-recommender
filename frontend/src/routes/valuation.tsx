import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/valuation")({
  component: ValuationPage,
});

function ValuationPage() {
  return <p className="text-paragraph">Valuation</p>;
}
