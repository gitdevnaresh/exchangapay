import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { GetToken } from '../../services/auth0Service';

interface DecodedToken {
    exp: number;
    // other properties from the token can be added here
}

export const useAuthSession = () => {
    const [loading, setLoading] = useState(false);

    const checkAuthStatus = async (): Promise<boolean> => {
        setLoading(true);
        try {
            const tokens = await GetToken();
            if (!tokens?.accessToken) {
                return false;
            }
            const decodedToken: DecodedToken = jwtDecode(tokens.accessToken);
            const isExpired = Date.now() >= decodedToken.exp * 1000;
            if (!isExpired) {
                return true; // Token is valid and not expired
            }
            if (!tokens.refreshToken) {
                return false;
            }
            return false;
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { checkAuthStatus, loading };
};