import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { ScrollToTop } from "@/lib/scroll-to-top";

import HomePage from "@/components/pages/HomePage";
import ProgramsPage from "@/components/pages/ProgramsPage";
import AboutPage from "@/components/pages/AboutPage";
import GetInvolvedPage from "@/components/pages/GetInvolvedPage";
import DigitalMarketplacePage from "@/components/pages/DigitalMarketplacePage";

function ErrorPage() {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Something went wrong.</h1>
    </div>
  );
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "programs", element: <ProgramsPage /> },
        { path: "about", element: <AboutPage /> },
        { path: "get-involved", element: <GetInvolvedPage /> },
        { path: "digital-marketplace", element: <DigitalMarketplacePage /> },
        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_NAME,
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
