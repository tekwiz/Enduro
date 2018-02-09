// * ———————————————————————————————————————————————————————— * //
// * 	Check session
// *
// * 	Admin api endpoint admin_api/check_session
// *	@return {response} - Success boolean and user info
// * ———————————————————————————————————————————————————————— * //
// * enduro dependencies
const logger = require('../logger')

// routed call
module.exports = function check_session (req, res) {
	if (req.user) {
		res.json({ success: true, user: req.user })
	} else {
		logger.err(`check_session failed`)
		res.json({ success: false, message: 'no user' })
	}
}
