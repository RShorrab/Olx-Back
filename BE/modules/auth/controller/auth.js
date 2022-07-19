const userModel = require("../../../DB/models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require("../../../services/email");


const signup = async (req, res)=>
{
    try 
    {
        const current = new Date()
        current.setDate(current.getDate() + 2) + current.setHours(23, 59, 00)
        const expireDate = new Date( current ) //to convert primitive number to readable date

        const {firstName, lastName, email, password} = req.body
        const user = new userModel({firstName, lastName, email, password, expireAt: expireDate })
        const savedUser = await user.save()
        const token = jwt.sign({id: savedUser._id}, process.env.EmailToken, {expiresIn: '1h'}) 
        const link1 = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}`
        const link2 = `${req.protocol}://${req.headers.host}/api/v1/auth/refreshEmail/${savedUser._id}`
        const message = `<p> Signup Done. Please confirm your email within the next 2 days to avoid being deleted... </p>
                         <a href= '${link1}'> Confirm Email </a> </br>
                         <a href= '${link2}'> Resend confirmation Link </a>` 
        
        sendEmail(savedUser.email, "Signup Confirmation", message)
            .then( ()=> {res.status(200).json({message: "Signup done, pls confirm ur email"});  console.log("email sent successfully")} )
            .catch( error=> { res.status(500).json({message: 'Email error', error}); console.log('nodemailer error...' + error) })
        
    } 
    catch (error) 
    {
        if(error.keyValue?.email)
        {
            res.status(409).json('Email exist')
        }
        else
        {
            console.log('Signup catch error...'+ error);
            res.status(500).json({message: "Signup catch error", error})
        } 
    }
}
const refreshEmail = async(req, res)=>
{
    try 
    {
        const id= req.params.id
        const user = await userModel.findById(id).select('confirmed email')
        if(!user)
        {
            res.status(404).json({message: "Invalid account"})
        }
        else
        {
            if(user.confirmed)
            {
                res.status(400).json({message: "Email already confirmed"})
            }
            else
            {
                const token = jwt.sign({id: user._id}, process.env.EmailToken, {expiresIn: 120}) 
                const link1 = `${req.protocol}://${req.headers.host}/api/v1/auth/confirmEmail/${token}`
                const link2 = `${req.protocol}://${req.headers.host}/api/v1/auth/refreshEmail/${user._id}`
                const message = `<a href= '${link1}'> Confirm Email </a> </br>
                                <a href= '${link2}'> Resend confirmation Link </a>`
                sendEmail(user.email, "Confirmation Link", message)
                res.status(200).json({message: "Done check ur email"})
            }
        }
    }
    catch (error) 
    {
        console.log('refresh catch error...' + error)
        res.status(500).json({message: "refresh confirmation link failed!", error})
    }
}
const confirmEmail = async(req, res)=>
{
    try
    {
        const {token} = req.params
        const decoded = jwt.verify(token, process.env.EmailToken)
        if(!decoded)
        {
            res.status(400).json({message: 'Invaild token'})
        }
        else
        {
            const user = await userModel.findById(decoded.id).select('confirmed')
            if(!user)
            {
                res.status(404).json({message: 'Invaild token id'})
            }
            else
            {
                if(user.confirmed)
                {
                    res.status(400).json({message: 'Email already confirmed'})
                }
                else
                {
                    await userModel.findByIdAndUpdate({_id: user._id}, {confirmed: true, $unset: {expireAt: ""}})
                    res.status(200).json({message: 'Email confirmed, you can signin now'})
                }
            }
        }
    }
    catch(error)
    {
        if(error.name == 'TokenExpiredError')
        {
            res.status(500).json({message: 'Token Expired!', error})
        }
        else
        {
            console.log(error);
            res.status(400).json({message: 'Email cofirmation failed', error})
        }
    }
}

const signin = async (req, res)=>
{
    try
    {
        
        const {email, password} = req.body;
        const user = await userModel.findOne({email})
        if(!user)
        {
            res.status(404).json({message: "Invalid user!"})
        }
        else
        {
            const match = await bcrypt.compare(password, user.password)
            if(match)
            {
                if(!user.confirmed)
                {
                    res.status(403).json({message: "Plz confirm your email first"})
                }
                else if(user.expireAt)
                {
                    res.status(403).json({message: "Account had been deactivated! please reactivate it to access your account"})
                }
                else if(user.isBlocked)
                {
                    res.status(403).json({message: "User's been blocked! plz contact us to be able to signin"})
                }
                else if(user.isDeleted)
                {
                    res.status(403).json({message: "Account had been deleted!"})
                }
                else
                {
                    await userModel.updateOne({_id: user._id}, {online: true, $unset: {lastseen: ""}}) 
                    const token = jwt.sign({id: user._id, isLoggedin: true, online: true}, process.env.loginSignature, {expiresIn: '1h'})
                    res.status(200).json({message: "Login succeeded", token})
                }
            }
            else
            {
                res.status(400).json({message: "Wrong password!"})
            }
            
        }
    }
    catch(error)
    {
        res.status(500).json({message: "Login catch error"})
    }
}
const signout = async (req, res)=>
{
    try
    {
        const current = new Date()
        await userModel.findByIdAndUpdate(req.user._id, {online: false, $set: {lastseen: current.toLocaleString()} }) //no need to check user existance 
        res.status(200).json({message: "Signout done", lastseen: current.toLocaleString()})      
        //m4 logic eni a-check for re-signout .. kda kda h-redirect 3la login page   
    }
    catch(error)
    {
        console.log('Signout error...' + error);
        res.status(500).json({message: "Signout failed", error})
    }
}

const forgetPassword = async (req, res)=>
{
    try
    {
        const {code, email, newPassword} = req.body
        const user = await userModel.findOne({email})
        if(!user)
        {
            res.status(404).json({message: "Invalid email"})
        }
        else
        {
            if(!user.code)
            {
                res.status(404).json({message: "No code found! you should ask for sending a code."})
            }
            else if(user.code != code)
            {
                res.status(400).json({message: "Invalid code"})
            }
            else
            {
                const hashedPassword =  await bcrypt.hash(newPassword, parseInt(process.env.SaltRound))
                await userModel.findOneAndUpdate({_id: user._id}, {password: hashedPassword, $unset: {code: ""} })
                res.status(200).json({message: "Password updated"})
            }
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "Update forgotten password failed!", error: error.toString()})
    }
}
const sendCode = async (req, res)=>
{
    try
    {
        const {email} = req.body
        const user = await userModel.findOne({email})
        if(!user)
        {
            res.status(404).json({message: "Invalid email"})
        }
        else
        {
            const code = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000) 
            await userModel.findByIdAndUpdate(user._id, {code})
            sendEmail(user.email, "Update Password", `<p> use this code to update your password: ${code} </p>`)
            res.status(200).json({message: "Code sent, check ur email"})
        }
    }
    catch(error)
    {
        console.log(error);
        res.status(500).json({message: "Send code failed!", error})
    }
}

module.exports = 
{
    signup,
    refreshEmail,
    confirmEmail,
    signin,
    signout,
    forgetPassword,
    sendCode
}