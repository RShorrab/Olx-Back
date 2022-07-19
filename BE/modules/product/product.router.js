const router = require('express').Router()
const productController = require('./controller/product')

const { auth } = require('../../middleware/auth')
const validation = require('../../middleware/validation')
const { myMulter, fileValidation, handleMulterError } = require('../../services/multer')
const endpoints = require('./product.endpoint')
const validators = require("./product.validation")


router.get('/getAllProducts', productController.getAllProducts)
router.post('/createProduct', auth(endpoints.createProduct), myMulter('product',fileValidation.image).array('image', 5), handleMulterError, validation(validators.createProduct), productController.createProduct)
router.put('/:id/updateProduct', auth(endpoints.updateProduct), validation(validators.updateProduct), myMulter('product',fileValidation.image).array('image', 5), handleMulterError, productController.updateProduct)
router.patch('/:id/like', auth(endpoints.likes), validation(validators.likes), productController.likeProduct)
router.patch('/:id/hide', auth(endpoints.hide), validation(validators.hide), productController.hideProduct)
router.patch('/:id/softDelete', auth(endpoints.deleteProduct), validation(validators.deleteProduct), productController.softDeleteProduct)
router.delete('/:id/delete', auth(endpoints.deleteProduct), validation(validators.deleteProduct), productController.deleteProduct)
router.patch('/:id/addToWishList', auth(endpoints.wishlist), validation(validators.wishList), productController.addToWishList)
router.patch('/:id/removeFromWishList', auth(endpoints.wishlist), validation(validators.wishList), productController.removeFromWishList)
router.get('/updateWithNewProducts', productController.updateWithNewProducts)



module.exports = router

/*
    **General:
        • Create pdf contain id, title, desc, price of every product created today and send this pdf every day at 11:59:59 to the admin 
    **Product APIs:
        - Add product ( create QR code for each product,  if there is a product added,  it must reflected in all pages which open the same website in real time using socket io ) 
        • Update product ( by product owner only ) 
        • Delete product ( by admin and product owner ) .. product comments deleteion 
        • Soft delete ( by admin and product owner ) 
        • Like / unlike product 
        • Add product to wishlist (this api will add the product to wishlist array in user collection  , if product already exists don’t add it again )  .. [product to user's Wishlist & Wishlist users to product ]
        • Hide product 

    - eh el real difference between delete and soft delete f el project w eh el faida!
*/