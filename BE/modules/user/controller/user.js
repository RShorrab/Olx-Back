const userModel = require("../../../DB/models/user")
const sendEmail = require("../../../services/email")
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const QRCode = require("qrcode")


const updateProfile = async (req, res)=>
{
    try
    {
        let {firstName, lastName, email, phone} = req.body 
        const user = await userModel.findById(req.user._id)

        if(user.email==email)
        {
            await userModel.findOneAndUpdate({_id: user._id}, {firstName, lastName, phone})
            res.status(201).json({message: "profile updated"})
        }
        else
        {
            const existedUser = await userModel.findOne({email})
            if(existedUser) //repeated email
            {
                res.json({message: "this email belongs to another account!"}) 
            }
            else
            {
                await userModel.findOneAndUpdate({_id: user._id}, {firstName, lastName, email, phone, confirmed: false})                
                const token = jwt.sign({id: user._id}, process.env.EmailToken, {expiresIn: '1h'}) 
                const link1 = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}`
                const link2 = `${req.protocol}://${req.headers.host}/api/v1/auth/refreshEmail/${user._id}`
                const message = `<a href= '${link1}'> Confirm Email </a> </br>
                                <a href= '${link2}'> Resend confirmation Link </a>`
                sendEmail(email, "Confirmation Link", message)
                res.status(201).json({message: "profile updated, pls confirm ur email"})
            }
        }
        //res.status(201).json({message: "profile updated"}) //to handle if password only updated
    }
    catch(error)
    {
        console.log("update profile failed!" + error);
        res.status(400).json({message: "update profile failed!", error: error.toString()})
    }
    
}
//or update password separately
const updatePassword = async (req, res)=>
{
    try
    {
        const {oldPassword, newPassword} = req.body
        if(oldPassword == newPassword)
        {
            res.status(409).json({message: "New password cannot be the same as the old one!"})
        }
        else
        {
            const user = await userModel.findById(req.user._id)
            const match = await bcrypt.compare(oldPassword, user.password) 
            if(!match)
            {
                res.status(400).json({message: "wrong password!"})
            }
            else 
            {
                const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.SaltRound))
                await userModel.findByIdAndUpdate(user._id, {password: hashedPassword})
                res.status(200).json({message: "password updated successfully"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "update password failed!", error})
    }
}

