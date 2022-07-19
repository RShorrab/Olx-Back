const joi = require('joi')

const createProduct = 
{
    body: joi.object().required().keys({
        product_title: joi.string().required(),
        product_desc: joi.string().required(),
        product_price: joi.number().required(),
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true})
} 
const updateProduct = 
{
    body: joi.object().required().keys({
        product_title: joi.string(),
        product_desc: joi.string(),
        product_price: joi.number(),
    }),
    params: joi.object().required().keys({
        id: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true}),
}
const deleteProduct =
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

const likes = 
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
const hide = 
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
const wishList = 
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
    createProduct,
    updateProduct,
    deleteProduct,
    likes,
    hide,
    wishList
}
