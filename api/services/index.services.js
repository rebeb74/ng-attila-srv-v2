// Exported functions
module.exports = {

    checkTokenUserId: (tokenUserId, res) => {
        if (tokenUserId == -1) {
            return res.status(403).json({
                message: 'bad token or expired token'
            });
        }
    }
};