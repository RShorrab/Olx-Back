const userModel = require("../../../DB/models/user")
const sendEmail = require("../../../services/email")
const schedule = require('node-schedule');
const paginate = require("../../../services/paginate");


const getAllUsers = async(req, res)=>
{
    const count = await userModel.find().count()
    const {page, size} = req.query
    const lastPage = Math.ceil(count / size)
    const {skip, limit, pageNumber} = paginate(page, size, lastPage)

    const users = await userModel.find({}).select('firstName lastName role products -_id').skip(skip).limit(limit).populate([
        {
            path: "products",
            select: "product_title product_desc product_price image likes comments -_id",
            populate: 
            [
                {
                    path: "likes",
                    select: "firstName lastName email -_id"
                },
                {
                    path: "comments",
                    select: "comment_body commented_By likes reply -_id", 
                    populate: 
                    [
                        { //user
                            path: "commented_By",
                            select: "firstName lastName email -_id"
                        },
                        { //likes
                            path: "likes",
                            select: "firstName lastName email -_id"
                        },
                        { //replies L1
                            path: "reply",
                            select: "comment_body commented_By likes reply -_id", 
                            populate:
                            [
                                {
                                    path: "commented_By",
                                    select: "firstName lastName email -_id"
                                },
                                {
                                    path: "likes",
                                    select: "firstName lastName email -_id"
                                },
                                { //replies L2
                                    path: "reply",
                                    select: "comment_body commented_By likes -_id",
                                    populate:
                                    [
                                        {
                                            path: "commented_By",
                                            select: "firstName lastName email -_id"
                                        },
                                        {
                                            path: "likes",
                                            select: "firstName lastName email -_id"
                                        }
                                    ]
                                }

                            ]
                        }
                    ]
                }
            ]
        }
    ])
    res.status(200).json({page: pageNumber, users})
}
const updateRole = async (req, res)=>
{
    const {id} = req.params 
    const {role} = req.body
    const user = await userModel.findOne({_id: id})
    if(!role)
    {
        res.status(400).json({message: "you must enter a role!"})
    }
    else if(role == user.role)
    {
        res.status(400).json({message: "Cannot update a user with its same role!"})
    }
    else
    {
        await userModel.findByIdAndUpdate(id, {role}, {new: true})
        sendEmail(user.email, "Role Updated", `<p> your role has been updated to ${role} </p>`)
        res.status(200).json({message: "user role updated"})
    }
    
} 
const blockUser = async (req, res)=>
{
    try
    {
        const {id} = req.params
        const user = await userModel.findOne({_id: id})
        
        if(!user)
        {
            res.status(404).json({message: "Invalid user!", error})
        }
        else
        {
            if(user.role == req.user.role)
            {
                res.status(401).json({message: "Sorry, you cannot block user with the same role!"})
            }
            else
            {
                if(user.isBlocked) //unblock him
                {
                    await userModel.findByIdAndUpdate(id, {isBlocked: false})
                    sendEmail(user.email, "Account Unblocked", `<p> your account has been unblocked, you can login now! </p>`)
                    res.status(200).json({message: "Account unblocked"})
                }
                else //block him
                {
                    await userModel.findByIdAndUpdate(id, {isBlocked: true})
                    sendEmail(user.email, "Account Blocked", `<p> your account has been blocked, pls contact support to unblock your account </p>`)
                    res.status(200).json({message: "Account blocked"})
                }
            }
        }
        
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "Block account failed!", error})
    }
    
}  
const softDeleteUser = async (req, res)=>
{
    try
    {
        const {id} = req.params
        const user = await userModel.findOne({_id: id})
        
        if(!user)
        {
            res.status(404).json({message: "Invalid user!", error})
        }
        else
        {
            if(user.role == req.user.role)
            {
                res.status(401).json({message: "Sorry, you cannot delete user with the same role!"})
            }
            else
            {
                if(user.isDeleted) //delete him
                {
                    await userModel.findByIdAndUpdate(id, {isDeleted: false})
                    sendEmail(user.email, "Account Undeleted", `<p> your account has been undeleted, you can login now! </p>`)
                    res.status(200).json({message: "Account undeleted"})
                }
                else //undelete him
                {
                    await userModel.findByIdAndUpdate(id, {isDeleted: true})
                    sendEmail(user.email, "Account Deleted", `<p> your account has been temporary deleted, pls contact support to undelete your account </p>`)
                    res.status(200).json({message: "Account deleted"})
                }
            }
        } 
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "Delete account failed!", error: error.toString()})
    }
}  

const setSchedule = (req, res) =>
{    
    //Create pdf contain id, title, desc, price of every product created today and send this pdf every day at 11:59:59 to the admin

    schedule.scheduleJob(" * * * * * * " , function() 
    {
        console.log('Hello from console!');
    })
    
    res.json({message: "done check the console"})   
}  


module.exports = 
{
    getAllUsers,
    updateRole,
    blockUser,
    softDeleteUser,
    
}