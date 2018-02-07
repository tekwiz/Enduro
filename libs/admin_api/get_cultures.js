// * ———————————————————————————————————————————————————————— * //
// * 	get page list
// *
// * 	admin api endpoint admin_api/get_page_list
// *	@return {response} - success boolean and flattened page list in an array
// * ———————————————————————————————————————————————————————— * //

// routed call
module.exports = function get_cultures (req, res) {
	if (enduro.config.cultures.length > 1) {
		res.json({ success: true, data: enduro.config.cultures.slice(0, -1) })
	} else {
		res.json({ success: true, data: enduro.config.cultures })
	}
}
