const { Roles } = require("../../middleware/auth");

const endpoints = 
{
    signout: [Roles.User, Roles.Admin],
}

module.exports = endpoints