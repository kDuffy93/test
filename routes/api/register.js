var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../../models/user');

// Register function



router.post('/', (req, res) => {
    console.log('post to register')
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            res.status(402).json(err);
        }
        const authenticate = User.authenticate();

        authenticate(req.body.username, req.body.password, function (err, result) {
            if (err) {
                res.status(401).json(err);
            }
            if (result) {
                res.status(200).json(user);
            }
            // Value 'result' is set to false. The user could not be authenticated since the user is not active
        });
    });
});

module.exports = router;
