

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const CallbackHandler = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const exchangeAttempted = useRef(false);

    useEffect(() => {
        const handleCallback = async () => {
            if (exchangeAttempted.current) return;
            
            exchangeAttempted.current = true;
            
            try {
                const params = new URLSearchParams(location.search);
                const code = params.get('code');
                
                if (!code) {
                    console.error('No code found in URL');
                    navigate('/login', { replace: true });
                    return;
                }

                // Add error logging
                console.log('Exchanging code:', code);
                
                const response = await api.post('/auth/exchange-code', { code });
                const { token, user } = response.data;

                if (!token || !user) {
                    throw new Error('Invalid response data');
                }

                console.log('Login successful, token received');
                await login(token, user);
                
                // Add a small delay before navigation
                setTimeout(() => {
                    navigate('/profile', { replace: true });
                }, 100);
                
            } catch (error) {
                console.error('Auth callback error:', error);
                // Add more specific error handling
                if (error.response?.status === 400) {
                    console.error('Invalid or expired code');
                }
                navigate('/login?error=auth_failed', { replace: true });
            }
        };

        handleCallback();
    }, [location.search, login, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-center">
                <div className="mb-4">Authenticating...</div>
                <div className="text-sm text-gray-500">Please wait while we complete your sign in</div>
            </div>
        </div>
    );
};

export default CallbackHandler;