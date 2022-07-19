const joi = require('joi')

const checkAuth=
{ 
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true})
}
const signupValidation =
{
    body: joi.object().required().keys(
        {
            firstName: joi.string().min(3).max(50).required(),
            lastName: joi.string().min(3).max(50).required(),
            email: joi.string().email().required(),
            password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
            cpassword: joi.string().valid(joi.ref('password')).required()
        })
}
const signinValidation = 
{
    body: joi.object().required().keys(
        {
            email: joi.string().email().required(),
            password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
        })
}
const forgetPassword = 
{
    body: joi.object().required().keys(
        {
            email: joi.string().email().required(),
            code: joi.number().required(),
            newPassword: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
            cPassword: joi.string().valid(joi.ref("newPassword")).required()
        })
}
const sendCode = 
{
    body: joi.object().required().keys(
        {
            email: joi.string().email().required(),
        })
}


module.exports = 
{
    checkAuth,
    signupValidation,
    signinValidation,
    forgetPassword,
    sendCode,
}