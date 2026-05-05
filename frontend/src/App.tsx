import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router";

import RootLayout from "./layouts/root-layout";
import Home from "./pages/home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
