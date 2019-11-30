const express = require('express');
const { check } = require('express-validator');
const saleController = require('../controllers/sale');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/index',
    saleController.index);

router.get('/dashboard',
    authMiddleware.isAuth,
    saleController.dashboard);

router.get('/new',
    authMiddleware.isAuth,
    saleController.new);

router.post('/create',
    authMiddleware.isAuth,
    [
        check('typeOfProperty', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Maison', 'Appartement', 'Commerce', 'Terrain'])
            .trim(),
        check('transaction', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Vente', 'Location'])
            .trim(),
        check('address', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isLength({ min: 8 })
            .trim(),
        check('city', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Oran', 'Sidi Bel Abbes', 'Telemcen', 'Mascara'])
            .trim(),
        check('isOwner', 'Valeur invalide !')
            .not().isEmpty().isBoolean()
            .trim(),
        check('relationshipWithOwner', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Famille', 'Ami', 'Voisin', 'Collegue', 'Site annonce particulier', 'Pancarte', 'Autre'])
            .trim(),
        check('ownerFullName', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isLength({ min: 8 })
            .trim(),
        check('ownerPhone', 'Valeur invalide !')
            .not().isEmpty().isInt()
            .isLength({ min: 12, max: 12 })
            .trim(),
        check('ownersAgreement', 'Valeur invalide !')
            .not().isEmpty().isBoolean()
            .trim(),
    ],
    saleController.create);

router.get('/show/:id',
    saleController.show);

router.get('/edit/:id',
    authMiddleware.isAuth,
    saleController.edit);

router.post('/update',
    authMiddleware.isAuth,
    [
        check('typeOfProperty', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Maison', 'Appartement', 'Commerce', 'Terrain'])
            .trim(),
        check('transaction', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Vente', 'Location'])
            .trim(),
        check('address', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isLength({ min: 8 })
            .trim(),
        check('city', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Oran', 'Sidi Bel Abbes', 'Telemcen', 'Mascara'])
            .trim(),
        check('isOwner', 'Valeur invalide !')
            .not().isEmpty().isBoolean()
            .trim(),
        check('relationshipWithOwner', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isIn(['Famille', 'Ami', 'Voisin', 'Collegue', 'Site annonce particulier', 'Pancarte', 'Autre'])
            .trim(),
        check('ownerFullName', 'Valeur invalide !')
            .not().isEmpty().isString()
            .isLength({ min: 8 })
            .trim(),
        check('ownerPhone', 'Valeur invalide !')
            .not().isEmpty().isInt()
            .isLength({ min: 12, max: 12 })
            .trim(),
        check('ownersAgreement', 'Valeur invalide !')
            .not().isEmpty().isBoolean()
            .trim(),
    ],
    saleController.update);

router.post('/destroy',
    authMiddleware.isAuth,
    saleController.destroy);

module.exports = router;
