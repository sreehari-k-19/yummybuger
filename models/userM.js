const db = require('./connection')
const collection = require('./collections')
const bcrypt = require('bcrypt')
const { productList } = require('../controllers/userController')
const { response } = require('express')
const objectId = require('mongodb').ObjectId
const Razorpay = require("razorpay")
const { resolve } = require('path')
const { log } = require('console')
var instance = new Razorpay({
    key_id: 'rzp_test_vKo6XcqfARa4uS',
    key_secret: 'gfdd5UH35ZRN49JHXTZpbsjs',
});

module.exports = {

    userSignup_M: (signupDetails) => {
        return new Promise(async (resolve, reject) => {
            signupDetails.password = await bcrypt.hash(signupDetails.password, 10)
            db.get().collection(collection.USER_DETAILS).insertOne(signupDetails).then((data) => {
                resolve(data)
            })
        })
    },
    userSignin_M: (loginDetails) => {
        // let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_DETAILS).findOne({ email: loginDetails.email })
            if (user) {
                bcrypt.compare(loginDetails.password, user.password).then((status) => {
                    if (status) {
                        console.log("login scuss")
                        // response.user = user
                        // response.status = true
                        resolve(user)
                    } else {
                        console.log("failed")
                        reject("Password Wrong")
                    }
                })
            } else {
                console.log("Not found");
                console.log(user)
                reject("Your account is not found")
            }

        })
    },
    otplogin: (num) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_DETAILS).findOne({ number: num })

            if (user) {
                if (user.blockStatus) {
                    resolve({ res: "your are blocked" })
                } else {
                    resolve(user)

                }
            } else {
                resolve({ res: "Invalid number" })

            }


        })
    },
    // fetchProductList: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let product = db.get().collection(collection.PRODUCT_DETAILS).find().toArray()
    //         resolve(product)
    //     })
    // },
    getProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_DETAILS).findOne({ _id: objectId(productId) }).then((product) => {
                resolve(product)
            })
        })
    },
    deactivate: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).updateOne({ _id: objectId(userId) }, {
                $set: {
                    blockStatus: true
                }
            }).then((response) => {

                resolve();
            })
        })
    },
    fetchProductList: () => {
        let responce = {}
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_DETAILS).aggregate([
                {
                    $lookup: {
                        from: collection.CATEGORY,
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryDetails"
                    }

                }
            ]).toArray();
            resolve(product)
            // console.log(product[0].categoryDetails[0].categoryname)
        })
    },
    // addCart: (proId, userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let userCart = await db.get().collection(collection.CART).findOne({ user: objectId(userId) });
    //         if (userCart) {
    //             db.get().collection(collection.CART).updateOne({ user: objectId(userId) }, {
    //                 $push: { products: objectId(proId) }
    //             })
    //         } else {
    //             cartObj = {
    //                 user: objectId(userId),
    //                 products: [objectId(proId)]
    //             }
    //             db.get().collection(collection.CART).insertOne(cartObj).then((response) => {
    //                 resolve(response)
    //             })
    //         }
    //     })

    // },
    addCart: (info, userId) => {
        const { id, name } = info
        let productId = id
        console.log(productId);
        let proObj = {
            name,
            item: objectId(productId),
            quantity: 1,

        }
        userId = objectId(userId)
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART).findOne({ user: userId })
            console.log("user=====cart", userCart)
            if (userCart) {

                let proExist = userCart.products.findIndex(product => product.item == productId)

                if (proExist != -1) {



                    db.get().collection(collection.CART).updateOne({ user: userId, 'products.item': objectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve({ status: false })
                    })
                } else {


                    db.get().collection(collection.CART).updateOne({ user: userId }, { $push: { products: proObj } })
                    resolve({ status: true })
                }
            } else {
                let cartObj = {
                    user: userId,
                    products: [proObj],
                    discount: 0
                }
                db.get().collection(collection.CART).insertOne(cartObj)
                console.log("caartacartcartttttttttttttttttttt")
                resolve({ status: true })


            }
        })
    },
    getCartDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_DETAILS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
                // {
                // $lookup:{
                //     from:collection.PRODUCT_COLLECTION,
                //     let:{proList:'$products'},
                //     pipeline:[
                //         {
                //             $match:
                //             {
                //                 $expr:{
                //                     $in:['$_id',"$$proList"]
                //                 }
                //             }
                //         }
                //     ],
                //     as:'cartItems'
                // }
                // }
            ]).toArray()

            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let count = 0;
            let cart = await db.get().collection(collection.CART).findOne({ user: objectId(userId) })
            console.log("/////", cart)

            if (cart) {
                console.log("/////", cart)
                count = cart.products.length
                console.log("/////", count)

            }
            resolve(cart)
        })
    },
    changeproductQuantity: (changeQuat) => {

        changeQuat.count = parseInt(changeQuat.count);
        changeQuat.quantity = parseInt(changeQuat.quantity)

        return new Promise((resolve, reject) => {

            if (changeQuat.count == -1 && changeQuat.quantity == 1) {
                db.get().collection(collection.CART).updateOne({ _id: objectId(changeQuat.cart) },
                    {
                        $pull: { products: { item: objectId(changeQuat.proId) } }
                    }
                ).then(() => {
                    resolve({ removeProduct: true })
                })
            } else {
                db.get().collection(collection.CART).updateOne({ _id: objectId(changeQuat.cart), 'products.item': objectId(changeQuat.proId) },
                    {
                        $inc: { 'products.$.quantity': changeQuat.count }
                    }
                ).then(() => {
                    resolve({ status: true })
                })
            }

        })
    },
    cartTotalprice: (userId) => {

        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_DETAILS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }

            ]).toArray()
            console.log("total..............", total)
            if (total[0]?.total) {
                resolve(total[0].total)
            } else {
                resolve(0)
            }
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        discount: 1
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_DETAILS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        discount: 1
                    }
                },
                {
                    $group:
                    {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.totalprice' }] } },
                        discount: { $first: "$discount" },
                    }
                },
                {
                    $set: { total: { $subtract: ['$total', '$discount'] } }
                }
            ]).toArray()
            console.log("totaaaallalalalaaa", total)
            resolve(total[0])
        })
    },
    getcartList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART).findOne({ user: objectId(userId) })
            console.log("cartttttttt", cart)
            resolve(cart.products)
        })
    },
    placeOrder: (order, products, totalprice, deliveryDetails) => {
        return new Promise((resolve, reject) => {
            console.log("placree oderrrrrrrrrrrrrrrrrrrrrrrr");
            let status = order.paymentMethod === 'cod' ? 'placeOrder' : 'pending'
            let orderDetails = {
                deliverydetails: deliveryDetails,
                userId: objectId(order.userId),
                paymentmethod: order.paymentMethod,
                products: products,
                // date: new Date().toDateString(),
                date: new Date(),
                totalamount: totalprice,
                orderstatus: status,

            }

            db.get().collection(collection.ORDER).insertOne(orderDetails).then((order) => {
                console.log("placree oderrrrrrrrrrrrrrrrrrrrrrrr resolveeeeeeeeeeeeeeeeeeeeee");

                resolve(order.insertedId)


            })
        })
    },
    deleteFullcart: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART).deleteOne({ user: objectId(userId) }).then((response) => {
                console.log(response)
                // resolve(order.insertedId)
                resolve()
            })
        })
    },
    addAddress: (userId, addressDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).updateOne({ _id: objectId(userId) }, {
                $push: {
                    savedaddress: addressDetails
                }
            }).then((response) => {
                resolve()
            })
        })
    },
    getAddress: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).findOne({ _id: objectId(userId) }).then((response) => {
                resolve(response)
            })
        })
    },
    deletecartProduct: (detailscartre) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CART).updateOne({ _id: objectId(detailscartre.cart) },
                {
                    $pull: { products: { item: objectId(detailscartre.proId) } }
                }
            ).then(() => {
                resolve({ removeProduct: true })
            })

        })
    },
    generateRazorpay: (orderId, total) => {
        // orderId=toString(orderId)
        return new Promise((resolve, reject) => {
            console.log(orderId, total)
            var options = {
                amount: total * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: orderId.toString()
            };
            instance.orders.create(options, function (err, order) {
                console.log(order);
                resolve(order)
            });
        })

    },
    razorpayverify: (details) => {

        return new Promise((resolve, reject) => {

            const crypto = require('crypto');
            console.log(details)
            let hmac = crypto.createHmac('sha256', 'gfdd5UH35ZRN49JHXTZpbsjs');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')


            if (hmac === details['payment[razorpay_signature]']) {
                console.log("resolve=============");
                resolve()
            } else {
                console.log("reject=============");
                reject()

            }
        })

    },
    changePaymentStatus: (orderId) => {
        console.log("change payemnt staustsus", orderId)
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER).updateOne({ _id: objectId(orderId) }, {
                    $set: {
                        'orderstatus': 'placeOrder'
                    }
                }).then(() => {
                    console.log("change payemnt staustsus resolveeeeeeeeeeeeeeeeeee")

                    resolve()
                })
            } catch (error) {
                console.log("change payemnt staustsus errrorrrr")
            }

        })
    },
    getUserId: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER).findOne({ _id: objectId(orderId) })
            console.log("ordererrrrrrrrrrrrr", order);
            resolve(order.userId)

        })
    },
    updateuserDetails: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).updateOne({ _id: objectId(details.userId) }, {
                $set: {
                    name: details.name,
                    email: details.email,
                    number: details.number
                }
            })
            resolve()
        })
    },
    addressEdit: async (address, adId, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).updateOne({ _id: objectId(userId) }, {
                $set: {
                    "savedaddress.$[position]": {
                        uniqId: objectId(adId),
                        firstname: address.firstname,
                        address: address.address,
                        city: address.city,
                        pincode: address.pincode,
                        landmark: address.landmark,
                        state: address.state,
                        email: address.email,
                        phonenum: address.phonenum

                    }
                }
            },
                {
                    arrayFilters: [
                        {
                            "position.uniqId": {
                                $eq: objectId(adId)
                            }
                        }
                    ]
                }
            ).then(() => {
                resolve()
            })

        })
    },
    addressRemove: (userId, adid) => {
        console.log(userId, adid);

        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).update({ _id: objectId(userId) }, { $pull: { savedaddress: { uniqId: objectId(adid) } } }).then((response) => {

                resolve()
            })
        })
    },
    getAllOrder: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER).aggregate([{ $match: { userId: objectId(userId) } }, { $sort: { _id: -1 } }

                ]).toArray()
                resolve(orders)

            } catch (error) {

            }


        })

    },
    checkcoupons: (coupon, userId, total) => {
        console.log(coupon, userId, total)

        return new Promise(async (resolve, reject) => {
            try {
                let Coupon = await db.get().collection(collection.COUPON).aggregate([
                    { $match: { "couponcode": coupon } }

                ]).toArray()
                console.log("ccccccccccccllclclclc", Coupon[0].mintotal)
                if (Coupon.length == 0) {
                    reject({ status: "invalid coupon" })
                } else if (Coupon[0].mintotal > total) {
                    reject({ status: "This coupon need more totalamount" })
                } else {
                    console.log(Coupon)
                    db.get().collection(collection.CART).updateOne({ user: objectId(userId) }, {
                        $set: {
                            discount: Coupon[0].couponamount
                        }
                    }).then((response) => {
                        console.log("rsrsrsrrsrrsrsrsrsrs");
                        resolve()
                    })

                }
            } catch (error) {

            }

        })
    },
    addprofile: (userpic, userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).updateOne({ _id: objectId(userId) }, {
                $set: {
                    profileimage: userpic
                }
            }).then(() => {
                resolve()
            })

        })
    },
    checkPincode: (pincod) => {
        return new Promise(async (resolve, reject) => {
            let pin = await db.get().collection(collection.PINCODE).aggregate(
                [{ $match: { pincode: pincod } }]
            ).toArray();
            if (pin.length == 0) {
                reject()
            } else {
                resolve()
            }

        })


    },
    getPincode: () => {
        return new Promise(async (resolve, reject) => {
            let pincode = await db.get().collection(collection.PINCODE).find().toArray()
            console.log(pincode);
            // resolve(pincode)
        })
    },
    addtowhishlist: (productId, userId) => {
        console.log("whisssssssssssssss", userId)
        let proObj = {
            item: objectId(productId),
        }
        userId = objectId(userId)

        return new Promise(async (resolve, reject) => {
            let userWhishlist = await db.get().collection(collection.WHISHLIST).findOne({ user: userId })
            console.log("whisslisttttttt", userWhishlist)
            if (userWhishlist) {

                let proExist = userWhishlist.products.findIndex(product => product.item == productId)
                if (proExist != -1) {
                    reject()
                } else {
                    db.get().collection(collection.WHISHLIST).updateOne({ user: userId }, { $push: { products: proObj } })
                    resolve()
                }
            } else {
                let whishObj = {
                    user: userId,
                    products: [proObj],
                }
                db.get().collection(collection.WHISHLIST).insertOne(whishObj)
                resolve()
            }
        })
    },
    getWhishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let whishlist = await db.get().collection(collection.WHISHLIST).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_DETAILS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                }, {
                    $project: {
                        item: 1,
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()

            resolve(whishlist)
        })
    },
    removeWhishlistProduct: (whishlist) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.WHISHLIST).updateOne({ _id: objectId(whishlist.wId) },
                {
                    $pull: { products: { item: objectId(whishlist.proId) } }
                }
            ).then(() => {
                resolve()
            })

        })

    }

}