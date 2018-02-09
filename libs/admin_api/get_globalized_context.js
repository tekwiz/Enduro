// * ———————————————————————————————————————————————————————— * //
// * 	get globalized context
// *	returns object based on globalizer string. this is useful for the templatitator control.
// *	ie. @@global.products.product1 will return the product object itself
// *
// * 	admin api endpoint admin_api/get_globalized_context
// *	@param {string} globalizer_string - path to the global object prefixed by '@@'
// *	@param {string} page_path - path to the current cms page. Will try to find the object in the local context if it was not found in the global context
// *	@return {response} - success boolean and context object
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const flat = require('../flat_db/flat')
const globalizer_helpers = require('../globalizer/globalizer_helpers')

// routed call
module.exports = function get_globalized_context (req, res, next) {
	const globalizer_string = req.query.globalizer_string
	const page_path = req.query.page_path

	// checks if all required parameters had been received
	if (!globalizer_string) {
		return res.json({ success: false, message: 'missing globalizer_string query parameter' })
	}

	// just globalizer string exploded into an array
	const globalizer_chain = globalizer_string.substring(2).split('.')

	if (page_path && globalizer_chain[0] != 'global') {
		flat.load(page_path).then((context_to_search_against) => {
			res.json(globalizer_helpers.route_context(context_to_search_against, globalizer_string))
		}, (err) => {
			if (!err) err = new Error('undefined error in rejection')
			next(err)
		})
	} else {
		res.json(globalizer_helpers.route_context(enduro.cms_data, globalizer_string))
	}
}
