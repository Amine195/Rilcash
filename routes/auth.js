/* eslint-disable import/newline-after-import */
/* eslint-disable newline-per-chained-call */
const express = require('express');
const { check } = require('express-validator');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/',
    authMiddleware.isNotAuth,
    authController.home);

router.get('/register',
    authMiddleware.isNotAuth,
    authController.getRegister);

router.post('/register',
    authMiddleware.isNotAuth,
    [
        check('familyName', 'Nom invalide')
            .not().isEmpty().isLength({ min: 4 }).trim(),
        check('firstName', 'Prénom invalide')
            .not().isEmpty().isLength({ min: 4 }).trim(),
        check('phone', 'Téléphone invalide')
            .not().isEmpty().isInt().isLength({ min: 12, max: 12 }).trim().withMessage('Numéro invalide')
            // eslint-disable-next-line no-unused-vars
            .custom((value, { req }) => User.findOne({ phone: value }).then((user) => {
                if (user) {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject(
                        `Numéro Tél " ${value} " Existe déja`,
                    );
                }
            })),
        check('email')
            .not().isEmpty().isEmail().trim().withMessage('Email invalide')
            // eslint-disable-next-line no-unused-vars
            .custom((value, { req }) => User.findOne({ email: value }).then((user) => {
                if (user) {
                    // eslint-disable-next-line prefer-promise-reject-errors
                    return Promise.reject(
                        `Email " ${value} " Existe déja`,
                    );
                }
            })),
        check('password')
            .isLength({ min: 8 }).isAlphanumeric().matches(/\d/).trim().withMessage('Mot de passe invalide')
            .custom((value, { req }) => {
                if (value !== req.body.confirmPassword) {
                    throw new Error('Réécrivez votre mot de passe');
                }
                return true;
            }),
        check('confirmPassword')
            .isLength({ min: 8 }).isAlphanumeric().matches(/\d/).trim().withMessage('Mot de passe invalide')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Mot de passe incorrect');
                }
                return true;
            }),
    ],
    authController.postRegister);

router.get('/login',
    authMiddleware.isNotAuth,
    authController.getLogin);

router.post('/login',
    authMiddleware.isNotAuth,
    [
        check('email', 'Email invalide')
            .not().isEmpty().isEmail().trim(),
        check('password', 'Mot de passe invalide')
            .isLength({ min: 8 }).isAlphanumeric().matches(/\d/).trim(),
    ],
    authController.postLogin);

router.post('/logout',
    authMiddleware.isAuth,
    authController.logout);

router.get('/resend',
    authMiddleware.isNotAuth,
    authController.getResend);

router.post('/resend',
    authMiddleware.isNotAuth,
    [
        check('email', 'Email invalide')
            .not().isEmpty().isEmail().trim(),
    ],
    authController.postResend);

router.get('/active',
    authMiddleware.isNotAuth,
    authController.getActive);

router.post('/active',
    authMiddleware.isNotAuth,
    [
        check('activeToken', 'Active code invalide')
            .isLength({ min: 6, max: 6 }).isAlphanumeric().matches(/\d/).trim(),
    ],
    authController.postActive);

router.get('/forgot',
    authMiddleware.isNotAuth,
    authController.getForgot);

router.post('/forgot',
    authMiddleware.isNotAuth,
    [
        check('email', 'Email invalide')
            .not().isEmpty().isEmail().trim(),
    ],
    authController.postForgot);

router.get('/reset/:token',
    authMiddleware.isNotAuth,
    authController.getReset);

router.post('/reset',
    authMiddleware.isNotAuth,
    [
        check('password')
            .isLength({ min: 8 }).isAlphanumeric().matches(/\d/).trim().withMessage('Mot de passe invalide')
            .custom((value, { req }) => {
                if (value !== req.body.confirmPassword) {
                    throw new Error('les deux mot de passe sont incompatible');
                }
                return true;
            }),
        check('confirmPassword')
            .isLength({ min: 8 }).isAlphanumeric().matches(/\d/).trim().withMessage('Mot de passe invalide')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Mot de passe incorrect');
                }
                return true;
            }),
    ],
    authController.postReset);

router.post('/sponsorship',
    authMiddleware.isAuth,
    authController.sponsorship);

module.exports = router;
