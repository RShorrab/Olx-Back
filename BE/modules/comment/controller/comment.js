const commentModel = require("../../../DB/models/comment")
const productModel = require("../../../DB/models/product")
const { getIO } = require("../../../services/socket")


const createComment = async (req, res)=>
{
    try
    { 
        const {comment_body} = req.body
        const {productID} = req.params
        const {_id} = req.user

        const product = await productModel.findOne({_id: productID})
        if(!product)
        {
            res.status(404).json({message: "invalid product id"})
        }
        else if(product.isDeleted == true)
        {
            res.status(409).json({message: "This product is deleted!"})
        }
        else if(product.hidden == true)
        {
            res.status(409).json({message: "This product is hidden now! pls contact the owner."})
        }
        else
        {
            const newComment = new commentModel({comment_body, commented_By: _id, product_id: productID})
            savedComment = await newComment.save()
            await productModel.findByIdAndUpdate(product._id, {$push: {comments: savedComment._id}})
            
            getIO().emit( 'addComment' , [newComment]) 
            res.status(200).json({message: "comment created", newComment})
        }
        
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "create comment failed!!", error: error.toString() })
    }
}

const replyOnComment = async (req, res)=>
{
    try
    {
        const {comment_body} = req.body
        const {productID, commentID} = req.params
        const {_id} = req.user

        const product = await productModel.findOne({_id: productID})
        if(!product)
        {
            res.status(404).json({message: "invalid product id"})
        }
        else
        {
            const comment = await commentModel.findOne({_id: commentID, product_id: product._id})
            if(!comment)
            {
                res.status(404).json({message: "invalid comment id"})
            }
            else if(comment.isDeleted == true)
            {
                res.status(409).json({message: "This comment is deleted!"})
            }
            else
            {
                const newComment = new commentModel({comment_body, commented_By: _id, product_id: productID, parentComment: commentID})
                const savedComment = await newComment.save()
                await commentModel.findByIdAndUpdate(commentID, {$push: {reply: savedComment._id}})

                getIO().emit( 'addReply' , newComment) 
                res.status(201).json({message: "reply created"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "reply on comment failed!!", error: error.toString() })
    }
}

const likeComment = async (req, res)=>
{
    try
    {
        const {commentID} = req.params
        const comment = await commentModel.findById(commentID)
        if(!comment)
        {
            res.status(404).json({message: "Invalid comment ID!"})
        }
        else if(comment.commented_By.toString() == req.user._id.toString()) //both of type [ new ObjectId("62a8da96705426fdb885dc37") ] .. better way to compare them?
        {
            res.status(401).json({message: "Sorry you cannot like your comment!"})
        }
        else
        {
            if(comment.likes.includes(req.user._id)) //unlike
            {
                await commentModel.findByIdAndUpdate(commentID, {$pull: {likes: req.user._id} })
                res.status(200).json({message: "unlike comment done"})
            }
            else //like
            {
                await commentModel.findByIdAndUpdate(commentID, {$push: {likes: req.user._id} })
                res.status(200).json({message: "like comment done"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "like comment catch error!"})
    }
}

const editComment = async (req, res)=>
{
    try
    {
        const {comment_body} = req.body
        const {commentID} = req.params
        const comment = await commentModel.findOne({_id: commentID})

        if(!comment)
        {
            res.status(404).json({message: "invalid comment id"})
        }
        else if(comment.commented_By.toString() != req.user._id.toString())
        {
            res.status(401).json({message: "Sorry you are not authorized to edit this comment!"})
        }
        else if(comment.isDeleted == true)
        {
            res.status(409).json({message: "This comment is deleted!"})
        }
        else
        {
            await commentModel.findByIdAndUpdate(commentID, {comment_body})
            res.status(200).json({message: "comment edited successfully"})
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "edit comment catch error!", error: error.toString()})
    }
}

const deleteComment = async (req, res)=>
{
    try
    {
        const comment = await commentModel.findById(req.params.commentID)
        if(!comment)
        {
            res.status(200).json({message: "Invalid comment id"})
        }
        else if(comment.isDeleted == true)
        {
            res.status(200).json({message: "Comment already deleted"})
        }
        else
        {
            if(comment.commented_By.toString() == req.user._id.toString() || req.user.role == "Admin")
            {

                if(comment.reply)
                {   //delete subComments too
                    await commentModel.deleteMany({parentComment: comment._id})
                } 

                await commentModel.findByIdAndDelete(comment._id) //comment
                await commentModel.findByIdAndUpdate(comment.parentComment, {$pull: {reply: comment._id}}) //parent comment if it's a reply
                await productModel.findByIdAndUpdate(comment.product_id, {$pull: {comments: comment._id}}) // product if it's a normal comment
                

                //getIO().emit('deleteComment', comment)
                res.status(200).json({message: "comment deleted successfully"})
            }
            else
            {
                res.status(401).json({message: "Sorry you are not authorized to delete this comment!"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "delete comment catch error!", error: error.toString()})
    }
}



module.exports = 
{
    createComment,
    replyOnComment,
    likeComment,
    deleteComment,
    editComment
}