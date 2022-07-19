const { Roles } = require("../../middleware/auth")

const endPoints = 
{
    createComment: [Roles.User, Roles.Admin],    
    deleteComment: [Roles.User, Roles.Admin],
    editComment: [Roles.User, Roles.Admin], 
    like: [Roles.User, Roles.Admin], 
}
 
module.exports = endPoints