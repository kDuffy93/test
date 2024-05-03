var express = require('express');
var router = express.Router();
const passport = require('passport');
const User = require('../../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
 
});



router.post('/', (req, res) => {
    console.log('post to login');
    console.log(req);
        const authenticate = User.authenticate();
        authenticate(req.body.username, req.body.password, function (err, result) {
            console.log(result);
            if (!result) {
                console.log(err);
                res.status(401).json({message: 'Username or Password is incorrect'});
            }
            if (result) {
                res.status(200).json(result);
            }
        });

});



module.exports = router;
