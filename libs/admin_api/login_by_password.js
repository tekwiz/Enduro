// * ———————————————————————————————————————————————————————— * //
// * 	login by password
// *
// * 	admin api endpoint admin_api/login_by_password
// *	@return {response} - success boolean and session info
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const admin_security = require('../admin_utilities/admin_security')

// routed call
module.exports = function login_by_password (req, res) {
	const username = req.query.username
	const password = req.query.password

	req.logger.debug({ username: username }, 'Login')

	if (!password || !username) {
		return res.json({ success: false, message: 'missing parameter(s)' })
	}

	admin_security.login_by_password(username, password).then((user) => {
		req.logger.info({ username: username }, 'Login successful')
		req.user = user
		req.session.username = username
		req.logger.trace({ username: username }, 'Session created')
		res.json({
			success: true,
			username: req.user.username,
			created: (new Date()).toISOString(),
			expires_at: req.session.cookie.expires,
			sid: req.session.id
		})
	}, (err) => {
		req.logger.error(err, { username: username }, 'Login failed')
		res.json({ success: false })
	})
}
