const { Roles } = require("../../middleware/auth")

const endPoints = 
{
    createProduct: [Roles.User, Roles.Admin], 
    updateProduct: [Roles.User, Roles.Admin], //admin can edit or delete his product but cannot do that with others
    deleteProduct: [Roles.User, Roles.Admin],
    likes: [Roles.User, Roles.Admin],
    hide: [Roles.User, Roles.Admin],
    wishlist: [Roles.User, Roles.Admin],
}
 
module.exports = endPoints