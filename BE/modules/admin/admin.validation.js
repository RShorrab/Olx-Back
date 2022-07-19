const joi = require('joi')


const getAllUsers = 
{
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true})
}
const updateRole = 
{
    body: joi.object().required().keys({
        role: joi.string().valid("User","Admin").required(),
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true}),

    params: joi.object().required().keys({
        id: joi.string().required()
    })
}
const blockUser = 
{
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true}),

    params: joi.object().required().keys({
        id: joi.string().required()
    })
} 
const softDeleteUser = 
{
    params: joi.object().required().keys({
        id: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true})
}


module.exports = 
{
    getAllUsers,
    updateRole,
    blockUser,
    softDeleteUser
}