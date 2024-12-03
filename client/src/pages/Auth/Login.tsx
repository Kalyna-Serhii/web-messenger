import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Box, Typography, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { login } from '../../api/authApi';
import {HOME_ROUTE} from "../../constants";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');

    const navigate = useNavigate();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            setEmailError('Please enter a valid email');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (emailError) {
            return;
        }
        try {
            const data = await login(email, password);

            localStorage.setItem('userId', data.userId);

            navigate(HOME_ROUTE)
        } catch (error: any) {
            setError(error.message);
        }
    };

    return (
        <Container maxWidth="sm">
            <Card sx={{ marginTop: 8, padding: 2 }}>
                <CardContent>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Login
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            label="Email"
                            variant="outlined"
                            value={email}
                            onChange={handleEmailChange}
                            error={!!emailError}
                            helperText={emailError}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        {error && <Typography color="error">{error}</Typography>}
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
                            Login
                        </Button>
                    </Box>
                    <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <Button variant="text" color="primary">
                                Don't have an account? Sign up
                            </Button>
                        </Link>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Login;
