// * ———————————————————————————————————————————————————————— * //
// * 	trollhunter
// *
// * 	admin api endpoint admin_api/trollhunter
// *	@return {response} - success boolean
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const trollhunter = require('../trollhunter')

// routed call
module.exports = function trollhunter_api (req, res, next) {
	trollhunter.login(req).then(() => {
		res.send({ success: true })
	}, (err) => {
		req.logger.error(err || 'Unknown error')
		res.send({ success: false })
	})
}
