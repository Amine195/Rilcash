exports.get404 = (req, res) => {
    res.status(404).render('404', {
        pageTitle: 'PageNotFound',
        isAuthenticated: req.session.isLoggedIn,
    });
};

exports.get500 = (req, res) => {
    res.status(500).render('500', {
        pageTitle: 'Error',
        isAuthenticated: req.session.isLoggedIn,
    });
};
