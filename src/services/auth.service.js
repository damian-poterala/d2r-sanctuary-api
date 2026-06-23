import bcrypt from 'bcrypt';
import { findByUsername, findByEmail, createUser, updateLastLogin, saveRefreshToken, findById } from "../repositories/auth.repository.js";
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
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