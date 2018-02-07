// * ———————————————————————————————————————————————————————— * //
// * 	get admin extension list
// *
// * 	admin api endpoint admin_api/get_admin_extensions
// *	@return {response} - success boolean and array of .js files to be injected to admin
// * ———————————————————————————————————————————————————————— * //

// * vendor dependencies
const glob = require('glob-promise')
const path = require('path')

// * enduro dependencies
const brick_handler = require(enduro.enduro_path + '/libs/bricks/brick_handler')

// routed call
module.exports = function get_admin_extensions (req, res, next) {
	const extension_path = path.join(enduro.project_path, 'assets', 'admin_extensions', '**', '*.js')

	glob(extension_path).then((extensions) => {
		// removes part of absolute path
		extensions = extensions.map(e => e.match(/admin_extensions\/(.*)/)[1])

		// add path prefix for default extensions
		extensions = extensions.map(e => `/assets/admin_extensions/${e}`)

		// adds admin js injects by bricks
		if (enduro.config.brick_admin_injects) {
			extensions = extensions.concat(enduro.config.brick_admin_injects)
		}

		res.send({ success: true, data: extensions })
	}, (err) => {
		if (!err) err = new Error('undefined error in rejection')
		next(err)
	})
}
