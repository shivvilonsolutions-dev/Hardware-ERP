import { createBrowserRouter } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import NewOrder from "@/pages/NewOrder";
import Process from "@/pages/Process";
import Reports from "@/pages/Reports";
import ProcessOrders from "@/pages/ProcessOrders";
import Party from "@/pages/Party";
import Report from "@/pages/Report";

import Inventory from "@/pages/Inventory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
  path: "/new-order",
  element: <NewOrder />,
 },
 {
  path: "/process",
  element: <ProcessOrders />,
},
{
  path: "/process/:orderId",
  element: <Process />,
},
{
  path: "/reports",
  element: <Reports />,
},
{
  path: "/report/:orderId",
  element: <Report />,
},
{
  path: "/party",
  element: <Party />,
},
{
  path: "/inventory",
  element: <Inventory />,
},
]);