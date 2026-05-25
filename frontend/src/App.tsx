import { createBrowserRouter, Navigate } from "react-router";
import { RouterProvider } from "react-router";

import RootLayout from "./layouts/root-layout";
import Home from "./pages/home";
import MapPage from "./pages/map-page";
import DashboardLayout from "./layouts/dashboard-layout";
import KpisPage from "./pages/kpis-page";
import { kpisLoader } from "./services/kpis-loader";
import GeoPage from "./pages/geo-page";
import SmartBuyerPage from "./pages/smart-buyer-page";
import ValuationPage from "./pages/valuation-page";
import ErrorPage from "./pages/error-page";
import { mapOffersLoader } from "./services/map-offers-loader";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "map",
        element: <MapPage />,
        loader: mapOffersLoader,
      },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="kpis" replace /> },
          {
            path: "kpis",
            element: <KpisPage />,
            loader: kpisLoader,
          },
          {
            path: "geography-and-distribution",
            element: <GeoPage />,
          },
          {
            path: "smart-buyer-insights",
            element: <SmartBuyerPage />,
          },
        ],
      },
      {
        path: "valuation",
        element: <ValuationPage />,
      },
      {
        path: "admin",
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
