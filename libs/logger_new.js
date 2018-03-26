const bunyan = require('bunyan')

function userSerializer (user) {
	if (!user || !user.username) return user

	return {
		user: user.username
	}
}

function reqSerializer (req) {
	var result = bunyan.stdSerializers.req.call(this, req)

	if (!req) return result

	if (req.query && Object.keys(req.query).length) {
		result.query = req.query
	}

	if (req.params && Object.keys(req.params).length) {
		result.params = req.params
	}

	return result
}

function get_logger () {
	if (!global.enduro_logger) {
		let logger = bunyan.createLogger({
			name: 'enduro',
			stream: process.stdout,
			level: 'info',
			serializers: {
				err: bunyan.stdSerializers.err,
				req: reqSerializer,
				res: bunyan.stdSerializers.res,
				user: userSerializer
			}
		})

		logger.on('error', function (err, stream) {
			console.error(`Error logging to stream: %j\n%s`, stream, err.stack)
		})

		global.enduro_logger = logger
	}

	return global.enduro_logger
}

module.exports = get_logger()
