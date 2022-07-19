const joi = require('joi')


const updateProfile =
{
    body: joi.object().required().keys(
        {
            firstName: joi.string().min(3).max(50),
            lastName: joi.string().min(3).max(50),
            phone: joi.string().pattern(new RegExp(/^01[0125][0-9]{8}$/)), //Egyptian 
            email: joi.string().email(),
        }), 
    headers: joi.object().required().keys(
        {
            authorization: joi.string().required().messages({
                "any.required": "You should Sign in!"
            })
        }).options({allowUnknown: true})
}
const updatePassword =
{
    body: joi.object().required().keys(
        {
            oldPassword: joi.string().required().pattern(new RegExp(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
            newPassword: joi.string().required().pattern(new RegExp(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)),
            cPassword: joi.string().valid(joi.ref('newPassword')).required().messages({
                "any.only" : "cPassword doesn't match!"
            })
        }), 
    headers: joi.object().required().keys(
        {
            authorization: joi.string().required().messages({
                "any.required": "You should Sign in!"
            })
        }).options({allowUnknown: true})
}
const deactivateAccount = 
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
const reactivateAccount = 
{
    params: joi.object().required().keys({
        token: joi.string().required()
    }).options({allowUnknown: true})
}
const refreshActivationLink = 
{
    params: joi.object().required().keys({
        id: joi.string().required()
    }).options({allowUnknown: true})
}
const deleteAccount = 
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
    updateProfile,
    updatePassword,
    deactivateAccount,
    reactivateAccount,
    refreshActivationLink,
    deleteAccount,
}