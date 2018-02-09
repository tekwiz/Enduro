// * ———————————————————————————————————————————————————————— * //
// * 	get structured global dataset list
// *
// * 	admin api endpoint admin_api/get_datasetlist
// *	@return {response} - success boolean and flattened dataset list in an array
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const pagelist_generator = require('../build_tools/pagelist_generator')

// routed call
module.exports = function get_cms_list (req, res) {
	pagelist_generator.get_cms_list().then((pagelist) => {
		res.json({ success: true, data: pagelist })
	}, (err) => {
		if (err) console.error(err.stack ? err.stack : `Error message: ${err}`)
		res.json({ success: false, message: 'failed to get the cms list' })
	})
}
