// * ———————————————————————————————————————————————————————— * //
// * 	get cms
// *
// * 	admin api endpoint admin_api/get_cms
// *	@param {string} filename - filename of the cms file
// *	@return {response} - success boolean and requested data file
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const flat = require('../flat_db/flat')
const format_service = require('../services/format_service')

// routed call
module.exports = function get_cms (req, res, next) {
	const filename = req.query.filename

	// checks if all required parameters had been received
	if (!filename) {
		return res.json({ success: false, message: 'missing filename query parameter' })
	}

	flat.load(filename).then((data) => {
		var page_name = (data.$page_name ? data.$page_name : filename)

		var only_page_name = page_name.split('/').splice(-1)[0]

		res.json({
			success: true,
			page_name: page_name,
			only_page_name: only_page_name,
			// name is capitalized and _ are replaced with whitespace
			pretty_name: format_service.prettify_string(only_page_name),
			// main data of the content file
			context: data,
			// url where this page is served
			page_link: flat.url_from_filename(page_name),
			// associated page means that the page content file is directly linked with an existing url
			// this is used when deciding whether provide a link from admin to the page that is being edited
			has_page_associated: flat.has_page_associated(page_name),
			// path to the content file provided in array
			path_list: page_name.split('/'),
			// bool saying whether content file can be deleted
			deletable: flat.is_deletable(page_name)
		})
	}, (err) => {
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	})
}
