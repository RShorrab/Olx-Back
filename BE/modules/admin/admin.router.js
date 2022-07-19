const router = require('express').Router()
const adminController = require("./controller/admin")

const { auth } = require('../../middleware/auth')
const validation = require('../../middleware/validation')
const validators = require('./admin.validation')
const endpoints = require('./admin.endpoint')

router.get("/allUsers", validation(validators.getAllUsers), auth(endpoints.getAllUsers), adminController.getAllUsers)
router.patch("/:id/updateRole", validation(validators.updateRole), auth(endpoints.updateRole), adminController.updateRole)
router.patch("/:id/blockUser", validation(validators.blockUser), auth(endpoints.blockUser), adminController.blockUser)
router.patch("/:id/softDelete", validation(validators.softDeleteUser), auth(endpoints.softDeleteUser), adminController.softDeleteUser)


module.exports = router