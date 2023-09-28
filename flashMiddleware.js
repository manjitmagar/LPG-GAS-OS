function flashMiddleware(req, res, next) {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next();
}

module.exports = flashMiddleware;