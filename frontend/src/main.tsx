import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./app/App";
import { SiteLayout } from "./app/SiteLayout";
import { ProjectsPage } from "./app/pages/ProjectsPage";
import { ProjectDetailPage } from "./app/pages/ProjectDetailPage";
import { NotFoundPage } from "./app/pages/NotFoundPage";
import { BlogPage } from "./app/pages/BlogPage";
import "./styles/index.css";
import "./styles/homepage.css";
import "./styles/projects.css";

const router = createBrowserRouter([{
  element: <SiteLayout />,
  children: [
    { path: "/", element: <App /> },
    { path: "/projects", element: <ProjectsPage /> },
    { path: "/projects/:slug", element: <ProjectDetailPage /> },
    { path: "/blog", element: <BlogPage /> },
    { path: "*", element: <NotFoundPage /> },
  ],
}]);

ReactDOM.createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
