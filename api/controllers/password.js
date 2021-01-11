const User = require('../models/user');
const bcrypt = require('bcryptjs');
const {
    MissingRequiredParameterError,
    BadCredentialsError
} = require('../errors');

const PASSWORD_REGEX = /^(?=.*\d).{4,15}$/;



/**
 * Example controller to get information about request.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
module.exports.password = async (req, res) => {
        const {
            newPassword,
            oldPassword,
            username
        } = req.body;
        // Check parameters
        if (newPassword == null || oldPassword == null || username == null) {
            throw new MissingRequiredParameterError({
                info: {
                    body: ['oldPassword, newPassword']
                }
            });
        }

        // validate password
        if (!PASSWORD_REGEX.test(newPassword)) {
            return res.status(400).json({
                'error': 'new password invalid (must length 4-15 and include 1 number)'
            });
        }

        const user = await User.find({
            username: username
        }).exec();

        if (user != '') {
            console.log('user[0]._id', user[0]._id);
            var resBcrypt = await bcrypt.compare(oldPassword, user[0].password);
                if (!resBcrypt) {
                    return res.status(401).json({
                        'error': 'Wrong old password'
                    });
                } else {
                    bcrypt.hash(newPassword, 5, (err, bcryptedPassword) => {
                        User.findByIdAndUpdate(user[0]._id, {
                            password: bcryptedPassword
                        },
                        (err, result) => {
                            console.log(result);
                          if (err) {
                            return res.status(500).json(err);
                          } else{
                            return res.status(200).json({message: 'Password Changed'});
                          }
                        })
                    });
                }
        } else {
            return res.status(401).json({
                'error': 'Invalid user'
            });
        }
};