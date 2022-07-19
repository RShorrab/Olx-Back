const mongoose = require('mongoose')

const DBConnection = () =>
{
    return mongoose.connect(process.env.DBURL).then( console.log('DB connected') ).catch(error => console.log('connection failed', error))
}

module.exports = DBConnection