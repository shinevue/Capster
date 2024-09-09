import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App";
import "./index.css";
import { routes } from "./routes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // {
      //   path: "dashboard",
      //   element: <Dashboard />,
      // },
      // {
      //   path: "about",
      //   element: <About />,
      // },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <RouterProvider router={router} fallbackElement={<BigSpinner />} />
);
