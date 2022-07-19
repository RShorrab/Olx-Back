const dataMethod = ['body', 'params', 'query', 'file', 'headers']

const validation = (schema)=>
{
    return (req, res, next)=>
    {
        try
        {
            let errorList = []
            dataMethod.forEach( key =>
            {
                if(schema[key])
                {
                    const validationResault = schema[key].validate(req[key], {abortEarly: false})
                    if(validationResault.error)
                    {
                        errorList.push(validationResault.error.details)
                    }
                }
            })
            {errorList.length? res.status(400).json({message: "validation error", errorList}) : next()}

        }
        catch(error)
        {
            console.log('validation catch error', error);
            res.status(400).json({message: 'validation catch error', error: error.toString()})
        }
    }
}

module.exports = validation