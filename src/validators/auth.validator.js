import { body, validationResult } from 'express-validator';

export const registerValidator = [
    body('username').trim().notEmpty().withMessage('Login jest wymagany.').bail().isLength({ min: 3, max: 20 }).withMessage('Login musi mieć od 3 do 20 znaków'),
    body('email').trim().notEmpty().withMessage('Adres email jest wymagany.').bail().isEmail().withMessage('Niepoprawny adres email.'),
    body('password').notEmpty().withMessage('Hasło jest wymagane.').bail().isLength({ min: 8 }).withMessage('Hasło musi mieć minimum 8 znaków.'),
    (req, res, next) => {
        const result = validationResult(req);

        if(!result.isEmpty()) {
            const errors = {};

            result.array().forEach(error => {
                if(!errors[error.path]) {
                    errors[error.path] = [];
                }

                errors[error.path].push(error.msg);
            });

            return res.status(400).json({ errors });
        }

        next();
    }
];

export const loginValidator = [
    body('username').trim().notEmpty().withMessage('Login jest wymagany.'),
    body('password').trim().notEmpty().withMessage('Hasło jest wymagane.'),
    (req, res, next) => {
        const result = validationResult(req);

        if(!result.isEmpty()) {
            const errors = {};

            result.array().forEach(error => {
                if(!errors[error.path]) {
                    errors[error.path] = [];
                }

                errors[error.path].push(error.msg);
            });

            return res.status(400).json({ errors });
        }

        next();
    }
];