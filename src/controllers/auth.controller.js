import * as authService from '../services/auth.service.js';

export async function register(req, res) {
    try {
        const result = await authService.register(req.body);

        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error(error);

        if(error.code == 'ER_DUP_ENTRY') {
            if(error.message.includes('username')) {
                return res.status(400).json({
                    errors: {
                        username: ['Login jest już zajęty.']
                    }
                });
            }

            if(error.message.includes('email')) {
                return res.status(400).json({
                    errors: {
                        email: ['Adres email jest już zajęty.']
                    }
                });
            }
        }

        return res.status(500).json({ message: 'Wewnętrzny błąd serwera' });
    }
}

export async function login(req, res) {
    try {
        const result = await authService.login(req.body);

        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
    }
}

export async function me(req, res) {
    try {
        const result = await authService.me(req.user.id);

        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: 'Wewnętrzny błąd serwera.' });
    }
}

export async function logout(req, res) {
    try {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).json({ message: 'Brak refresh token.' })
        }

        const result = await authService.logout(refreshToken);
        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Wystąpił błąd serwera.' })
    }
}

export async function refresh(req, res) {
    try {
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).json({ message: 'Brak refresh token.' });
        }

        const result = await authService.refresh(refreshToken);

        return res.status(result.status).json(result.data);
    } catch (error) {
        console.error(error);
        
        return res.status(500).json({ message: 'Wystąpił błąd serwera.' });
    }
}