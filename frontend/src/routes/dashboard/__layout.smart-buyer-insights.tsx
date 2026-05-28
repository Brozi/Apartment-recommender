import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/dashboard/__layout/smart-buyer-insights",
)({
  component: SmartBuyerInsightsPage,
});

function SmartBuyerInsightsPage() {
  return <p className="text-paragraph">Smart Buyer Insights</p>;
}
