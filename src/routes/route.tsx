import { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import LayoutDefault from "../Layout";


export const route: RouteObject[] = [
  {
    path: '/',
    element: <LayoutDefault />,
    children: [
      {
        path: '/',
        index: true,
        element: <Home />,
      },
      {
        path: 'login/oauth',
        element: <Login />
      }
    ]
  }
]
