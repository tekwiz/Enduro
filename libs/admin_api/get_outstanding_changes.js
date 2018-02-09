// * ———————————————————————————————————————————————————————— * //
// * 	get outstanding changes
// *
// *	@return {response} - diff with most current local juicebox
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const juicebox = require('../juicebox/juicebox')

// routed call
module.exports = function get_outstanding_changes (req, res, next) {
	if (!enduro.config.juicebox_enabled) {
		return res.json({})
	}

	juicebox.diff_current_to_latest_juicebox().then((diff) => {
		res.json(diff)
	}, (err) => {
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	})
}
