const ab_tester = require('./ab_tester')

module.exports = function ab_testing_middleware (req, res, next) {
	ab_tester.get_ab_tested_filepath(req.path, req, res).then((path) => {
		if (req.path !== path) {
			console.info(`AB Test Change: ${req.path} -> ${path}`)
		}
		req.path = path
		next()
	}, (err) => {
		next(err)
	})
}
