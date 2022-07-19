const joi = require('joi')


const createComment = 
{
    body: joi.object().required().keys({
        comment_body: joi.string().min(1).required()
    }),
    params: joi.object().required().keys({
        productID: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true}),
}
const editComment = 
{
    body: joi.object().required().keys({
        comment_body: joi.string().min(1).required()
    }),
    params: joi.object().required().keys({
        commentID: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true}),
}
const replyOnComment = 
{
    body: joi.object().required().keys({
        comment_body: joi.string().min(1).required()
    }),
    params: joi.object().required().keys({
        productID: joi.string().min(24).max(24).required(),
        commentID:joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true})
}
const like = 
{
    params: joi.object().required().keys({
        commentID: joi.string().min(24).max(24).required()
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true})
}
const deleteComment =
{
    params: joi.object().required().keys({
        commentID: joi.string().min(24).max(24).required(),
    }),
    headers: joi.object().required().keys({
        authorization: joi.string().required().messages({
            "any.required": "You should Sign in!"
        })
    }).options({allowUnknown: true})
}



module.exports = 
{
    createComment,
    editComment,
    replyOnComment,
    deleteComment, 
    like,
}
