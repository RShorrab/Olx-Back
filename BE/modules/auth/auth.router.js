const router = require('express').Router()
const registrationController = require('./controller/auth')

const { auth } = require('../../middleware/auth')
const validation = require('../../middleware/validation')
const validators = require('./auth.validation')
const endpoints = require('./auth.endpoint')
const rateLimit = require('express-rate-limit') 

const wrongPassword = rateLimit({
	windowMs: 2 * 60 * 1000, // 2 minutes
	max: 3, //# of tempts in the specified time  
	message: 'You have exceeded the allowed number of attempts, please try again after 2 minutes',
	standardHeaders: true,
	legacyHeaders: false, 
})

router.post('/signup', validation(validators.signupValidation), registrationController.signup)
router.post('/signin', wrongPassword, validation(validators.signinValidation), registrationController.signin)
router.patch('/refreshEmail/:id', registrationController.refreshEmail)
router.get('/confirmEmail/:token', registrationController.confirmEmail)
router.patch('/signout', auth(endpoints.signout), registrationController.signout)
router.patch('/sendCode', validation(validators.sendCode), registrationController.sendCode)
router.patch('/forgetPassword', validation(validators.forgetPassword), registrationController.forgetPassword)


module.exports = router