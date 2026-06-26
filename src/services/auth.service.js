import bcrypt from 'bcrypt';

import { 
    findByUsername, 
    findByEmail, 
    createUser, 
    updateLastLogin, 
    saveRefreshToken, 
    findById, 
    deleteRefreshToken,
    findRefreshToken 
} from "../repositories/auth.repository.js";

import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/hash.js';

export async function register(data) {
    const usernameExist = await findByUsername(data.username);

    if(usernameExist) {
        return {
            status: 400,
            data: {
                errors: {
                    username: [
                        'Login jest już zajęty.'
                    ]
                }
            }
        };
    }

    const emailExist = await findByEmail(data.email);

    if(emailExist) {
        return {
            status: 400,
            data: {
                errors: {
                    email: [
                        'Adres email jest już zajęty.'
                    ]
                }
            }
        };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    
    const userId = await createUser({
        username: data.username,
        email: data.email,
        passwordHash
    });

    return {
        status: 201,
        data: {
            message: 'Konto zostało utworzone.',
            userId
        }
    };
}

export async function login(data) {
    const user = await findByUsername(data.username);

    if(!user) {
        return {
            status: 401,
            data: {
                errors: {
                    username: ['Nieprawidłowy login lub hasło.']
                }
            }
        };
    }

    const passwordValid = await bcrypt.compare(data.password, user.password_hash);

    if(!passwordValid) {
        return {
            status: 401,
            data: {
                errors: {
                    password: ['Nieprawidłowy login lub hasło.']
                }
            }
        };
    }

    await updateLastLogin(user.id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 *24 * 60 * 60 * 1000);

    await saveRefreshToken(user.id, refreshTokenHash, expiresAt);

    return {
        status: 200,
        data: {
            message: 'Logowanie poprawne.',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            }
        }
    }
}

export async function me(userId) {
    const user = await findById(userId);

    if(!user) {
        return {
            status: 401,
            data: { message: 'Użytkownik nie istnieje.' }
        }
    }

    return { status: 200, data: user };
}

export async function logout(refreshToken) {
    const refreshTokenHash = hashToken(refreshToken);
    await deleteRefreshToken(refreshTokenHash);

    return {
        status: 200,
        data: {
            message: 'Wylogowano pomyślnie.'
        }
    };
}

export async function refresh(refreshToken) {
    try {
        const payload = verifyRefreshToken(refreshToken);
        const refreshTokenHash = hashToken(refreshToken);
        const storedToken = await findRefreshToken(refreshTokenHash);

        if(!storedToken) {
            return { status: 401, data: { message: 'Refresh token jest nieprawidłowy.' } }
        }

        if(new Date(storedToken.expiresAt) < new Date()) {
            await deleteRefreshToken(refreshTokenHash);

            return { status: 401, data: { message: 'Refresh token wygasł.' } };
        }

        const user = await findById(payload.id);

        if(!user) {
            return { status: 401, data: { message: 'Użytkownik nie istnieje' } };
        }

        await deleteRefreshToken(refreshTokenHash);
        
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        const newRefreshTokenHash = hashToken(newRefreshToken);

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await saveRefreshToken(user.id, newRefreshTokenHash, expiresAt);

        return { status: 200, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } };
    } catch (error) {
        return { status: 401, data: { message: 'Refresh token jest nieprawidłowy.' } }
    }
}