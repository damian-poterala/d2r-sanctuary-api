import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.status(401).json({ message: 'Brak tokenu.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Nieprawidłowy token.' });
    }
}