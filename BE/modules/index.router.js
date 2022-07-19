const authRouter = require("./auth/auth.router")
const adminRouter = require("./admin/admin.router")
const userRouter = require("./user/user.router")
const productRouter = require("./product/product.router")
const commentRouter = require("./comment/comment.router")



module.exports = 
{
    authRouter,
    adminRouter,
    userRouter,
    productRouter,
    commentRouter
}