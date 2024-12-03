import {HOME_ROUTE, ALL_CHATS_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE} from "../constants";
import Register from "../pages/Auth/Register";
import Login from "../pages/Auth/Login";
import Chats from "../pages/Chat/Chats.tsx";
import Index from "../pages/Home";

export const publicRoutes = [
    {
        path: HOME_ROUTE,
        Component: Index
    },
    {
        path: LOGIN_ROUTE,
        Component: Login
    },
    {
        path: REGISTER_ROUTE,
        Component: Register
    },
];

export const privateRoutes = [
    {
        path: ALL_CHATS_ROUTE,
        Component: Chats
    }
];
