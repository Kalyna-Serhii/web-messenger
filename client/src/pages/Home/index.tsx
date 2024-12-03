import { Button, Container, Typography, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {ALL_CHATS_ROUTE, HOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE} from "../../constants";
import { getCookie } from '../../utils/cookies';
import {logout} from "../../api/authApi.ts";

const Home = () => {
    const navigate = useNavigate();

    const isAuth = Boolean(getCookie('accessToken'));

    const handleLogout = async () => {
        try {
            await logout();

            navigate(HOME_ROUTE);
        } catch (error) {
            console.error("Error on exit:", error);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ textAlign: 'center', marginTop: 8 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome to our application!
                </Typography>
                {isAuth ? (
                    <Box>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ marginRight: 2 }}
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                        <Link to={ALL_CHATS_ROUTE} style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="primary">
                                All chats
                            </Button>
                        </Link>
                    </Box>
                ) : (
                    <>
                        <Typography variant="body1" sx={{ marginBottom: 4 }}>
                            Please log in or register to continue.
                        </Typography>
                        <Box>
                            <Link to={LOGIN_ROUTE} style={{ textDecoration: 'none', marginRight: 16 }}>
                                <Button variant="contained" color="primary">
                                    Login
                                </Button>
                            </Link>
                            <Link to={REGISTER_ROUTE} style={{ textDecoration: 'none', marginRight: 16 }}>
                                <Button variant="contained" color="primary">
                                    Register
                                </Button>
                            </Link>
                        </Box>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default Home;
