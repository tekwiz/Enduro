// * ———————————————————————————————————————————————————————— * //
// * 	Enduro Admin login sessions
// * ———————————————————————————————————————————————————————— * //
const admin_sessions = function () {}

// * enduro dependencies
const admin_security = require(enduro.enduro_path + '/libs/admin_utilities/admin_security')
const logger = require(enduro.enduro_path + '/libs/logger')

admin_sessions.prototype.create_session = function (req, user) {
	return new Promise(function (resolve, reject) {
		logger.timestamp('creating session for: ' + JSON.stringify(user), 'admin_login')

		req.session.username = user.username

		resolve(req.session)
	})
}

admin_sessions.prototype.get_user_by_session = function (req) {
	return new Promise((resolve, reject) => {
		logger.timestamp('getting user by session', 'admin_login')

		// session is not there
		if (!req.session || req.session.username) {
			return reject(`session doesn't exist`)
		}

		return admin_security.get_user_by_username(req.session.username)
	})
}

admin_sessions.prototype.logout_by_session = function (req) {
	return new Promise((resolve, reject) => {
		logger.timestamp('logging-out user by session', 'admin_login')
		req.session.destroy((err) => {
			if (err) return reject(err)
			resolve()
		})
	})
}

module.exports = new admin_sessions()
