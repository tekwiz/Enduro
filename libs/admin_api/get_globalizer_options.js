// * ———————————————————————————————————————————————————————— * //
// * 	get globalizer options
// *	will return siblings of object specified by globalizer path
// *	This is useful for the globalizer control, which is a select/dropdown and needs to know the siblings of current selection
// *
// * 	admin api endpoint admin_api/get_globalizer_options
// *	@param {string} globalizer_string - path to the global object
// *	@return {response} - success boolean and array with options
// *
// *	example:
// *		for this object
// *		{
// *			toys: {
// *				mindstorms: {
// *					website: 'http://www.lego.com/en-us/mindstorms'
// *				},
// *				duplo: {
// *					website: 'http://www.lego.com/en-us/duplo'
// *				}
// *			}
// *		}
// *
// *		and for this globalizer string: '@@toys.mindstorms'
// *
// *		returns ['toys.mindstorms', 'toys.duplo']
// *
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const flat = require('../flat_db/flat')

// routed call
module.exports = function get_globalizer_options (req, res, next) {
	const globalizer_string = req.query.globalizer_string
	const page_path = req.query.page_path

	// checks if all required parameters had been received
	if (!globalizer_string) {
		return res.json({ success: false, message: 'missing globalizer_string query parameter' })
	}

	// just globalizer string exploded into an array
	const globalizer_chain = globalizer_string.substring(2).split('.')

	function build_globalizer_options (context_to_search_against) {
		// will store the specified object
		// this is because we want to get the parent of the target specified by the globalizer string
		let parent

		// goes through globalizer string splitted by .
		globalizer_chain.reduce((prev, next) => {
			parent = prev
			return prev[next]
		}, context_to_search_against)

		return Object.keys(parent).map((option) => {
			// we just remove last key and add the different options
			return '@@' + globalizer_chain.slice(0, -1).join('.') + '.' + option
		})
	}

	if (page_path && globalizer_chain[0] != 'global') {
		flat.load(page_path).then((context_to_search_against) => {
			res.json(build_globalizer_options(context_to_search_against))
		}, (err) => {
			if (!err) err = new Error('undefined error in rejection')
			next(err)
		})
	} else {
		res.json(build_globalizer_options(enduro.cms_data))
	}
}
