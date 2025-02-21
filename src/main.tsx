import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import App from "./App.tsx";
import "./index.css";
import { ErrorPage, Play2048 } from "./pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true, // 这个路由将匹配根路径
        element: <Navigate to="/play2048" replace />,
      },
      {
        path: "/play2048",
        element: <Play2048 />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
