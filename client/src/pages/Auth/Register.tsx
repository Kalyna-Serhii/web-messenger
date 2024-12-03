import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Box, Typography, Card, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { register } from '../../api/authApi';
import {HOME_ROUTE} from "../../constants";

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

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

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        validatePasswords(e.target.value, confirmPassword);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        validatePasswords(password, e.target.value);
    };

    const validatePasswords = (password: string, confirmPassword: string) => {
        if (password && confirmPassword && password !== confirmPassword) {
            setPasswordError('The passwords do not match');
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (emailError || passwordError) {
            return;
        }
        try {
            const data = await register(name, email, password);

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
                        Registration
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            label="Name"
                            variant="outlined"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
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
                            onChange={handlePasswordChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Confirm password"
                            type="password"
                            variant="outlined"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            error={!!passwordError}
                            helperText={passwordError}
                            fullWidth
                            margin="normal"
                            required
                        />
                        {error && <Typography color="error">{error}</Typography>}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ marginTop: 2 }}
                        >
                            Register
                        </Button>
                    </Box>
                    <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Button variant="text" color="primary">
                                Already have an account? Login
                            </Button>
                        </Link>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default Register;
