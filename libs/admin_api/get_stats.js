// * ———————————————————————————————————————————————————————— * //
// * 	get stats
// *
// *	@return {response} - object with stats about the website
// * ———————————————————————————————————————————————————————— * //

// routed call
module.exports = function get_stats (req, res) {
	res.json({
		enduro_version: '1.0.40'
	})
}
