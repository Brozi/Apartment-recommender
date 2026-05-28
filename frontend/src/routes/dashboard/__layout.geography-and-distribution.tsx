import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/dashboard/__layout/geography-and-distribution",
)({
  component: GeographyAndDistributionPage,
});

function GeographyAndDistributionPage() {
  return <p className="text-paragraph">Geography & Distribution</p>;
}
