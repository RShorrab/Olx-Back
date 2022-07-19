require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
const DBConnection = require('./DB/connection')
const indexRouters = require("./modules/index.router")
const path = require("path")
var cors = require('cors')
const { initIO } = require('./services/socket')
const productModel = require('./DB/models/product')
const commentModel = require('./DB/models/comment')


app.use(cors())
app.use(express.json())
app.use('/api/v1/uploads', express.static(path.join(__dirname, './uploads')))
app.use('/api/v1/auth', indexRouters.authRouter)
app.use('/api/v1/admin', indexRouters.adminRouter)
app.use('/api/v1/user', indexRouters.userRouter)
app.use('/api/v1/product', indexRouters.productRouter, indexRouters.commentRouter)


app.get('/', (req, res) => res.send('Hello World!'))



DBConnection()
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
const io = initIO(server)
io.on('connection', async (socket)=>
{
    console.log(socket.id);

    const products = await productModel.find({})
    io.emit("addProduct", products)      
    const comments = await commentModel.find({ parentComment: { $exists: false }  }).populate([
        {
            path: "reply", 
            select: "comment_body product_id  _id", 
            populate:
            [
                { //replies L2
                    path: "reply",
                    select: "comment_body  product_id  _id",
                }
            ]
        }
    ])
    io.emit("addComment", comments)      

})

