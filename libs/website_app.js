// * ———————————————————————————————————————————————————————— * //
// * 	website api forwarder
// *	this module forwards the express application to enduro application
// *	to enable building of custom api and functionality
// * ———————————————————————————————————————————————————————— * //
const website_api = function () {}

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')

// constants
const LOCAL_APP_FILE = enduro.project_path + '/app/app.js'
const LOCAL_SERVER_FILE = enduro.project_path + '/enduro_server.js'

// * ———————————————————————————————————————————————————————— * //
// * 	forward app
// *
// *	@param {express application} app - root express app
// *	@return {null}
// * ———————————————————————————————————————————————————————— * //
website_api.prototype.forward = function (app, server) {

	// checks if app.js is present in local enduro app
	if (flat_helpers.file_exists_sync(LOCAL_APP_FILE)) {

		// forward the app to local enduro app
		try {
			require(LOCAL_APP_FILE).init(app, server)
		} catch (e) {
			console.log(e)
		}

	}
}

website_api.prototype.enduro_server = function (enduro, app) {
	// checks if enduro_server.js is present in local enduro app
	if (flat_helpers.file_exists_sync(LOCAL_SERVER_FILE)) {
		// forward the app & server to enduro server extension
		let local_server = require(LOCAL_SERVER_FILE)
		local_server(enduro, app)
	}
}

module.exports = new website_api()
