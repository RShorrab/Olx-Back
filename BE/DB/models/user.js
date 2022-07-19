const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}, 
    role: {type: String, default: 'User'},

    phone: String,
    Qr_code: String, 
    Profile_picture: Array,
    Cover_pictures: Array,
    products: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    wishList: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    confirmed: {type: Boolean, default: false},
    isBlocked: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    online: {type: Boolean, default: false},
    
    lastseen: Date,
    expireAt: Date,
    code: String,

}, {timestamps: true})

userSchema.pre('save', async function(next)
{    
    this.password = await bcrypt.hash(this.password, parseInt(process.env.SaltRound))
    next()
})

userSchema.pre('findOneAndUpdate', async function(next)
{
    const hookData = await this.model.findOne(this.getQuery()).select('__v')
    this.set({__v: hookData.__v +1})
    next()  
})


const userModel = mongoose.model('User', userSchema)
module.exports = userModel