
const { response } = require('express');
var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const userController = require('../controllers/userController');
const { verifyJwtToken } = require('../middlewares/jwt');
const tokenVerify=require('../middlewares/jwt');



const imageStorage = multer.diskStorage({
    destination: './public/profile', // Destination to store image 
    filename: (req, file, cb) => {
      console.log(file.filename)  
        cb(null, file.fieldname + '_' + uuidv4() + path.extname(file.originalname))
       
        // file.fieldname is name of the field (image), path.extname get the uploaded file extension
    }
  });
  
  const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 1000000   // 1000000 Bytes = 1 MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg)$/)) {     // upload only png and jpg format
            return cb(new Error('Please upload a Image'))
        }
        cb(undefined, true)
    }
  }) 
  

router.get('/',tokenVerify.homeverifyJwtToken ,userController.home)

router.post('/signup', userController.userSignup)

router.post('/signin',userController.userSignin)

router.get('/product',userController.productList)

router.get('/logout', userController.userLogout)

router.post('/sendotp',userController.sendOtp)

router.post('/addprofile',tokenVerify.verifyJwtToken,imageUpload.single('userimage'),userController.userProfile)

router.get('/productdetails/:id',tokenVerify.verifyJwtToken,userController.productview)

router.get('/cart',tokenVerify.verifyJwtToken,userController.cart)

router.get('/addtocart/:id/:name',tokenVerify.verifyJwtToken,userController.addtocart)

router.post('/changeProductQ',userController.changeProductQ)

router.get('/checkout',tokenVerify.verifyJwtToken,userController.checkoutPage)

router.post('/chechoutdetails',tokenVerify.verifyJwtToken,userController.placeOrder)

router.post('/otplogin',userController.userOtplogin)

router.post('/otpnum',userController.otpNum)

router.get('/noaccount',userController.notLogin)

router.post('/removecartproduct',userController.removecartItem)

router.post('/razorpayverify',userController.razorpayverify)

router.get('/img',(req,res)=>{
    res.render("user/imgzoom",{user:true})
    
})
router.get('/profile',tokenVerify.verifyJwtToken,userController.getuserDetails)


router.post('/updateuserdetails',userController.updateuserDetails)

router.get('/editaddress/:id',tokenVerify.verifyJwtToken,userController.editaddress)

router.post('/addresschange/:id',tokenVerify.verifyJwtToken,userController.addresschange)

router.post('/removeaddress',tokenVerify.verifyJwtToken,userController.addressRemove)

router.post('/checkcoupon',tokenVerify.verifyJwtToken,userController.checkcoupon)

router.get('/userdeactivate',tokenVerify.verifyJwtToken,userController.userdeactivate)

router.post('/checkpincode',userController.checkpincode)

router.post('/addtowhishlist',tokenVerify.verifyJwtToken,userController.addtowhishlist)

router.get('/whishlist',tokenVerify.verifyJwtToken,userController.whishlist)

router.get('/getwhishlist',tokenVerify.verifyJwtToken,userController.getwhishlist)

router.post('/removeWhishlistProduct',userController.removeWhishlistProduct)

module.exports = router;
