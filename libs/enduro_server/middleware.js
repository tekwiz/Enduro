const logger = require('../logger')
const trollhunter = require('../trollhunter')

exports.logger = function logger_middleware (req, res, next) {
	logger.timestamp('requested: ' + req.url, 'server_usage')
	next()
}

exports.trollhunter = function trollhunter_middleware (req, res, next) {
	trollhunter.login(req).then(() => {
		next()
	}, () => {
		console.warn('user not logged in')
		res.redirect('/admin/enduro_login')
	})
}

exports.powered_by = function powered_by_middleware (req, res, next) {
	if (!enduro.config.powered_by_header) return next()
	res.header('X-Powered-By', enduro.config.powered_by_header)
	next()
}
