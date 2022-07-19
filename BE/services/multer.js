const multer = require('multer')
const path = require('path')
const {nanoid} = require('nanoid')
const fs =require('fs')
const fileValidation =
{
    any: ['image/jpeg', 'image/png', 'application/pdf'],
    image: ['image/jpeg', 'image/png'],
    pdf: ['application/pdf']
}

const handleMulterError = (error, req, res, next)=>
{
    if(error)
    {
        res.status(400).json({message: "multer ERROR", error})
    }
    else
    {
        next()
    }
}
function myMulter(customPath, customValidation)
{
    if(!customPath)
    {
        customPath = 'general'
    }
    const fullPath = path.join(__dirname, `../uploads/${customPath}`)
    if(!fs.existsSync(fullPath))
    {
        fs.mkdirSync(fullPath,{recursive: true})
    }
    
    const storage = multer.diskStorage({
        destination: function (req, file, cb) 
        {
            req.finalDestination = `/uploads/${customPath}`
            cb(null, fullPath)
        },
        filename: function(req, file, cb)
        {
            cb(null, nanoid()+'_'+file.originalname)
        }
      })
      

    function fileFilter (req, file, cb) 
    {
        if( customValidation.includes(file.mimetype))
        {
            cb(null, true)
        }
        else
        {
            req.fileError = true
            cb(null, false)
        }
    }

    const upload = multer({dest: fullPath, limits: {fileSize: 875000}, fileFilter, storage })
    return upload
}

module.exports =
{
    myMulter,
    fileValidation,
    handleMulterError
}