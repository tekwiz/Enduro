// * ———————————————————————————————————————————————————————— * //
// * 	login by password
// *
// * 	admin api endpoint admin_api/login_by_password
// *	@return {response} - success boolean and session info
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const admin_security = require(enduro.enduro_path + '/libs/admin_utilities/admin_security')
const logger = require(enduro.enduro_path + '/libs/logger')

// routed call
module.exports = function login_by_password (req, res) {
	const username = req.query.username
	const password = req.query.password

	logger.timestamp(`${username} is trying to log in`, 'admin_login')

	if (!password || !username) {
		return res.json({ success: false, message: 'missing parameter(s)' })
	}

	admin_security.login_by_password(username, password).then((user) => {
		logger.timestamp(`${username} successfully logged in`, 'admin_login')
		req.user = user
		req.session.username = username
		logger.timestamp(`session created for ${username}`, 'admin_login')
		res.json({
			success: true,
			username: req.user.username,
			created: (new Date()).toISOString(),
			expires_at: req.session.cookie.expires,
			sid: req.session.id
		})
	}, (err) => {
		logger.err(`${username} failed to log in`, 'admin_login', err)
		res.json({ success: false })
	})
}
