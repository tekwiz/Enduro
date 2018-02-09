// * ———————————————————————————————————————————————————————— * //
// * 	juice push
// *
// * 	endpoint: /admin_api/refresh
// *	pushes and re-renders project
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const juicebox = require('../juicebox/juicebox')

// routed call
module.exports = function juice_push (req, res, next) {
	enduro.flags.temporary_nostaticwatch = true

	function rejectToError (err) {
		enduro.flags.temporary_nostaticwatch = false
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	}

	juicebox.pack(req.user.username)
		.then(() => enduro.actions.render(true), rejectToError)
		.then(() => juicebox.diff(), rejectToError)
		.then((diff_result) => {
			enduro.flags.temporary_nostaticwatch = false
			res.send({ success: true, diff_result: diff_result })
		}, rejectToError)
}
