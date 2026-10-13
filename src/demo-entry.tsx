import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
const router = getRouter();
await router.load();
createRoot(document).render(<RouterProvider router={router} />);
