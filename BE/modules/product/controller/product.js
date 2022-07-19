const productModel = require("../../../DB/models/product")
const commentModel = require("../../../DB/models/comment")
const userModel = require("../../../DB/models/user")
const paginate = require("../../../services/paginate")
const sendEmail = require("../../../services/email");
const { createInvoice } = require("../../../services/pdf");
const QRCode = require("qrcode");
const path = require("path")
const schedule = require('node-schedule');
const { getIO } = require("../../../services/socket");

const getAllProducts = async (req, res)=>
{
    try 
    {
        const count = await productModel.find().count()
        const {page, size} = req.query
        const lastPage = Math.ceil(count / size)
        const {skip, limit, pageNumber} = paginate(page, size, lastPage)

        const product = await productModel.find({isDeleted: false, hidden: false}).select('product_title product_desc product_price image likes comments -_id').limit(limit).skip(skip).populate([
            { //user
                path: "createdBy",
                select: "firstName lastName email -_id"
            },
            { //likes
                path: "likes",
                select: "firstName lastName email -_id"
            },
            { //comments
                path: "comments",
                select: "comment_body commented_By likes reply -_id", 
                populate: 
                [
                    { //user
                        path: "commented_By",
                        select: "firstName lastName email -_id"
                    },
                    { //likes
                        path: "likes",
                        select: "firstName lastName email -_id"
                    },
                    { //replies L1
                        path: "reply", 
                        select: "comment_body commented_By likes reply -_id",  //-_id
                        populate:
                        [
                            {
                                path: "commented_By",
                                select: "firstName lastName email -_id"
                            },
                            {
                                path: "likes",
                                select: "firstName lastName email -_id"
                            },
                            { //replies L2
                                path: "reply",
                                select: "comment_body commented_By likes -_id",
                                populate:
                                [
                                    {
                                        path: "commented_By",
                                        select: "firstName lastName email -_id"
                                    },
                                    {
                                        path: "likes",
                                        select: "firstName lastName email -_id"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }            
        ])
        
        res.status(200).json({message: "All products displayed", page: pageNumber, product})
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "create product failed!!", error: error.toString() })
    }
}
const createProduct = async (req, res)=>
{
    try
    {
        const {product_title, product_desc, product_price} = req.body
        if(req.fileError)
        {
            res.status(400).json({message: "invalid format"})
        }
        else if(!req.files || req.files.length <= 0)
        {
            res.status(400).json({message: "An image of the product should be selected!"})
        }
        else
        { 
            const imageURL = []
            req.files.forEach( file => 
            {
                imageURL.push(`${req.finalDestination}/${file.filename}`)
            })

            const newProduct = new productModel({product_title, product_desc, product_price, image: imageURL, createdBy: req.user._id})
            const savedProduct = await newProduct.save()
            QRCode.toDataURL(`${savedProduct}`, async function (err, url)
            {
                if(err)
                    res.status(400).json({message: "QR error", err})
                else
                    await productModel.updateOne({_id: savedProduct}, {Qr_code: url}) //savedProduct.update({Qr_code: url}) .. gives warning
            })
            await userModel.findByIdAndUpdate(req.user._id, {$push: {products: savedProduct._id}})
            
            getIO().emit( 'addProduct' , [savedProduct]) 
            res.status(200).json({message: "product created successsfully"})
        }  
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "create product failed!!", error: error.toString() })
    }
   
}
const likeProduct = async (req, res)=>
{
    try
    {
        const product = await productModel.findById(req.params.id)

        if(product.createdBy.toString() == req.user._id.toString()) //both of type [ new ObjectId("62a8da96705426fdb885dc37") ] .. better way to compare them?
        {
            res.status(401).json({message: "Sorry you cannot like your product!"})
        }
        else
        {
            if(product.likes.includes(req.user._id)) //unlike
            {
                await productModel.findByIdAndUpdate(req.params.id, {$pull: {likes: req.user._id} })
                res.status(200).json({message: "unlike product done"})
            }
            else //like
            {
                await productModel.findByIdAndUpdate(req.params.id, {$push: {likes: req.user._id} })
                res.status(200).json({message: "like product done"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "like product catch error!", error})
    }
    
}
const updateProduct = async (req, res)=>
{
    try
    {
        const {product_title, product_desc, product_price} = req.body
        const {id} = req.params
        const product = await productModel.findOne({_id: id})

        if(!product)
        {
            res.status(404).json({message: "invalid product id"})
        }
        else if(product.createdBy.toString() != req.user._id.toString())
        {
            res.status(401).json({message: "Sorry you cannot edit this product!"})
        }
        else if(product.isDeleted == true)
        {
            res.status(409).json({message: "This product is deleted!"})
        }
        else
        {
            if(req.files.length != 0) //to avoid updating image to empty array
            {
                const imageURL = []
                req.files.forEach( file => 
                {
                    imageURL.push(`${req.finalDestination}/${file.filename}`)
                })

                
                const updatedProduct = await productModel.findByIdAndUpdate(id, {product_title, product_desc, product_price, image: imageURL})
                getIO().emit( 'updateProduct' , [product, updatedProduct])
                res.status(200).json({message: "product edited successfully"})
            }
            else
            {
                const updatedProduct = await productModel.findByIdAndUpdate(id, {product_title, product_desc, product_price})
                getIO().emit( 'updateProduct' , [product, updatedProduct])
                res.status(200).json({message: "product edited successfully"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "edit product catch error!", error: error.toString()})
    }
} 
const hideProduct = async (req, res)=>
{
    try
    {
        const product = await productModel.findById(req.params.id)
        if(!product)
        {
            res.status(200).json({message: "Invalid product id"})
        }
        else 
        {    
            if(product.createdBy.toString() != req.user._id.toString())
            {
                res.status(401).json({message: "Sorry you cannot hide this product!"})
            }
            else
            {
                if(product.hidden) //unhide
                {
                    await productModel.findByIdAndUpdate(req.params.id, {hidden: false})
                    res.status(200).json({message: "unhide product done"})
                }
                else //hide
                {
                    await productModel.findByIdAndUpdate(req.params.id, {hidden: true})
                    res.status(200).json({message: "hide product done"})
                }
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "hide product catch error!", error})
    }
    
}
const softDeleteProduct = async (req, res)=>
{
    try
    {
        const product = await productModel.findById(req.params.id)
        if(!product)
        {
            res.status(200).json({message: "Invalid product id"})
        }
        else 
        {
            if(product.createdBy.toString() == req.user._id.toString() || req.user.role == "Admin")
            {
                if(product.isDeleted) //undo
                {
                    //getIO().emit( 'addProduct' , [product])  
                    await productModel.findByIdAndUpdate(req.params.id, {isDeleted: false})
                    res.status(200).json({message: "undelete product done"})
                }
                else //delete
                {
                    getIO().emit( 'deleteProduct' , product)
                    await productModel.findByIdAndUpdate(req.params.id, {isDeleted: true})
                    res.status(200).json({message: "delete product done"})
                }
            }
            else
            {
                res.status(401).json({message: "Sorry you cannot delete this product!"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "delete product catch error!", error})
    }
    
}
const deleteProduct = async (req, res) =>
{
    try
    {
        const product = await productModel.findById(req.params.id)
        if(!product)
        {
            res.status(200).json({message: "Invalid product id"})
        }
        else //no need to check if it's soft deleted, this is perm. deleteion
        {
            if(product.createdBy.toString() == req.user._id.toString() || req.user.role == "Admin")
            {
                
                await productModel.findByIdAndDelete(product._id)
                await commentModel.deleteMany({product_id: product._id})
                await userModel.findByIdAndUpdate(product.createdBy, { $pull: {products: product._id}})
                
                getIO().emit( 'deleteProduct' , product)
                res.status(200).json({message: "product deleted successfully"})
            }
            else
            {
                res.status(401).json({message: "Sorry you are not authorized to delete this product!"})
            }
        }
        
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "delete post catch error!", error})
    }
}
const addToWishList = async (req, res)=>
{
    const product = await productModel.findById(req.params.id)
    if(product.wishList.includes(req.user._id)) //user already wishlist this product
    {
        //await productModel.findByIdAndUpdate(req.params.id, {$pull: {wishList: req.user._id} }) //remove it from wishlist 
        res.status(200).json({message: "This product is already in your wishlist!"})
    }
    else
    {
        await productModel.findByIdAndUpdate(req.params.id, {$push: {wishList: req.user._id} }) 
        await userModel.findByIdAndUpdate(req.user._id, {$push: {wishList: req.params.id} })
        res.status(200).json({message: "Product added to wishlist."})
    }
}
const removeFromWishList = async (req, res)=>
{
    const product = await productModel.findById(req.params.id)
    if(product.wishList.includes(req.user._id))
    {
        await productModel.findByIdAndUpdate(req.params.id, {$pull: {wishList: req.user._id} }) 
        await userModel.findByIdAndUpdate(req.user._id, {$pull: {wishList: req.params.id} })
        res.status(200).json({message: "Product removed from the wishlist"})
    }
    else
    {
        res.status(200).json({message: "This product is already not in your wishlist!"})
    }
}
const updateWithNewProducts = (req, res)=>
{
    try
    {
        //at the end of every day
        schedule.scheduleJob(" 59 59 23 * * * " , async function() 
        {
            const date = new Date()
            let newProducts = []
            const products = await productModel.find({}) 
            const Admins = await userModel.find({ role: "Admin" }).select('email -_id');

            for(let i = 0; i < products.length; i++) //searching for better way...
            {
                if( ((date - products[i].createdAt)/1000/60/60) <= 24 ) //less 24 hours
                {
                    newProducts.push(products[i])
                }
            }

            if(newProducts.length != 0)
            {
                const invoice = 
                {
                    sheet_number: 1234,
                    products: newProducts
                };
                createInvoice(invoice, path.join(__dirname, '../../../uploads/pdf/newProducts.pdf'));
                sendEmail(Admins, "New Product Report", `<p> Daily report of the new products. </p>`, [
                    {
                        filename: 'newProductsReport.pdf',
                        path: path.join(__dirname, '../../../uploads/pdf/newProducts.pdf')
                    }
                ])
            }
            /*  works but not necessary
            else
            {
                sendEmail(Admins, "New Product Report", `<p> No products added today. </p>`)
            } */
            
        }) 
        
        res.status(200).json({message: "Daily report sent successfully"})
    }
    catch(error)
    {
        res.status(500).json({message: "New products report catch error!", error: error.toString()})
    }
}

module.exports = 
{
    getAllProducts,
    createProduct,
    likeProduct,
    updateProduct,
    hideProduct,
    softDeleteProduct,
    deleteProduct,
    addToWishList,
    removeFromWishList,
    updateWithNewProducts
}