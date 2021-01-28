const PasswordReset = require('../models/passwordReset');
const User = require('../models/user');
const {
    v4
} = require('uuid');
const bcrypt = require('bcryptjs');
const {
    sendEmail
} = require('../services/helpers');


module.exports.reset = async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    });
    /* Check if user with provided email exists. */
    if (!user) {
        return res.status(500).json({
            message: 'email not found',
            code: 'mail_not_found'
        });
    }
    /* Create a password reset token and save in collection along with the user. 
         If there already is a record with current user, replace it. */
    const token = v4().toString().replace(/-/g, '');
    PasswordReset.updateOne({
            user: user._id
        }, {
            user: user._id,
            token: token
        }, {
            upsert: true
        })
        .then(() => {
            /* Send email to user containing password reset link. */
            const resetLink = `${process.env.DOMAIN}/reset-confirm/${token}`;
            if (user.lang == 'fr') {
                sendEmail({
                    to: user.email,
                    subject: 'Réinitialisation de mot de passe',
                    text: `Bonjour ${user.username}, voici votre lien pour réinitialiser votre mot de passe: ${resetLink}. 
Si vous n'êtes pas à l'origine de cette demande, ignorez-la.`
                });
            } else if (user.lang == 'en') {
                sendEmail({
                    to: user.email,
                    subject: 'Password Reset',
                    text: `Hi ${user.username}, here's your password reset link: ${resetLink}. 
If you did not request this link, ignore it.`
                });
            } else if (user.lang == 'de') {
                sendEmail({
                    to: user.email,
                    subject: 'Passwort zurücksetzen',
                    text: `Hallo ${user.username}, hier ist dein Link zum Zurücksetzen deines Passworts: ${resetLink}. 
Wenn Sie nicht die Quelle dieser Anforderung sind, ignorieren Sie sie.`
                });
            }

            return res.status(200).json({
                emailSent: true
            });
        })
        .catch(() => {
            return res.status(500).json({
                emailSent: false,
                message: 'Failed to send email',
                code: 'failed_to_send_email'
            });
        });
};

module.exports.resetConfirmValid = async (req, res) => {
    const token = req.params.token;
    const passwordReset = await PasswordReset.findOne({
        token
    });
    if (passwordReset) {
        return res.status(200).json({
            linkValid: true
        });
    } else {
        return res.status(498).json({
            linkValid: false,
            message: 'Token is invalid or expired',
            code: 'invalid_link_set_new_password'
        });
    }
};

module.exports.resetConfirm = async (req, res) => {
    const token = req.params.token;
    const passwordReset = await PasswordReset.findOne({
        token
    });

    /* Update user */
    let user = await User.findOne({
        _id: passwordReset.user
    });

    bcrypt.hash(req.body.password, 5, (err, bcryptedPassword) => {
        user.password = bcryptedPassword;
        user.save().then(async () => {
            /* Delete password reset document in collection */
            await PasswordReset.deleteOne({
                _id: passwordReset._id
            });
            /* Send successful password reset email */
            if (user.lang == 'fr') {
                sendEmail({
                    to: user.email,
                    subject: 'Réinitialisation de mot passe réussie',
                    text: `Félicitations ${user.username}! Votre mot de passe a été réinitialisé.`
                });
            } else if (user.lang == 'en') {
                sendEmail({
                    to: user.email,
                    subject: 'Password Reset Successful',
                    text: `Congratulations ${user.username}! Your password reset was successful.`
                });
            } else if (user.lang == 'de') {
                sendEmail({
                    to: user.email,
                    subject: 'Passwort zurückgesetzt erfolgreich',
                    text: `Glückwunsch ${user.username}! Das Zurücksetzen Ihres Passworts war erfolgreich.`
                });
            }

            return res.status(200).json({
                passwordReseted: true
            });
        }).catch((error) => {

            return res.status(500).json({
                passwordReseted: false,
                error
            });
        });
    });

};
