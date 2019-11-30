/* eslint-disable prefer-const */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prefer-destructuring */
const { validationResult } = require('express-validator');
const chalk = require('chalk');
const Sale = require('../models/sale');

exports.index = async (req, res, next) => {
    try {
        const ITEMS_PER_PAGE = 24;
        const page = +req.query.page || 1;

        const totalSales = await Sale.find().countDocuments();

        const sales = await Sale.find({ $or: [{ state: 'pending' }, { state: 'confirmed' }] })
            .select('typeOfProperty transaction state city created')
            .sort({ created: 'desc' })
            .limit(ITEMS_PER_PAGE)
            .skip((page - 1) * ITEMS_PER_PAGE);

        res.render('sale/index', {
            ITEMS_PER_PAGE,
            totalSales,
            sales,
            pageTitle: 'Sale_Index',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalSales,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalSales / ITEMS_PER_PAGE),
        });
    } catch (err) {
        console.log(`${chalk.red.bold('SALE Index Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.dashboard = async (req, res, next) => {
    try {
        const ITEMS_PER_PAGE = 8;
        const userId = req.user._id;
        const page = +req.query.page || 1;

        const totalSales = await Sale.find({ userId }).countDocuments();

        const sales = await Sale.find({ userId })
            .select('_id typeOfProperty transaction city state created')
            .sort({ created: 'desc' })
            .limit(ITEMS_PER_PAGE)
            .skip((page - 1) * ITEMS_PER_PAGE);

        res.render('sale/dashboard', {
            ITEMS_PER_PAGE,
            sales,
            totalSales,
            pageTitle: 'My_Sale',
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalSales,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalSales / ITEMS_PER_PAGE),
        });
    } catch (err) {
        console.log(`${chalk.red.bold('SALE Index Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.new = async (req, res, next) => {
    try {
        const saleLength = await Sale.countDocuments({ userId: req.user._id });

        res.render('sale/form', {
            pageTitle: 'New_Sale',
            editing: false,
            hasError: false,
            saleLength,
            typeOfPropertySelects: [
                { value: 'Maison', name: 'Maison' },
                { value: 'Appartement', name: 'Appartement' },
                { value: 'Commerce', name: 'Commerce' },
                { value: 'Terrain', name: 'Terrain' },
            ],
            citySelects: [
                { value: 'Oran', name: 'Oran' },
                { value: 'Sidi Bel Abbes', name: 'Sidi Bel Abbes' },
                { value: 'Telemcen', name: 'Telemcen' },
                { value: 'Mascara', name: 'Mascara' },
            ],
            relationshipWithOwnerSelects: [
                { value: 'Famille', name: 'Famille' },
                { value: 'Ami', name: 'Ami' },
                { value: 'Voisin', name: 'Voisin' },
                { value: 'Collegue', name: 'Collegue' },
                { value: 'Site annonce particulier', name: "Site d'annonce particulier" },
                { value: 'Pancarte', name: 'Pancarte' },
                { value: 'Autre', name: 'Autre' },
            ],
            validationErrors: [],
        });
    } catch (err) {
        console.log(`${chalk.red.bold('SALE New Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const {
            typeOfProperty,
            transaction,
            address,
            city,
            isOwner,
            relationshipWithOwner,
            ownerFullName,
            ownerPhone,
            ownersAgreement,
            moreInformation,
        } = req.body;

        const saleLength = await Sale.countDocuments({ userId: req.user._id });
        let isAgree;
        if (req.body.agreeTermsCondition) { isAgree = true; } else { isAgree = false; }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('sale/form', {
                pageTitle: 'New_Sale',
                editing: false,
                hasError: true,
                saleLength,
                sale: {
                    typeOfProperty,
                    transaction,
                    address,
                    city,
                    isOwner,
                    relationshipWithOwner,
                    ownerFullName,
                    ownerPhone,
                    ownersAgreement,
                    moreInformation,
                    isAgree,
                },
                typeOfPropertySelects: [
                    { value: 'Maison', name: 'Maison' },
                    { value: 'Appartement', name: 'Appartement' },
                    { value: 'Commerce', name: 'Commerce' },
                    { value: 'Terrain', name: 'Terrain' },
                ],
                citySelects: [
                    { value: 'Oran', name: 'Oran' },
                    { value: 'Sidi Bel Abbes', name: 'Sidi Bel Abbes' },
                    { value: 'Telemcen', name: 'Telemcen' },
                    { value: 'Mascara', name: 'Mascara' },
                ],
                relationshipWithOwnerSelects: [
                    { value: 'Famille', name: 'Famille' },
                    { value: 'Ami', name: 'Ami' },
                    { value: 'Voisin', name: 'Voisin' },
                    { value: 'Collegue', name: 'Collegue' },
                    { value: 'Site annonce particulier', name: "Site d'annonce particulier" },
                    { value: 'Pancarte', name: 'Pancarte' },
                    { value: 'Autre', name: 'Autre' },
                ],
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        if (saleLength >= 3 && !req.user.isProfessional) {
            return res.redirect('/sale/new');
        }

        if (!isAgree) {
            req.flash('error', "Vous devriez acceptez les conditions d'utilisation pour pouvoir poster un bien");
            return res.status(422).render('sale/form', {
                pageTitle: 'New_Sale',
                editing: false,
                hasError: true,
                saleLength,
                sale: {
                    typeOfProperty,
                    transaction,
                    address,
                    city,
                    isOwner,
                    relationshipWithOwner,
                    ownerFullName,
                    ownerPhone,
                    ownersAgreement,
                    moreInformation,
                    isAgree,
                },
                typeOfPropertySelects: [
                    { value: 'Maison', name: 'Maison' },
                    { value: 'Appartement', name: 'Appartement' },
                    { value: 'Commerce', name: 'Commerce' },
                    { value: 'Terrain', name: 'Terrain' },
                ],
                citySelects: [
                    { value: 'Oran', name: 'Oran' },
                    { value: 'Sidi Bel Abbes', name: 'Sidi Bel Abbes' },
                    { value: 'Telemcen', name: 'Telemcen' },
                    { value: 'Mascara', name: 'Mascara' },
                ],
                relationshipWithOwnerSelects: [
                    { value: 'Famille', name: 'Famille' },
                    { value: 'Ami', name: 'Ami' },
                    { value: 'Voisin', name: 'Voisin' },
                    { value: 'Collegue', name: 'Collegue' },
                    { value: 'Site annonce particulier', name: "Site d'annonce particulier" },
                    { value: 'Pancarte', name: 'Pancarte' },
                    { value: 'Autre', name: 'Autre' },
                ],
                validationErrors: [],
            });
        }

        const sale = new Sale({
            typeOfProperty,
            transaction,
            address,
            city,
            isOwner,
            relationshipWithOwner,
            ownerFullName,
            ownerPhone,
            moreInformation,
            userId: req.user,
        });

        await sale.save();
        req.flash('success', 'Votre bien a été ajouter avec success');
        res.redirect('/sale/dashboard');
    } catch (err) {
        console.log(`${chalk.red.bold('SALE Create Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.show = async (req, res, next) => {
    try {
        const sale = await Sale.findById(req.params.id);
        res.render('sale/show', {
            sale,
            pageTitle: 'Sale_Detail',
        });
    } catch (err) {
        console.log(`${chalk.red.bold('SALE Show Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.edit = async (req, res, next) => {
    try {
        const editMode = req.query.edit;
        if (!editMode) {
            return res.redirect('/sale/dashboard');
        }

        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            req.flash('error', "Cette annonce n'existe pas dans la base de donnée");
            return res.redirect('/sale/dashboard');
        }
        if (sale.userId.toString() !== req.user._id.toString()) {
            req.flash('error', "Vous n'êtes pas propriétaire de cette annonce");
            return res.redirect('/sale/dashboard');
        }

        res.render('sale/form', {
            sale,
            pageTitle: 'Edit_Sale',
            editing: true,
            hasError: false,
            errorsMessage: null,
            validationErrors: [],
            typeOfPropertySelects: [
                { value: 'Maison', name: 'Maison' },
                { value: 'Appartement', name: 'Appartement' },
                { value: 'Commerce', name: 'Commerce' },
                { value: 'Terrain', name: 'Terrain' },
            ],
            citySelects: [
                { value: 'Oran', name: 'Oran' },
                { value: 'Sidi Bel Abbes', name: 'Sidi Bel Abbes' },
                { value: 'Telemcen', name: 'Telemcen' },
                { value: 'Mascara', name: 'Mascara' },
            ],
            relationshipWithOwnerSelects: [
                { value: 'Famille', name: 'Famille' },
                { value: 'Ami', name: 'Ami' },
                { value: 'Voisin', name: 'Voisin' },
                { value: 'Collegue', name: 'Collegue' },
                { value: 'Site annonce particulier', name: "Site d'annonce particulier" },
                { value: 'Pancarte', name: 'Pancarte' },
                { value: 'Autre', name: 'Autre' },
            ],
        });
    } catch (err) {
        console.log(`${chalk.red.bold('SALE Edit Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const {
            saleId,
            typeOfProperty,
            transaction,
            address,
            city,
            isOwner,
            relationshipWithOwner,
            ownerFullName,
            ownerPhone,
            ownersAgreement,
            moreInformation,
        } = req.body;

        let isAgree;
        if (req.body.agreeTermsCondition) { isAgree = true; } else { isAgree = false; }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('sale/form', {
                pageTitle: 'Edit_Sale',
                editing: true,
                hasError: true,
                sale: {
                    typeOfProperty,
                    transaction,
                    address,
                    city,
                    isOwner,
                    relationshipWithOwner,
                    ownerFullName,
                    ownerPhone,
                    ownersAgreement,
                    moreInformation,
                    isAgree,
                    _id: saleId,
                },
                typeOfPropertySelects: [
                    { value: 'Maison', name: 'Maison' },
                    { value: 'Appartement', name: 'Appartement' },
                    { value: 'Commerce', name: 'Commerce' },
                    { value: 'Terrain', name: 'Terrain' },
                ],
                citySelects: [
                    { value: 'Oran', name: 'Oran' },
                    { value: 'Sidi Bel Abbes', name: 'Sidi Bel Abbes' },
                    { value: 'Telemcen', name: 'Telemcen' },
                    { value: 'Mascara', name: 'Mascara' },
                ],
                relationshipWithOwnerSelects: [
                    { value: 'Famille', name: 'Famille' },
                    { value: 'Ami', name: 'Ami' },
                    { value: 'Voisin', name: 'Voisin' },
                    { value: 'Collegue', name: 'Collegue' },
                    { value: 'Site annonce particulier', name: "Site d'annonce particulier" },
                    { value: 'Pancarte', name: 'Pancarte' },
                    { value: 'Autre', name: 'Autre' },
                ],
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        const sale = await Sale.findById(saleId);
        if (!sale) {
            req.flash('error', "Cette annonce n'existe pas dans la base de donnée");
            return res.redirect('/sale/dashboard');
        }
        if (sale.userId.toString() !== req.user._id.toString()) {
            req.flash('error', "Vous n'êtes pas propriétaire de cette annonce");
            return res.redirect('/sale/dashboard');
        }
        if (!isAgree) {
            return res.status(422).render('sale/form', {
                pageTitle: 'Edit_Sale',
                editing: true,
                hasError: true,
                errorFM: "Vous devriez acceptez les conditions d'utilisation pour pouvoir poster un bien",
                sale: {
                    typeOfProperty,
                    transaction,
                    address,
                    city,
                    isOwner,
                    relationshipWithOwner,
                    ownerFullName,
                    ownerPhone,
                    ownersAgreement,
                    moreInformation,
                    isAgree,
                    _id: saleId,
                },
                typeOfPropertySelects: [
                    { value: 'Maison', name: 'Maison' },
                    { value: 'Appartement', name: 'Appartement' },
                    { value: 'Commerce', name: 'Commerce' },
                    { value: 'Terrain', name: 'Terrain' },
                ],
                citySelects: [
                    { value: 'Oran', name: 'Oran' },
                    { value: 'Sidi Bel Abbes', name: 'Sidi Bel Abbes' },
                    { value: 'Telemcen', name: 'Telemcen' },
                    { value: 'Mascara', name: 'Mascara' },
                ],
                relationshipWithOwnerSelects: [
                    { value: 'Famille', name: 'Famille' },
                    { value: 'Ami', name: 'Ami' },
                    { value: 'Voisin', name: 'Voisin' },
                    { value: 'Collegue', name: 'Collegue' },
                    { value: 'Site annonce particulier', name: "Site d'annonce particulier" },
                    { value: 'Pancarte', name: 'Pancarte' },
                    { value: 'Autre', name: 'Autre' },
                ],
                validationErrors: [],
            });
        }

        sale.typeOfProperty = typeOfProperty;
        sale.transaction = transaction;
        sale.address = address;
        sale.city = city;
        sale.isOwner = isOwner;
        sale.relationshipWithOwner = relationshipWithOwner;
        sale.ownerFullName = ownerFullName;
        sale.ownerPhone = ownerPhone;
        sale.moreInformation = moreInformation;

        await sale.save();
        req.flash('success', 'Votre Annonce a été modifier avec success');
        res.redirect('/sale/dashboard');
    } catch (err) {
        console.log(`${chalk.red.bold('SALE Update Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.destroy = async (req, res, next) => {
    try {
        const sale = await Sale.findById({ _id: req.body.saleId, userId: req.user._id });
        if (!sale) {
            req.flash('error', "Cette annonce n'existe pas dans la base de donnée");
            return res.redirect('/sale/dashboard');
        }
        if (sale.userId.toString() !== req.user._id.toString()) {
            req.flash('error', "Vous n'êtes pas propriétaire de cette annonce");
            return res.redirect('/sale/dashboard');
        }

        await sale.deleteOne();
        req.flash('success', 'Votre Annonce a été supprimer avec success');
        res.redirect('/sale/dashboard');
    } catch (err) {
        console.log(`${chalk.red.bold('SALE Destroy Controller ERROR:')} ${chalk.red.bold(err)}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
