const { Roles } = require("../../middleware/auth");

const endpoints = 
{
    getAllUsers : [Roles.Admin],
    updateRole: [Roles.Admin],
    blockUser: [Roles.Admin],
    softDeleteUser: [Roles.Admin],
}

module.exports = endpoints