// * ———————————————————————————————————————————————————————— * //
// * 	juice_pull
// *
// * 	endpoint: /admin_api/juice_pull
// *	pulls and re-renders project
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const juicebox = require(enduro.enduro_path + '/libs/juicebox/juicebox')

// routed call
module.exports = function juice_pull (req, res, next) {

	function rejectToError (err) {
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	}

	juicebox.pull(false)
		.then(() => enduro.actions.render(), rejectToError)
		.then(() => juicebox.diff(), rejectToError)
		.then((diff_result) => {
			res.send({ success: true, diff_result: diff_result })
		}, rejectToError)
}
