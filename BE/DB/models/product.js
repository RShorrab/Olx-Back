const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
   product_title: {type: String, required: true},
   product_desc: {type: String, required: true},
   product_price: {type: Number, required: true}, //easy to display diff. currency
   image: {type: Array, required: true}, 
   
   createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required:true},
   likes: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
   comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
   wishList: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
   Qr_code: String,
   
   isDeleted: {type: Boolean, default: false},
   hidden: {type: Boolean, default: false}, 
   
}, {timestamps: true})

productSchema.pre('findOneAndUpdate', async function(next)
{
    const hookData = await this.model.findOne(this.getQuery()).select('__v')
    this.set({__v: hookData.__v +1})
    next()  
})


const productModel = mongoose.model('Product', productSchema)
module.exports = productModel