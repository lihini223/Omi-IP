const LocalStrategy = require('passport-local').Strategy;

const Admin = require('../models/Admin');

function initialize(passport){
    const authenticateUser = async (email, password, done) => {
        try{
            const user = await Admin.findOne({ email: email });

            if (!user) return done(null, false, { message: 'Invalid credentials' });

            if (password == user.password) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch(error) {
            return done(error);
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser));

    passport.serializeUser((user, done) => done(null, user.id));
    
    passport.deserializeUser((id, done) => {
        Admin.findById(id, (err, user) => {
            return done(err, user);
        });
    });
}

module.exports = initialize;