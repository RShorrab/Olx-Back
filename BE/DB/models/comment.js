const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
   comment_body: String, 
   commented_By: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true}, //array of objectIDs!
   product_id: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true}, //array of objectIDs!
   likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],

   reply: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
   parentComment: {type: mongoose.Schema.Types.ObjectId, ref: 'Comment'},
   isDeleted: {type: Boolean, default: false},
   
}, {timestamps: true})

commentSchema.pre('findOneAndUpdate', async function(next)
{
    const hookData = await this.model.findOne(this.getQuery()).select('__v')
    this.set({__v: hookData.__v +1})
    next()  
})

const commentModel = mongoose.model('Comment', commentSchema)
module.exports = commentModel