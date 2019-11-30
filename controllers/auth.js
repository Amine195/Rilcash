/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const Sale = require('../models/sale');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.API_KEY_SENDGRID,
    },
}));

exports.home = async (req, res, next) => {
    try {
        const totalSales = await Sale.find().countDocuments();
        const sales = await Sale.find({ $or: [{ state: 'pending' }, { state: 'confirmed' }] })
            .select('typeOfProperty transaction state city created')
            .sort({ created: 'desc' })
            .limit(12);
        res.render('home', {
            totalSales,
            sales,
            pageTitle: 'Home',
        });
    } catch (err) {
        console.log(`Home Controller ERROR: ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getRegister = async (req, res) => {
    res.render('auth/register', {
        pageTitle: 'Register',
        oldInput: {
            familyName: '', firstName: '', phone: '', email: '',
        },
        validationErrors: [],
    });
};

exports.postRegister = async (req, res, next) => {
    try {
        const {
            familyName, firstName, phone, email, password,
        } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/register', {
                pageTitle: 'Register',
                oldInput: {
                    familyName, firstName, phone, email,
                },
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        const buffer = await crypto.randomBytes(3);
        const token = await buffer.toString('hex');
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            familyName,
            firstName,
            phone,
            email,
            password: hashedPassword,
            activeToken: token,
            activeTokenExpire: Date.now() + 3600000,
        });

        await user.save();
        req.flash('success', "Code d'activation envoyer");
        res.redirect('/active');
        transporter.sendMail({
            to: email,
            from: 'Rilcash_App',
            subject: 'Activation de compte',
            html: `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns:v="urn:schemas-microsoft-com:vml">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
                        <meta name="viewport" content="width=600,initial-scale = 2.3,user-scalable=no">
                        <link href='https://fonts.googleapis.com/css?family=Work+Sans:300,400,500,600,700' rel="stylesheet">
                        <link href='https://fonts.googleapis.com/css?family=Quicksand:300,400,700' rel="stylesheet">
                        <title>Rilcash</title>
                    </head>
                    <br><br>
                    <body class="respond" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
                        <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" class="bg_color">
                            <tr>
                                <td align="center">
                                    <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">
                                        <tr>
                                            <td align="center" style="color: #343434; font-size: 24px; font-family: Quicksand, Calibri, sans-serif; font-weight:700;letter-spacing: 3px; line-height: 35px;"
                                                class="main-header">
                                                <div style="line-height: 35px">
                                                    Bienvenue sur <span style="color: #3EBBC4;">Rilcash</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="center">
                                                <table border="0" width="40" align="center" cellpadding="0" cellspacing="0" bgcolor="eeeeee">
                                                    <tr>
                                                        <td height="2" style="font-size: 2px; line-height: 2px;">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td height="20" style="font-size: 20px; line-height: 20px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="left">
                                                <table border="0" width="590" align="center" cellpadding="0" cellspacing="0" class="container590">
                                                    <tr>
                                                        <td align="left" style="color: #888888; font-size: 16px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;">
                                                            <p style="line-height: 24px; margin-bottom:15px;">
                                                                Merci ${familyName} ${firstName},
                                                            </p>

                                                            <p style="line-height: 24px;margin-bottom:15px;">
                                                                Great news, you will now be the first to see exclusive previews of our latest collections, hear about news from the Abacus!
                                                                community and get the most up to date news in the world of fashion.
                                                            </p>

                                                            <p style="line-height: 24px; margin-bottom:20px;">
                                                                CODE D'ACTIVATION: <span style="color: #343434; font-size: 16px; font-weight: 700; letter-spacing: 1px; margin-left: 10px;">${token}</span>
                                                            </p>

                                                            <table border="0" align="center" width="180" cellpadding="0" cellspacing="0" bgcolor="5caad2" style="margin-bottom:20px;">
                                                                <tr>
                                                                    <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="color: #ffffff; font-size: 14px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 22px; letter-spacing: 2px;">
                                                                        <div style="line-height: 22px;">
                                                                            <a href="http://localhost:3000/active" style="color: #ffffff; text-decoration: none;">LIEN</a>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" class="bg_color">
                            <tr>
                                <td height="60" style="font-size: 60px; line-height: 60px;">&nbsp;</td>
                            </tr>
                        </table>
                    </body>
                </html>
        `,
        });
    } catch (err) {
        console.log(`Post Register ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        oldInput: {
            email: '', password: '',
        },
        validationErrors: [],
    });
};

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                oldInput: { email, password },
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                oldInput: { email, password },
                errorFM: 'Compte email inéxistant',
                validationErrors: [],
            });
        }
        if (!user.isActive) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                oldInput: { email, password },
                errorFM: 'Compte non active',
                validationErrors: [],
            });
        }

        const doMatch = await bcrypt.compare(password, user.password);
        if (!doMatch) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                errorFM: 'Mot de passe incorrect',
                oldInput: { email, password },
                validationErrors: [],
            });
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        await req.session.save();
        req.flash('success', `Bienvenue ${user.familyName} ${user.firstName} sur votre tableau de board`);
        res.redirect('/sale/dashboard');
    } catch (err) {
        console.log(`Post Register ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        await req.session.destroy();
        res.redirect('/');
    } catch (err) {
        console.log(`Logout ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getResend = (req, res) => {
    res.render('auth/resend', {
        pageTitle: 'Resend',
        email: '',
        validationErrors: [],
    });
};

exports.postResend = async (req, res, next) => {
    try {
        const { email } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/resend', {
                pageTitle: 'Resend',
                email,
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', "Cette adresse email n'existe pas");
            return res.redirect('/resend');
        }
        if (user.isActive) {
            req.flash('error', 'Cette adresse email est déja activer');
            return res.redirect('/login');
        }

        req.flash('success', "Code d'activation envoyer");
        res.redirect('/active');
        transporter.sendMail({
            to: email,
            from: 'Rilcash_App',
            subject: 'Activation de compte',
            html: `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns:v="urn:schemas-microsoft-com:vml">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
                        <meta name="viewport" content="width=600,initial-scale = 2.3,user-scalable=no">
                        <link href='https://fonts.googleapis.com/css?family=Work+Sans:300,400,500,600,700' rel="stylesheet">
                        <link href='https://fonts.googleapis.com/css?family=Quicksand:300,400,700' rel="stylesheet">
                        <title>Rilcash</title>
                    </head>
                    <br><br>
                    <body class="respond" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
                        <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" class="bg_color">
                            <tr>
                                <td align="center">
                                    <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">
                                        <tr>
                                            <td align="center" style="color: #343434; font-size: 24px; font-family: Quicksand, Calibri, sans-serif; font-weight:700;letter-spacing: 3px; line-height: 35px;"
                                                class="main-header">
                                                <div style="line-height: 35px">
                                                    Bienvenue sur <span style="color: #3EBBC4;">Rilcash</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="center">
                                                <table border="0" width="40" align="center" cellpadding="0" cellspacing="0" bgcolor="eeeeee">
                                                    <tr>
                                                        <td height="2" style="font-size: 2px; line-height: 2px;">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td height="20" style="font-size: 20px; line-height: 20px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="left">
                                                <table border="0" width="590" align="center" cellpadding="0" cellspacing="0" class="container590">
                                                    <tr>
                                                        <td align="left" style="color: #888888; font-size: 16px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;">
                                                            <p style="line-height: 24px; margin-bottom:15px;">
                                                                Merci ${user.familyName} ${user.firstName},
                                                            </p>

                                                            <p style="line-height: 24px;margin-bottom:15px;">
                                                                Great news, you will now be the first to see exclusive previews of our latest collections, hear about news from the Abacus!
                                                                community and get the most up to date news in the world of fashion.
                                                            </p>

                                                            <p style="line-height: 24px; margin-bottom:20px;">
                                                                CODE D'ACTIVATION: <span style="color: #343434; font-size: 16px; font-weight: 700; letter-spacing: 1px; margin-left: 10px;">${user.activeToken}</span>
                                                            </p>

                                                            <table border="0" align="center" width="180" cellpadding="0" cellspacing="0" bgcolor="5caad2" style="margin-bottom:20px;">
                                                                <tr>
                                                                    <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="color: #ffffff; font-size: 14px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 22px; letter-spacing: 2px;">
                                                                        <div style="line-height: 22px;">
                                                                            <a href="http://localhost:3000/active" style="color: #ffffff; text-decoration: none;">LIEN</a>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" class="bg_color">
                            <tr>
                                <td height="60" style="font-size: 60px; line-height: 60px;">&nbsp;</td>
                            </tr>
                        </table>
                    </body>
                </html>
        `,
        });
    } catch (err) {
        console.log(`Post Resend ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getActive = (req, res) => {
    res.render('auth/active', {
        pageTitle: 'Active',
        validationErrors: [],
    });
};

exports.postActive = async (req, res, next) => {
    try {
        const token = req.body.activeToken;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/active', {
                pageTitle: 'Active',
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        const user = await User.findOne({
            activeToken: token,
            activeTokenExpire: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error', 'Code invalide');
            return res.redirect('/active');
        }
        if (user.isActive) {
            req.flash('error', 'Cette adresse email est déja activer');
            return res.redirect('/active');
        }

        user.isActive = true;
        user.activeToken = undefined;
        user.activeTokenExpire = undefined;

        await user.save();
        req.flash('success', 'Compte Activé avec success');
        res.redirect('/login');
        transporter.sendMail({
            to: user.email,
            from: 'Rilcash_App',
            subject: 'Activation !',
            html: '<h2>Compte activer avec Success!</h2>',
        });
    } catch (err) {
        console.log(`Post Active ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getForgot = (req, res) => {
    res.render('auth/forgot', {
        pageTitle: 'Forgot',
        email: '',
        validationErrors: [],
    });
};

exports.postForgot = async (req, res, next) => {
    try {
        const { email } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/forgot', {
                pageTitle: 'Forgot',
                email,
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        const buffer = await crypto.randomBytes(32);
        const token = await buffer.toString('hex');

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', "Cette adresse email n'existe pas");
            return res.redirect('/forgot');
        }

        user.resetToken = token;
        user.resetTokenExpire = Date.now() + 3600000;

        await user.save();
        req.flash('success', 'Lien de récupération envoyer');
        res.redirect('/forgot');
        transporter.sendMail({
            to: email,
            from: 'Rilcash_App',
            subject: 'Mot de passe oublier',
            html: `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns:v="urn:schemas-microsoft-com:vml">
                    <head>
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;" />
                        <meta name="viewport" content="width=600,initial-scale = 2.3,user-scalable=no">
                        <link href='https://fonts.googleapis.com/css?family=Work+Sans:300,400,500,600,700' rel="stylesheet">
                        <link href='https://fonts.googleapis.com/css?family=Quicksand:300,400,700' rel="stylesheet">
                        <title>Rilcash</title>
                    </head>
                    <br><br>
                    <body class="respond" leftmargin="0" topmargin="0" marginwidth="0" marginheight="0">
                        <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" class="bg_color">
                            <tr>
                                <td align="center">
                                    <table border="0" align="center" width="590" cellpadding="0" cellspacing="0" class="container590">
                                        <tr>
                                            <td align="center" style="color: #343434; font-size: 24px; font-family: Quicksand, Calibri, sans-serif; font-weight:700;letter-spacing: 3px; line-height: 35px;"
                                                class="main-header">
                                                <div style="line-height: 35px">
                                                    Bienvenue sur <span style="color: #3EBBC4;">Rilcash</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="center">
                                                <table border="0" width="40" align="center" cellpadding="0" cellspacing="0" bgcolor="eeeeee">
                                                    <tr>
                                                        <td height="2" style="font-size: 2px; line-height: 2px;">&nbsp;</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td height="20" style="font-size: 20px; line-height: 20px;">&nbsp;</td>
                                        </tr>
                                        <tr>
                                            <td align="left">
                                                <table border="0" width="590" align="center" cellpadding="0" cellspacing="0" class="container590">
                                                    <tr>
                                                        <td align="left" style="color: #888888; font-size: 16px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 24px;">
                                                            <p style="line-height: 24px; margin-bottom:15px;">
                                                                Merci ${user.familyName} ${user.firstName},
                                                            </p>

                                                            <p style="line-height: 24px;margin-bottom:15px;">
                                                                Great news, you will now be the first to see exclusive previews of our latest collections, hear about news from the Abacus!
                                                                community and get the most up to date news in the world of fashion.
                                                            </p>

                                                            <table border="0" align="center" width="180" cellpadding="0" cellspacing="0" bgcolor="5caad2" style="margin-bottom:20px;">
                                                                <tr>
                                                                    <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                                                </tr>
                                                                <tr>
                                                                    <td align="center" style="color: #ffffff; font-size: 14px; font-family: 'Work Sans', Calibri, sans-serif; line-height: 22px; letter-spacing: 2px;">
                                                                        <div style="line-height: 22px;">
                                                                            <a href="http://localhost:3000/reset/${token}" style="color: #ffffff; text-decoration: none;">LIEN</a>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td height="10" style="font-size: 10px; line-height: 10px;">&nbsp;</td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <table border="0" width="100%" cellpadding="0" cellspacing="0" bgcolor="ffffff" class="bg_color">
                            <tr>
                                <td height="60" style="font-size: 60px; line-height: 60px;">&nbsp;</td>
                            </tr>
                        </table>
                    </body>
                </html>
        `,
        });
    } catch (err) {
        console.log(`Post Forgot ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getReset = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpire: { $gt: Date.now() },
        });
        res.render('auth/reset', {
            pageTitle: 'Reset',
            userId: user._id.toString(),
            passwordToken: token,
            validationErrors: [],
        });
    } catch (err) {
        console.log(`Get Reset ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postReset = async (req, res, next) => {
    try {
        const newPassword = req.body.password;
        const { userId, passwordToken } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const user = await User.find({
                resetToken: passwordToken,
                resetTokenExpire: { $gt: Date.now() },
            });
            return res.status(422).render('auth/reset', {
                pageTitle: 'Reset',
                userId: user._id,
                passwordToken,
                errorFM: '',
                errorVM: errors.mapped(),
                validationErrors: errors.array(),
            });
        }

        const user = await User.findOne({
            resetToken: passwordToken,
            resetTokenExpire: { $gt: Date.now() },
            _id: userId,
        });

        if (!user) {
            req.flash('error', 'Compte inéxistant !');
            return res.redirect('/reset/:token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;

        user.isActive = true;
        user.activeToken = undefined;
        user.activeTokenExpire = undefined;

        await user.save();
        req.flash('success', 'Rénitialisation avec success');
        res.redirect('/login');
        transporter.sendMail({
            to: user.email,
            from: 'Rilcash_App',
            subject: 'Réinitialisation !',
            html: '<h2>Mot de passe modifier avec Success!</h2>',
        });
    } catch (err) {
        console.log(`Post Reset ERROR: ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.sponsorship = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (req.user.email === email) {
            req.flash('error', 'Vous ne pouvez pas vous parrainez.');
            return res.redirect('/sale/dashboard');
        }

        if (req.user.godFather) {
            req.flash('error', 'Vous avez déja un parrain.');
            return res.redirect('/sale/dashboard');
        }

        const godfather = await User.findOne({ email });
        if (!godfather) {
            req.flash('error', "Cette adresse email n'existe pas");
            return res.redirect('/sale/dashboard');
        }

        req.user.godFather = godfather._id.toString();

        await req.user.save();
        req.flash('success', 'Votre parrain est enregistrer avec success');
        res.redirect('/sale/dashboard');
    } catch (err) {
        console.log(`Post Resend ERROR : ${err}`);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};
