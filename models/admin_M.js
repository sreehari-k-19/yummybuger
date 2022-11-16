const db = require('./connection')
const collection = require('./collections')
const { response } = require('express')
const objectId = require('mongodb').ObjectId

module.exports = {
    getDashboardDetails: () => {
        return new Promise(async (resolve, reject) => {
            let totalCustomers = await db.get().collection(collection.USER_DETAILS).count()
            let totalProducts = await db.get().collection(collection.PRODUCT_DETAILS).count()
            let orders = await db.get().collection(collection.ORDER).aggregate([


                {
                    $match: {
                        $or: [{ orderstatus: "Delivered" }, { orderstatus: "placeOrder" }]


                    }



                },
                {
                    $group: { '_id': "$orderstatus", 'total': { '$sum': 1 } }

                }


            ]).toArray()
            let totalSale = await db.get().collection(collection.ORDER).aggregate([
                {
                    $group: {
                        "_id": "_id",
                        "totalSale": {
                            "$sum": { "$sum": "$totalamount" }
                        },
                        "totalOrders": {
                            "$sum": { "$sum": "$products.quantity" }
                        }
                    }
                }
            ]).toArray()
            console.log("totall", orders);
            console.log("ordersssssss", totalCustomers, totalProducts, totalSale[0].totalSale);
            let countbox = {
                totalCustomers: totalCustomers,
                totalProducts: totalProducts,
                totalSale: totalSale[0].totalSale
            }
            resolve(countbox)
        })
    },
    fetchUsers: () => {
        return new Promise(async (resolve, reject) => {
            let userDetails = await db.get().collection(collection.USER_DETAILS).find().toArray()
            resolve(userDetails)
        })
    },
    blockAccount: (userId, statusChange) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.USER_DETAILS).updateOne({ _id: objectId(userId) }, {
                $set: {
                    blockStatus: statusChange
                }
            }).then((response) => {
                resolve();
            })
        })
    },
    changecategoryStatus: (catId, statusChange) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.CATEGORY).updateOne({ _id: objectId(catId) }, {
                $set: {
                    status: statusChange
                }
            }).then((response) => {
                resolve();
            })
        })
    },
    addProductDetails: (productDetails) => {
        console.log("productdetils",)
        productDetails.price = parseInt(productDetails.price)
        productDetails.stock = parseInt(productDetails.stock)
        return new Promise(async (resolve, reject) => {
            productDetails.categoryId = objectId(productDetails.categoryId);
            console.log("productDetails", productDetails)
            db.get().collection(collection.PRODUCT_DETAILS).insertOne(productDetails).then((data) => {
                resolve(data.insertedId.toString())
            })
        })

    },
    addProductCategory: (category) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.CATEGORY).insertOne(category).then((response) => {
                resolve(response)
            })
        })


    },
    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY).find({ status: true }).toArray()
            resolve(category)
        })
    },
    getProductDetails: () => {
        return new Promise(async (resolve, reject) => {
            let productDetails = await db.get().collection(collection.PRODUCT_DETAILS).find().toArray()
            resolve(productDetails)
        })
    },
    deleteProduct: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_DETAILS).deleteOne({ _id: objectId(productId) }).then((deleteResponse) => {
                resolve(deleteResponse)
            })
        })
    },
    getProductData: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_DETAILS).findOne({ _id: objectId(productId) }).then((product) => {
                resolve(product)
            })
        })
    },
    getCategoryone: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY).findOne({ _id: objectId(categoryId) }).then((category) => {
                resolve(category)
            })
        })
    },
    updateCategory: (catId, categorytDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY).updateOne({ _id: objectId(catId) }, {
                $set: {
                    categoryname: categorytDetails.categoryname,
                    categorydescription: categorytDetails.categorydescription
                }
            })
            resolve()
        })
    },
    updateProduct: (proId, productDetails) => {
        console.log("dffsfklsdfjksdal;k", productDetails)
        productDetails.price = parseInt(productDetails.price)
        productDetails.stock = parseInt(productDetails.stock)
        productDetails.categoryId = objectId(productDetails.categoryId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_DETAILS).updateOne({ _id: objectId(proId) }, {
                $set: {
                    productname: productDetails.productname,
                    price: productDetails.price,
                    stock: productDetails.stock,
                    desription: productDetails.desription
                }
            })
            db.get().collection(collection.PRODUCT_DETAILS).updateOne({ _id: objectId(proId) }, { $push: { images: { $each: productDetails.images } } })
            resolve()
        })
    },
    getOrder: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER).find().toArray()
            resolve(order)
        })
    },
    removeoneImage: (removeImg) => {
        return new Promise((resolve, reject) => {
            console.log(removeImg.imgname);
            img = removeImg.imgname
            db.get().collection(collection.PRODUCT_DETAILS).updateOne({ _id: objectId(removeImg.proId) }, {
                $pull: { images: img }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getchartData: (req, res) => {
        return new Promise(async (resolve, reject) => {

            //   WeeklySales
            var weeklySales = await db.get().collection(collection.ORDER).aggregate([
                { $match: { "orderstatus": "placeOrder" } },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, total: "$totalamount"
                    }
                },
                {
                    $match: {
                        date: {
                            $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date" },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $project: {
                        date: "$_id",
                        total: "$total",
                        _id: 0
                    }
                },
                {
                    $sort: { date: 1 }
                }
            ]).toArray()

            console.log(weeklySales[0]);

            // monthly Sales
            var monthlySales = await db.get().collection(collection.ORDER).aggregate([
                { $match: { "orderstatus": "placeOrder" } },
                {
                    $project: {
                        date: { $convert: { input: "$_id", to: "date" } }, total: "$totalamount"
                    }
                },
                {
                    $match: {
                        date: {
                            $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 365))
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$date" },
                        total: { $sum: "$total" }
                    }
                },
                {
                    $project: {
                        month: "$_id",
                        total: "$total",
                        _id: 0
                    }
                }
            ]).toArray()

            // console.log(monthlySales);




            // console.log(yearlySales);
            resolve({ weeklySales, monthlySales })

        })
    },
    changeOrderstatus: (orderStatus) => {
        console.log("fdslslfklsdf", orderStatus);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER).updateOne({ _id: objectId(orderStatus.orderId) }, {
                $set: {
                    orderstatus: orderStatus.status
                }
            })
            resolve()
        })
    },
    addCoupon: (cpn) => {
        return new Promise((resolve, reject) => {
            cpn.couponamount = parseInt(cpn.couponamount)
            cpn.mintotal = parseInt(cpn.mintotal)
            db.get().collection(collection.COUPON).insertOne(cpn).then(() => {
                console.log("resolveeeeeeeeee");
                resolve()
            })
        })
    },
    getCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON).find().toArray()
            resolve(coupon)
        })
    },
    deleteCoupon:(couponId)=>{
        return new Promise(async (resolve, reject) => {
            db.get().collection(collection.COUPON).deleteOne({ _id: objectId(couponId) }).then((deleteResponse) => {
                resolve(deleteResponse)
            })
        }) 
    },
    addpincode:(pin)=>{
        return new Promise ((resolve,reject)=>{
            db.get().collection(collection.PINCODE).insertOne(pin).then(() => {
                resolve()
            })  
        })
    },
    getPincode:()=>{
        return new Promise(async (resolve, reject) => {
            let pincode = await db.get().collection(collection.PINCODE).find().toArray()
            resolve(pincode)
        })
    }
    
}