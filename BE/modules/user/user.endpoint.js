const { Roles } = require("../../middleware/auth");

const endpoints = 
{
    displayProfile: [Roles.User, Roles.Admin], 
    updateProfile: [Roles.User, Roles.Admin], //admin can update his profile, but not others
    deactivate: [Roles.User, Roles.Admin],
    deleteAccount: [Roles.User, Roles.Admin],
}

module.exports = endpoints