const profilePic = async (req, res)=>
{
    try 
    { 
        if(req.fileError)
        {
            res.json({message: "invalid format"})
        }
        else
        {
            if(req.files.length != 0)
            {
                const imageURL = []
                req.files.forEach(file=>
                    {
                        imageURL.push(`${req.finalDestination}/${file.filename}`) 
                    })

                const user = await userModel.findByIdAndUpdate(req.user._id, {Profile_picture: imageURL}, {new:true})
                res.status(200).json({message: "Done", user})
            }
            else
            {
                res.status(409).json({message: "You should choose a profile pic"})
            }
        }
    }
    catch (error) 
    {
        res.status(500).json({message: "Profile_picture catch erroe", error: error.toString()})
    }
}
const profileCoverPic = async(req, res)=>
{
    try 
    {
        if(req.fileError)
        {
            res.json({message: "Invalid format"})
        }
        else
        {
            if(req.files.length != 0)
            {
                const imageURL = []
                req.files.forEach(file=>
                    {
                        imageURL.push(`${req.finalDestination}/${file.filename}`) 
                    })

                const user = await userModel.findByIdAndUpdate(req.user._id, {Cover_pictures: imageURL}, {new:true})
                res.status(200).json({message: "Done", user})
            }
            else
            {
                res.status(409).json({message: "You should choose a cover pic"})
            }
        }
    }
    catch (error) 
    {
        res.status(500).json({message: "Cover_pictures catch erroe", error: error.toString()})
    }
}
const deactivateAccount = async (req, res)=>
{
    try
    {
        const deletedAccount = await userModel.findById(req.params.id)
        if(!deletedAccount)
        {
            res.status(404).json({message: "invalid user account!"})
        }
        else if(deletedAccount._id.toString() == req.user._id.toString() || req.user.role == "Admin")
        {
            if(deletedAccount.expireAt)
            {
                res.status(400).json({meassage: "Account already deactivated"})
            }
            else
            {
                const current = new Date()
                const lastSeen = current.toLocaleString()
                current.setDate(current.getDate()+2) + current.setHours(23, 59, 00)
                const expireDate = new Date( current )

                const user = await userModel.findByIdAndUpdate(deletedAccount._id, {online: false, $set: {expireAt: expireDate, lastseen: lastSeen}})
                const token = jwt.sign({id: user._id}, process.env.ReactivationSignature, {expiresIn: '1h'})
                const link1 = `${req.protocol}://${req.headers.host}/api/v1/user/reactivate/${token}`
                const link2 = `${req.protocol}://${req.headers.host}/api/v1/user/refreshLink/${user._id}`
                const message = `<p> Deactivation done. you still have the opportunity to reactivate your account within the next 2 days... </p>
                                    <a href= '${link1}'> Reactivate </a> </br>
                                    <a href= '${link2}'> Resend reactivation link </a>` 
                
                sendEmail(user.email, "Account Deactivated", message).then( ()=> {res.status(200).json({message: "Deactivation done", lastseen: lastSeen}) }).catch( error=> { res.status(500).json({message: 'email error', error}); console.log('email error.....' + error) })
            }
        }
        else
        {
            res.status(401).json({message: "You aren't authorized to deactivate this account!"})
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "deactication catch error", error: error.toString()})
    }
}
const reactivateAccount = async(req, res)=>
{
    try
    {
        const {token} = req.params
        const decoded = jwt.verify(token, process.env.ReactivationSignature)
        if(!decoded)
        {
            res.status(400).json({message: "invalid token!"})
        }
        else
        {
            const user = await userModel.findById(decoded.id)
            if(user.expireAt)
            {
                await userModel.findByIdAndUpdate(decoded.id, {$unset: {expireAt: ""}})
                res.status(200).json({message: "Acount reactivated! pls login to access your account"})
            }
            else
            {
                res.status(400).json({message: "Account already reactivated"})
            }
        }
    }
    catch(error)
    {
        console.log("reactivation error...", error);
        res.status(500).json({message: "Reactivation Failed!", error: error.toString()})
    }
}
const refreshActivationLink = async (req, res)=>
{
    try
    {
        const {id} = req.params
        const user = await userModel.findById(id).select('expireAt email')
        if(!user)
        {
            res.status(404).json({message: "invalid user!"})
        }
        else
        {
            if(user.expireAt)
            {
                const token = jwt.sign({id: user._id}, process.env.ReactivationSignature, {expiresIn: '5m'})
                const link1 = `${req.protocol}://${req.headers.host}/api/v1/user/reactivate/${token}`
                const link2 = `${req.protocol}://${req.headers.host}/api/v1/user/refreshLink/${user._id}`
                const message = `<p> Reactivate your account using the below link. </p>
                                    <a href= '${link1}'> Reactivate </a> </br>
                                    <a href= '${link2}'> Resend reactivation link </a>` 
                
                sendEmail(user.email, "Reactivate Account", message).then( ()=> {res.status(200).json({message: "Another Link has been sent, pls check ur email!"}) }).catch( error=> { res.status(500).json({message: 'email error', error}); console.log('email error.....' + error) })
            }
            else
            {
                res.status(400).json({message: "account already reactivated!"})
            }
        }
    }
    catch(error)
    {
        console.log("Refresh reactivation link error...", error);
        res.status(500).json({message: "Refresh reactivation link failed!", error})
    }
}
const deleteAccount = async (req, res)=>
{
    try
    {
        const deletedAccount = await userModel.findById(req.params.id)
        if(!deletedAccount)
        {
            res.status(404).json({message: "invalid user account or account is already deleted!"})
        }
        else if(deletedAccount._id.toString() == req.user._id.toString() || req.user.role == "Admin") //account owner or admin
        {
            const message = `<p> Your account has been permanently deleted. </p>`
            sendEmail(deletedAccount.email, "Account Deleted", message)
            await userModel.findByIdAndDelete(deletedAccount._id)
            res.status(200).json({message: "Account has been permanently deleted"}) 
        }
        else
        {
            res.status(401).json({message: "You aren't authorized to delete this account!"})
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "delete account catch error", error: error.toString()})
    }
}
const profileQR = async (req, res)=>
{
    const user = await userModel.findOne({_id: req.params.id}).select("userName email phone age gender")
    const userUrl = `${req.protocol}://${req.headers.host}/api/v1/user/profile/${user._id}`

    QRCode.toDataURL(`${user}`, async function (err, url)
    {
        if(err)
            res.status(400).json({message: "QR error", err})
        else
        {
            await userModel.findByIdAndUpdate(user._id, {Qr_code: url})
            res.status(200).send(
                `<div style="background-color:powderblue; color: blue; text-align:center; padding: 20px 0px; font-family:courier;">
                    <h1  style="font-family:verdana;" > Simple User Profile </h1> 
                    <img src="${url}" alt="User data QR" style="margin-bottom: 10px" >  </br>
                    <p> Note: This is just a test, till find a way to deal with html pages </p>
                </div>
            `) //<a href="${userUrl}" target="_blank"  style="text-decoration: none; color: blue;" > <b> User profile Link </b> </a>
        }
    }) 
}

module.exports = 
{
    updateProfile,
    updatePassword,
    profilePic,
    profileCoverPic,
    deactivateAccount,
    reactivateAccount,
    refreshActivationLink,
    deleteAccount,
    profileQR
}