import pool from '../config/db.js';

export async function findByUsername(username) {
    const [rows] = await pool.execute(
        `
            SELECT * FROM users WHERE username = ? LIMIT 1
        `, 
        [username]
    );

    return rows[0] ?? null;
}

export async function findByEmail(email) {
    const [rows] = await pool.execute(
        `
            SELECT * FROM users WHERE email = ? LIMIT 1
        `,
        [email]
    );

    return rows[0] ?? null;
}

export async function createUser(user) {
    const [result] = await pool.execute(
        `
            INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)
        `,
        [
            user.username,
            user.email,
            user.passwordHash
        ]
    );

    return result.insertId;
}

export async function updateLastLogin(userId) {
    await pool.execute(
        `
            UPDATE users
            SET last_login_at = NOW()
            WHERE id = ?
        `,
        [userId]
    );
}

export async function saveRefreshToken(userId, tokenHash, expiresAt) {
    await pool.execute(
        `
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
            VALUES (?, ?, ?)
        `,
        [
            userId, tokenHash, expiresAt
        ]
    );
}

export async function findById(id) {
    const [rows] = await pool.execute(
        `
            SELECT id, username, email, role, last_login_at FROM users WHERE id = ? LIMIT 1
        `,
        [id]
    );

    return rows[0] ?? null;
}