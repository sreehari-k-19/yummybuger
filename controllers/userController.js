require("dotenv").config();
const { response } = require('express')
const models = require('../models/userM')
const jwt = require('jsonwebtoken')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const tokenCreate = require('../middlewares/jwt');
const { ObjectId } = require("mongodb");
const { removeWhishlistProduct } = require("../models/userM");
const maxAge = 10 * 24 * 60 * 60;

client.verify.v2.services.create({ friendlyName: 'first verify service' }).then(service => console.log(service.id))






module.exports = {
  // verifyJwtToken: (req, res, next) => {

  //   const token = req.cookies.jwt
  //   if (token) {

  //     jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
  //       if (err) {
  //         console.log(err.message, 'jwt error');
  //         res.redirect('/');
  //       } else {
  //         console.log(decodedToken, 'decoded the token');
  //         res.locals.activeUser = decodedToken
  //         console.log('HELLFOEFFJJ')
  //         next()
  //       }
  //     })
  //   } else {
  //     next();
  //   }
  // },
  home: async (req, res) => {
    let cartCount = null;
    let userProfileimg;
    if (res.locals.activeUser) {
      cartCount = await models.getCartCount(res.locals.activeUser.id)
      userProfileimg = await models.userProfileimg(res.locals.activeUser.id)
      cartCount = cartCount?.products.length
    }
    if (cartCount == null) {
      cartCount = 0;
    }
   
    console.log(cartCount,userProfileimg, "crtcuntttttttttttttttttttttt")
    models.fetchProductList().then((products) => {
      res.render('user/home', { title: 'yummyburger', user: true, userAccount: res.locals.activeUser, products: products, cartCount: cartCount ,userProfileimg:userProfileimg});
    })
  },
  notLogin: (req, res) => {
    let cartCount = 0;
    let cartTotal = 0;
    res.render('user/accountno', { user: true, userAccount: res.locals.activeUser, cartCount: cartCount })

  },
  userSignup: (req, res) => {
    req.body.blockStatus = false;
    console.log("sssssssssssssgnnnnnn", req.body);

    let { name, email, number, password, otp, blockStatus } = req.body;
    console.log(req.body);
    console.log(number);
    console.log(otp);

    client.verify.services(process.env.TWILIO_SERVICE_SID).verificationChecks.create({ to: `+91${number}`, code: otp })
      .then((resp) => {
        console.log(req.body.number);
        if (!resp.valid) {
          console.log("otppppp failed", resp)
          res.send(resp);
        } else {
          console.log("otpp successssss", resp)
          let userdata = { name, email, number, password, blockStatus }
          models.userSignup_M(userdata).then((response) => {
            console.log("signup responce", response.insertedId)
            console.log(req.body);
            const token = tokenCreate.createToken(response.insertedId, req.body.name);
            console.log(token)
            res.cookie('userjwt', token, { httponly: true, maxAge: maxAge * 1000 })
            res.json({ valid: true });
          })

        }
      }).catch(err => {
        console.log(err);
      })

  },
  userSignin: (req, res) => {

    models.userSignin_M(req.body).then((user) => {
      user.status = true
      console.log(user);
      const token = tokenCreate.createToken(user._id, user.name);
      console.log(token)
      res.cookie('userjwt', token, { httponly: true, maxAge: maxAge * 1000 })
      res.send(user)

    }).catch((err) => {
      res.send(err);
    })
  },
  userOtplogin: (req, res) => {
    console.log("lakfaslf;a", req.body)
    models.otplogin(req.body.num).then((response) => {
      console.log(response);
      if (response.res) {
        res.send(response)

      } else {
        client.verify.v2
          .services(process.env.TWILIO_SERVICE_SID)
          .verifications.create({
            to: `+91${req.body.num}`,
            channel: 'sms'
          }).then(data => {
            console.log("dataaaaaaaaaaa", data.status);
            res.json({})

          })
          .catch(err => {
            console.log("otp--error", err);
          })
        console.log("usrrrrrrrrrrr............", response)
        res.json({ num: req.body.num })

      }
    })
  },
  userProfile: (req, res) => {
    console.log("prfllllllllllllll")
    console.log("prfllllllllllllll", req.file.filename);

    console.log("prfllllllllllllll", res.locals.activeUser.id);
    models.addprofile(req.file.filename, res.locals.activeUser.id).then((response) => {
      res.redirect('/profile')
    })

  },
  otpNum: (req, res) => {
    // let number = parseInt(req.body.number);
    let number = req.body.number;
    let otp = req.body?.otp;
    client.verify.services(process.env.TWILIO_SERVICE_SID).verificationChecks.create({ to: `+91${number}`, code: otp })
      .then((resp) => {
        console.log(req.body.number);
        if (!resp.valid) {
          console.log("otppppp failed", resp)
          res.send(resp);
        } else {
          console.log("otpp successssss", resp)

          models.otplogin(req.body).then((user) => {
            user.status = true
            console.log(user);
            const token = tokenCreate.createToken(user._id, user.name);
            console.log(token)
            res.cookie('userjwt', token, { httponly: true, maxAge: maxAge * 1000 })
            res.send(resp);

          }).catch((err) => {
            res.send(err);
          })

        }
      }).catch(err => {
        console.log(err);
      })

  },
  userLogout: (req, res) => {
    res.cookie('userjwt', '', { maxAge: 1 })
    res.redirect('/');
  },
  userdeactivate: (req, res) => {
    models.deactivate(res.locals.activeUser.id).then(() => {
      res.cookie('userjwt', '', { maxAge: 1 })
      res.json({ status: true })
    })
  },
  productList: (req, res) => {
    models.fetchProductList().then((products) => {
      res.render('user/product-view', { user: true, products: products })
    })
  },
  sendOtp: (req, res) => {
    client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+91${req.body.phoneNumber}`,
        channel: 'sms'
      }).then(data => {
        console.log("dataaaaaaaaaaa", data.status);
        res.json({})

      })
      .catch(err => {
        console.log("otp--error", err);
      })

  },
  productview: async (req, res) => {
    let cart = await models.getCartCount(res.locals.activeUser.id);
    let  userProfileimg = await models.userProfileimg(res.locals.activeUser.id)
    let cartCount = 0
    cartCount = cart?.products.length;
    console.log("idddd", req.params.id);
    let product = await models.getProduct(req.params.id)
    console.log(product);
    res.render('user/product-view', { user: true, userAccount: res.locals.activeUser, product: product, cartCount: cartCount,userProfileimg :userProfileimg  })

  },
  cart: async (req, res) => {
    console.log(res.locals.activeUser)
    let cartCount = 0;
    let cartTotal = 0;
    cartTotal = await models.cartTotalprice(res.locals.activeUser.id)
    cartCount = await models.getCartCount(res.locals.activeUser.id)
    let  userProfileimg = await models.userProfileimg(res.locals.activeUser.id)
    cartCount = cartCount?.products.length;
    console.log("cartcounrttttttttttttt", cartCount, cartTotal)
    if (cartTotal == 0) {
      let cartCount = 0;
      res.render('user/emptycart', { user: true, userAccount: res.locals.activeUser, cartCount: cartCount,userProfileimg:userProfileimg })
    } else {
      cartTotal = await models.cartTotalprice(res.locals.activeUser.id)
      console.log("carttotal", cartTotal)
      let cartItems = await models.getCartDetails(res.locals.activeUser.id)
      console.log("............... cart total", cartCount, cartItems)
      res.render("user/usercart", { user: true, userAccount: res.locals.activeUser, cartCount: cartCount, cartItems: cartItems, cartTotal: cartTotal,userProfileimg:userProfileimg })
    }

  },
  addtocart: (req, res) => {
    console.log("....... ", req.params)
    models.addCart(req.params, res.locals.activeUser.id).then((response) => {
      res.json(response);
    })
  },
  countCart: (req, res) => {
    let cartCount = models.getCartCount(req.locals.activeUser.id)
  },
  changeProductQ: (req, res) => {
    console.log(req.body)
    models.changeproductQuantity(req.body).then(async (response) => {
      response.cartTotal = await models.cartTotalprice(req.body.userId)
      console.log("change quantity", response)
      res.json(response)
    })
  },
  checkoutPage: async (req, res) => {
    let cartTotal = 0;
    let cart = null;
    cart = await models.getCartCount(res.locals.activeUser.id)
    cartTotal = await models.getTotalAmount(res.locals.activeUser.id)
    let  userProfileimg = await models.userProfileimg(res.locals.activeUser.id)
    let cartItems = await models.getCartDetails(res.locals.activeUser.id)

    console.log(cartTotal, "jjjjjjjjjjjjjjjjjjjj");
    let cartCount = 0
    cartCount = cart.products.length
    console.log('cartconttttttttttt', cartCount, cart.discount);
    let userAddress = await models.getAddress(res.locals.activeUser.id)
    console.log(userAddress.savedaddress)
    res.render("user/checkout", { user: true, userAccount: res.locals.activeUser, cartTotal: cartTotal, address: userAddress.savedaddress, cartCount: cartCount, cartItems: cartItems,userProfileimg :userProfileimg  })

  },
  placeOrder: async (req, res) => {
    let body = req.body
    if (req.body.addressr) {
      let n = parseInt(req.body.addressr)
      let userAddress = await models.getAddress(req.body.userId)
      req.body = userAddress.savedaddress[n];
    }
    console.log("rewq...........", req.body)
    console.log("rewq...........", body)

    let cartProducts = await models.getcartList(body.userId)
    let cartTotal = await models.getTotalAmount(body.userId)
    console.log('placeorder.............', cartTotal.total);

    let deliveryDetails = {
      uniqId: new ObjectId(),
      firstname: req.body.firstname,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      landmark: req.body.landmark,
      email: req.body.email,
      phonenum: req.body.phonenum
    }
    if (body.save == 'savetrue') {
      await models.addAddress(req.body.userId, deliveryDetails).then((response) => {

      })
    }
    models.placeOrder(body, cartProducts, cartTotal, deliveryDetails).then((orderId) => {
      if (body.paymentMethod == 'cod') {
        models.deleteFullcart(body.userId).then((responce) => {
          console.log("delete cart coddddddddddddddd");
          res.json({ codstatus: true });
        })
      }
      else {
        console.log("oderIDddddddd", orderId);
        models.generateRazorpay(orderId, cartTotal.total).then((response) => {
          res.json(response)
        })
      }
    })

  },
  removecartItem: (req, res) => {
    console.log("///////////carttdelete", req.body)
    models.deletecartProduct(req.body).then(async (response) => {
      res.json(response)
    })
  },
  razorpayverify: (req, res) => {
    console.log('payementVerify', req.body);
    models.razorpayverify(req.body).then((response) => {
      console.log('payementVerifyrtyrtyrtyrtyy');
      models.changePaymentStatus(req.body['order[receipt]']).then((responce) => {
        console.log('change stauassssssss rsvvvvvvvvvvvvvvvvvvvvvv');
        models.getUserId(req.body['order[receipt]']).then((userId) => {
          models.deleteFullcart(userId).then((response) => {
            res.json({ paymentstatus: true })

          })
        })
      })
    }).catch((err) => {
      console.log('paymentVerify=========rtyy');

      res.json({ paymentstatus: false })
    })
  },
  getuserDetails: async (req, res) => {
    let cartCount = 0;
    let cart = await models.getCartCount(res.locals.activeUser.id);
    let  userProfileimg = await models.userProfileimg(res.locals.activeUser.id)

    cartCount = cart?.products.length;
    if (cart == null) {
      cartCount = 0;
    }
    let orders = await models.getAllOrder(res.locals.activeUser.id)
    models.getAddress(res.locals.activeUser.id).then((response) => {
      console.log("serprofile", response)
      res.render('user/userprofile', { user: true, userDetails: response, orders: orders, userAccount: res.locals.activeUser, cartCount: cartCount,userProfileimg :userProfileimg  })
    })
  },
  updateuserDetails: (req, res) => {
    console.log("bodddyyydyydyd", req.body);
    models.updateuserDetails(req.body).then((response) => {
      res.send()
    })
  },
  editaddress: async (req, res) => {

    console.log("cat.............id", res.locals.activeUser.id)
    console.log("cat.............id", req.params.id)
    let n = req.params.id
    let userAddress = await models.getAddress(res.locals.activeUser.id)

    console.log();
    res.send(userAddress.savedaddress[n])

  },
  addresschange: (req, res) => {
    let adId = req.params.id
    models.addressEdit(req.body, adId, res.locals.activeUser.id).then(() => {

      res.json({ status: true })
    })
  },
  addressRemove: (req, res) => {
    models.addressRemove(res.locals.activeUser.id, req.body.addressId).then(() => {
      res.json({ status: true })
    })
  },
  checkcoupon: async (req, res) => {
    console.log("cpnnnnnnnnnnnnnnn", req.body)
    let totalamount = await models.getTotalAmount(res.locals.activeUser.id)
    console.log("tooooooooooooooooo", totalamount)
    models.checkcoupons(req.body.coupon, res.locals.activeUser.id, totalamount.total).then((cpnper) => {
      models.getTotalAmount(res.locals.activeUser.id).then((response) => {
        // let cpnoffer=(response.total+response.discount)
        response.discount=cpnper;
        console.log("tttmtmtmtmtmtmtmtmttmtm", response);
        res.json(response)
      })
    }).catch((response) => {
      res.json(response)

    })
  },
  up: (req, res) => {
    res.render('user/up', { user: true })
  },
  checkpincode: (req, res) => {
    console.log(req.body)
    models.checkPincode(req.body.pincode).then((response) => {
      res.json({ status: true })
    }).catch(() => {
      res.json({ status: false })

    })
  },
  addtowhishlist: (req, res) => {
    models.addtowhishlist(req.body.proId, res.locals.activeUser.id).then(() => {
      res.json({ status: true })
    }).catch(() => {
      res.json({ status: false })
    })
  },
  whishlist: (req, res) => {
    models.getWhishlist(res.locals.activeUser.id).then(async (whishlist) => {
      if (whishlist.length == 0) {
        res.redirect('/')
      } else {
        let cartCount = 0
        cartCount = await models.getCartCount(res.locals.activeUser.id)
        let  userProfileimg = await models.userProfileimg(res.locals.activeUser.id)
        cartCount = cartCount?.products.length;
        res.render("user/whishlist", { user: true, whishlists: whishlist, cartCount: cartCount, userAccount: res.locals.activeUser,userProfileimg:userProfileimg })
      }
    })
  },
  getwhishlist: (req, res) => {
    models.getWhishlist(res.locals.activeUser.id).then((whishlist) => {
      if (whishlist.length == 0) {
        res.json({ status: false })
      } else {
        res.json({ status: true })

      }
    })
  },
  removeWhishlistProduct: (req, res) => {
    console.log(req.body)
    models.removeWhishlistProduct(req.body).then(() => {
      res.json({ status: true })
    })
  }

}