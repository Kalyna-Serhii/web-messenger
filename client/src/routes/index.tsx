import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { publicRoutes, privateRoutes } from './routes';
import Home from '../pages/Home';
import {getCookie} from "../utils/cookies.ts";

const AppRoutes = () => {
    const isAuth = Boolean(getCookie('accessToken'));

    return (
        <Router>
            <Routes>
                 Main page
                <Route path="/" element={<Home />} />

                {publicRoutes.map(({ path, Component }) => (
                    <Route key={path} path={path} element={<Component />} />
                ))}

                {privateRoutes.map(({ path, Component }) =>
                    isAuth ? (
                        <Route key={path} path={path} element={<Component />} />
                    ) : (
                        <Route key={path} path={path} element={<Navigate to="/login" />} />
                    )
                )}

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
