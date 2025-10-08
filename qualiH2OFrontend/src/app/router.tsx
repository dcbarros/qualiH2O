import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import { RootLayout } from "./layout/RootLayout";
import { LoginPage } from "../features/pages/LoginPage";
import { NotFoundPage } from "./NotFoundPage";
import { DashboardPage } from "../features/pages/DashboardPage";
import { AnalisesListPage } from "../features/pages/AnalisesListPage";



export const router = createBrowserRouter([
  //Pública
  { path: "/login", element: <LoginPage /> },
  // Privadas
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/analises", element: <AnalisesListPage />},
        ]
      }
    ]
  },
  // Páginas de erro
  { path: "*", element: <NotFoundPage /> },
]);