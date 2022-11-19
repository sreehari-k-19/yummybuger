var express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const adminController = require('../controllers/adminController');
const tokenVerify=require('../middlewares/jwt');
const { getchartData } = require('../models/admin_M');

var router = express.Router();


// Image Upload
const imageStorage = multer.diskStorage({
  destination: './public/uploads', // Destination to store image 
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


router.get('/upload',(req,res)=>{
  res.render('user/upload',{user:true})
})
// router.post('/upload',imageUpload.array('image'),(req,res)=>{
//   console.log("fjkfjkffffffffffff;")
//   console.log(req.body);
//   console.log(req.files)
// })

router.get('/login',adminController.login)

router.post('/adminlogin',adminController.checkAdminlogin)

router.get('/adminlogout',adminController.adminLogout)

// router.use(tokenVerify.createTokenAdmin)

router.get('/',tokenVerify.verifyJwtTokenAdmin,adminController.adminDashboard);

router.get('/customers',tokenVerify.verifyJwtTokenAdmin,adminController.getUserdetails);

router.get('/blockUser/:id/:blockStatus',adminController.blockUser);

router.get('/addproduct',tokenVerify.verifyJwtTokenAdmin,adminController.addProduct);

router.post('/addproduct',imageUpload.array('image') ,adminController.addProductDetails);

router.post('/addcategory',adminController.addCategory);

router.get('/productlist',tokenVerify.verifyJwtTokenAdmin,adminController.getProduct)

router.get('/deleteproduct/:id',adminController.deleteProduct)

router.get('/editproduct/:id',adminController.fetchEditProduct)

router.get('/category',tokenVerify.verifyJwtTokenAdmin,adminController.categoryList)

router.get('/editCategory/:id',adminController.editCategory)

router.post('/editCategory/:id',adminController.updateCategory)

router.get('/categorystatus/:id/:status',adminController.categoryStatus);

router.post('/editproduct/:id',imageUpload.array('image'),adminController.updateProduct)

router.get('/orders',adminController.getOrder)

router.post('/removeproductImage',adminController.removeproductImage)


router.get('/chart',(req,res)=>{
res.render('user/chart',{user:false})
})
// router.get('/getChartData',getchartData)
router.get('/getChartData',adminController.graphdata)

router.post('/change-orderstatus',adminController.changeOrderstatus)


router.get('/coupon',adminController.coupons)

router.post('/addcoupon',adminController.addCoupon)

router.get('/deletecoupon/:id',adminController.deleteCoupon)

router.get('/pincode',adminController.pincode)

router.post('/addpincode',adminController.addpincode)

router.post('/pincodeDelete',adminController.pincodeDelete)

router.get('/vieworder/:id',adminController.orderedProducts)

module.exports = router;
