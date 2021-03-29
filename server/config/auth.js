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

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }

    res.redirect('/admins/login');
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/admins/advertisements');
    }

    next();
}

module.exports.validateSocket = validateSocket;
module.exports.checkAuthenticated = checkAuthenticated;
module.exports.checkNotAuthenticated = checkNotAuthenticated;