/**
 * Created by frederickmacgregor on 15/09/2016.
 */
exports.httpsEnforce = function requireHTTPS(req, res, next) {
    if (req.headers && req.headers.$wssp === "80") {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
};