const jwt = require('jsonwebtoken');

// validate the socket, return true if valid and false if not valid
function validateSocket(socket) {
    try{
        const verifiedUser = jwt.verify(socket.handshake.query.token, process.env.JWT_TOKEN);
        return true;
    }
    catch(er){
        //console.log(er);
        return false;
    }
}

module.exports.validateSocket = validateSocket;