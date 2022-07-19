const router = require('express').Router()
const profileController = require('./controller/user')

const { auth } = require('../../middleware/auth')
const validation = require('../../middleware/validation')
const validators = require('./user.validation')
const endpoints = require('./user.endpoint')
const { myMulter, fileValidation, handleMulterError } = require("../../services/multer")


router.get('/profile/:id/qr', profileController.profileQR)
router.put('/profile/updateProfile', validation(validators.updateProfile), auth(endpoints.updateProfile), profileController.updateProfile)
router.patch('/profile/updatePassword', validation(validators.updatePassword), auth(endpoints.updateProfile), profileController.updatePassword)
router.patch("/profile/pic", validation(validators.checkAuth), auth(endpoints.updateProfile), myMulter('user/profile/pic', fileValidation.image).array('image', 5), profileController.profilePic)
router.patch("/profile/coverPic", validation(validators.checkAuth), auth(endpoints.updateProfile), myMulter('user/profile/pic', fileValidation.image).array('image', 5), handleMulterError, profileController.profileCoverPic)

router.delete('/:id/delete', validation(validators.deleteAccount), auth(endpoints.deleteAccount), profileController.deleteAccount) //permanently delete
router.patch('/:id/deactivate', validation(validators.deactivateAccount), auth(endpoints.deactivate), profileController.deactivateAccount) //deactivate with a chance of a couple of days to reactivate, then delete
router.get('/reactivate/:token', validation(validators.reactivateAccount), profileController.reactivateAccount)
router.get('/refreshLink/:id', validation(validators.refreshActivationLink), profileController.refreshActivationLink)



module.exports = router
 
/*
    • SignUp ( confirm email  , hash password before save to database ) 
	• SignIn ( must check if this user’s email is confirmed , admin didn’t block him , user didn’t soft deleted ) 
	• Update profile ( by account owner only ) ( if email updated must confirm it , password update must hashed before save in database)
	• Delete user ( by admin and account owner ) 
	• Add profile picture
	• Add cover picture 
	• Forget password 
	
    • Soft delete ( by admin ) 
	• Get all users with their product information , each product with its comments informations and  its wishlist array information , each comment with its replies if exist( apply pagination concept in this api ) 
	- Qr Code
*/
