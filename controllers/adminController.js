require("dotenv").config();
const { response } = require('express');
const fileUpload = require('express-fileupload');
const { render } = require('ejs');
const maxAge = 10 * 24 * 60 * 60;
const adminemail = process.env.ADMIN_ID;
const Adminpassword = process.env.PASSWORD;
const tokenCreate = require('../middlewares/jwt');
const models = require('../models/admin_M')


const credential = {
    email: adminemail,
    password: Adminpassword
}


module.exports = {
    login: (req, res) => {
        res.render('admin/adminLogin', { user: false })

    },
    checkAdminlogin: (req, res) => {
        console.log(req.body);
        if (req.body.email == credential.email && req.body.password == credential.password) {
            const AdminToken = tokenCreate.createTokenAdmin(req.body.email, req.body.password);
            console.log(AdminToken)
            res.cookie('jwt', AdminToken, { httponly: true, maxAge: maxAge * 1000 })
            res.send(true)
        } else {
            res.send(false)
        }
    },
    adminLogout: (req, res) => {
        res.cookie('jwt', '', { maxAge: 1 })
        res.redirect('/admin/login');
    },
    adminDashboard: (req, res) => {
        models.getDashboardDetails().then((countbox) => {
            console.log('ressssssssssr', countbox);
            res.render('admin/dashboard', { user: false, countbox: countbox })
        })
    },
    getUserdetails: (req, res) => {
        models.fetchUsers().then((userDetails) => {
            res.render('admin/customers', { user: false, userDetails: userDetails })
        })
    },
    blockUser: (req, res) => {
        let userId = req.params.id;
        let blockStatus = req.params.blockStatus;
        let statusChange = true;
        if (blockStatus == "true") {
            statusChange = false;
        }
        models.blockAccount(userId, statusChange).then((response) => {
            res.redirect('/admin/customers')
        })
    },
    categoryStatus: (req, res) => {
        let catId = req.params.id;
        let status = req.params.status;
        let statusChange = true;
        if (status == "true") {
            statusChange = false;
        }
        models.changecategoryStatus(catId, statusChange).then((response) => {
            res.redirect('/admin/category')

        })
    },
    addProduct: (req, res) => {
        models.getCategory().then((categoryList) => {
            res.render("admin/addproducts", { user: false, categoryList: categoryList })
        })
    },
    addProductDetails: (req, res) => {
        let image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename;
        }
        console.log(image)
        req.body.images = image;
        console.log(req.body)
        models.addProductDetails(req.body).then((response) => {
            console.log(response)
            res.redirect('/admin/productlist')
        })
    },
    addCategory: (req, res) => {
        req.body.status = true;

        models.addProductCategory(req.body).then((response) => {
            res.send(response)
            console.log("cat...resp,,,", response.acknowledged)
        })
    },
    getProduct: (req, res) => {
        models.getProductDetails().then((productDetails) => {
            res.render('admin/products', { user: false, productDetails: productDetails })
        })
    },
    deleteProduct: (req, res) => {
        let productId = req.params.id
        models.deleteProduct(productId).then((deleteResponse) => {
            res.redirect('/admin/productlist')
        })
    },
    fetchEditProduct: async (req, res) => {
        let product = await models.getProductData(req.params.id)
        console.log("pppppppppppepepepepe", product)
        res.render('admin/editproduct', { user: false, product: product })
    },
    categoryList: (req, res) => {
        models.getCategory().then((categoryList) => {

            res.render('admin/listcategory', { user: false, category: categoryList });
        })
    },
    editCategory: async (req, res) => {
        console.log("cat.............id", req.params.id)
        let category = await models.getCategoryone(req.params.id)
        res.json(category)
    },
    updateCategory: (req, res) => {
        models.updateCategory(req.params.id, req.body).then(() => {
            res.send(true)
        })
    },
    updateProduct: (req, res) => {
         console.log("asfkjsdfa.....asfasf........af",req.body)
        // console.log("asfkjsdfa.....asfasf........af",req.files)
        let image = []
        for (let i = 0; i < req.files.length; i++) {
            image[i] = req.files[i].filename;
        }
        console.log(image)
        req.body.images = image;
        console.log(req.body)
        models.updateProduct(req.params.id, req.body).then(() => {
            res.redirect('/admin/productlist')
        })
    },
    getOrder: (req, res) => {
        models.getOrder().then((order) => {
            console.log(order)
            res.render('admin/orderList', { user: false, orders: order });

        })
    },
    removeproductImage: (req, res) => {
        models.removeoneImage(req.body).then((response) => {
            res.send(response)
        })
    },
    graphdata: (req, res) => {
        models.getchartData().then(data => {
            console.log(data);
            res.json({ data })
        })
    },
    changeOrderstatus: (req, res) => {
        models.changeOrderstatus(req.body).then(() => {
            res.json({ status: true })
        })
    },
    coupons: (req, res) => {
        models.getCoupon().then((coupons) => {
            console.log(coupons);
            res.render('admin/coupon', { user: false, coupons: coupons })
        })
    },
    addCoupon: (req, res) => {

        models.addCoupon(req.body).then(() => {
            res.json({ status: true })
        })
    },
    deleteCoupon: (req, res) => {

        let couponId = req.params.id;
        models.deleteCoupon(couponId).then((response) => {
            res.redirect('/admin/coupon')
        })
    },
    pincode: (req, res) => {
        models.getPincode().then((pincode) => {
            res.render('admin/pincode', { user: false, pincode: pincode })
        })
    },
    addpincode: (req, res) => {
        console.log("pinnnnnnnnnnnn", req.body)
        models.addpincode(req.body).then((response) => {
            res.redirect('/admin/pincode')
        })
    },
    pincodeDelete: (req, res) => {
        models.pincodeDelete(req.body.id).then(() => {
            res.json({ status: true })
        })
    },
    orderedProducts: (req, res) => {
        models.orderedProducts(req.params.id).then((details) => {
            console.log(details)
            res.render('admin/orderDetails', { user: false, order: details })

        })
    }
}