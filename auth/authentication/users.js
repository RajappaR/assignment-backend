const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../../utils/auth');
const Users = mongoose.model('Users');

//POST new user route (optional, everyone has access)
router.post('/register', auth.optional, async (req, res, next) => {
    const user= req.body;

    if (!user.userName) {
        return res.status(422).json({
            errors: {
                userName: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    let tempUser = await Users.findOne({ userName: req.body.userName }).lean();
    if (tempUser) {
        return res.status(400).send({ 'msg': 'username already exist' });
    }

    const finalUser = new Users(user);

    finalUser.setPassword(user.password);

    return finalUser.save()
        .then(() => {
            
            let createdUser = finalUser.toAuthJSON();
            res.json({user: finalUser.toAuthJSON()});
    
    
    });
        
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
    const {
        body: {
            user
        }
    } = req;

    if (!user.userName) {
        return res.status(422).json({
            errors: {
                userName: 'is required',
            },
        });
    }

    if (!user.password) {
        return res.status(422).json({
            errors: {
                password: 'is required',
            },
        });
    }

    return passport.authenticate('local', {
        session: false
    }, (err, passportUser, info) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (passportUser) {
            const user = passportUser;
            user.token = passportUser.generateJWT();

            return res.json({
                user: user.toAuthJSON()
            });
        }

        return res.status(500).json(info);
    })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
    const {
        payload: {
            id
        }
    } = req;

    return Users.findById(id)
        .then((user) => {
            if (!user) {
                return res.sendStatus(400);
            }

            return res.json({
                user: user.toAuthJSON()
            });
        });
});

module.exports = router;