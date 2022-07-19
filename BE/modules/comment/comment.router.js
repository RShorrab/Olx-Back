const router = require('express').Router()
const commentController = require('./controller/comment')

const { auth } = require('../../middleware/auth')
const validation = require('../../middleware/validation')
const endpoints = require('./comment.endpoint')
const validators = require("./comment.validation")

/*  product/   */
router.post('/:productID/createComment', auth(endpoints.createComment), validation(validators.createComment), commentController.createComment)
router.post('/:productID/comment/:commentID/reply', auth(endpoints.createComment), validation(validators.replyOnComment), commentController.replyOnComment)
router.patch('/comment/:commentID/editComment', auth(endpoints.editComment), validation(validators.editComment), commentController.editComment)
router.patch('/comment/:commentID/like', auth(endpoints.like), validation(validators.like), commentController.likeComment)
router.delete('/comment/:commentID/deleteComment', auth(endpoints.deleteComment), validation(validators.deleteComment), commentController.deleteComment)



module.exports = router


/*
    **Comment APIs:
        - Add comment ( if there is a comment added, it must reflected in all pages which open the same website in real time using socket io ) 
        • Add reply in comment 
        • Update comment ( by comment owner only )
        • Delete comment ( by comment owner and product owner ) 
        • Like/unlike comment 
*/