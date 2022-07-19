let io;
const initIO = (server)=>
{
    io = require("socket.io")(server, {cors: '*'})
    return io
}
const getIO = ()=>
{
    if(!io)
    {
        console.log({massage: "invalid io"});
    }
    else
    {
        return io
    }
}

module.exports = 
{
    initIO,
    getIO
}