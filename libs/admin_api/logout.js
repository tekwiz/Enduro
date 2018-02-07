// * ———————————————————————————————————————————————————————— * //
// * 	Logout
// *
// * 	Admin api endpoint admin_api/logout
// *	@return {response} - Success boolean and user info
// * ———————————————————————————————————————————————————————— * //

// routed call
module.exports = function logout (req, res, next) {
	req.session.destroy((err) => {
		if (err) return next(err)
		res.send({success: true})
	})
}
