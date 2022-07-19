function paginate(pageNumber, size, lastPage)
{
    if(!pageNumber || pageNumber <= 0)
    {
        pageNumber = 1
    }
    else if(pageNumber > lastPage)
    {
        pageNumber = lastPage
    }
        
    if(!size || size <= 0)
        size =1

    const skip = (pageNumber - 1) * size
    return {skip, limit: size, pageNumber}
}

module.exports = paginate

