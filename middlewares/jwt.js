require("dotenv").config();
const jwt = require('jsonwebtoken')
const maxAge = 10 * 24 * 60 * 60;


module.exports = {
    createToken: (id, name) => {

        return jwt.sign({ id, name }, process.env.JWT_SECRET_KEY, {
            expiresIn: maxAge
        })
    },
    verifyJwtToken: (req, res, next) => {

        const token = req.cookies.userjwt
        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
                if (err) {
                    console.log(err.message, 'jwt error');
                    res.redirect('/');
                } else {
                    console.log(decodedToken, 'decoded the token');
                    res.locals.activeUser = decodedToken
                    console.log('HELLFOEFFJJ')
                    next()
                }
            })
        } else {
            res.redirect('/noaccount')
            

        }
    },
    createTokenAdmin: (id, name) => {
        return jwt.sign({ id, name }, process.env.JWT_SECRET_KEY_ADMIN, {
            expiresIn: maxAge
        })
    },
    verifyJwtTokenAdmin: (req, res, next) => {

        const AdminToken = req.cookies.jwt
        if (AdminToken) {
            jwt.verify(AdminToken, process.env.JWT_SECRET_KEY_ADMIN, (err, decodedToken) => {
                if (err) {
                    console.log(err.message, 'jwt error');
                    res.redirect('/admin/adminlogin');
                } else {
                    console.log(decodedToken, 'decoded the token');
                    res.locals.activeUser = decodedToken
                    console.log('Admintokennnn')
                    next()
                }
            })
        } else {
            res.redirect('/admin/login');

        }
    },

}