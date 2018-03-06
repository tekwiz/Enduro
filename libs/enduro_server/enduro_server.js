// * ———————————————————————————————————————————————————————— * //
// * 	enduro's production server
// *
// *	runs production server with password protection and
// *	admin ui and better routing
// *
// *	uses express mvc
// * ———————————————————————————————————————————————————————— * //
const enduro_server = function () {}

// * vendor dependencies
const path = require('path')
const express = require('express')
const session = require('express-session')
const cors = require('cors')
const cookieParser = require('cookie-parser')

// * enduro dependencies
const admin_api = require('../admin_api')
const website_app = require('../website_app')
const logger = require('../logger')
const brick_router = require('../bricks/router')
const ab_testing_middleware = require('../ab_testing/middleware')
const robots_txt = require('./robots-txt')
const middleware = require('./middleware')
const admin_router = require('./admin-router')

// * ———————————————————————————————————————————————————————— * //
// * 	server run
// *
// * 	starts the production server
// *	@param {boolean} development_mode - if true, prevents enduro render on start to prevent double rendering
// *	@return {}
// * ———————————————————————————————————————————————————————— * //
enduro_server.prototype.run = function (server_setup = {}) {
	return new Promise((resolve, reject) => {
		var app = express()

		// Cookie parser (https://github.com/expressjs/cookie-parser)
		app.use(cookieParser())

		// Trust proxy (http://expressjs.com/en/guide/behind-proxies.html)
		if (enduro.config.trust_proxy) {
			app.set('trust proxy', enduro.config.trust_proxy)
		}

		// Session (https://github.com/expressjs/session)
		// if (enduro.config.session_config) {
		// 	app.use(session(enduro.config.session_config))
		// }

		// CORS (https://github.com/expressjs/cors)
		if (enduro.config.cors_config) {
			app.use(cors(enduro.config.cors_config))
		}

		// add enduro.js header
		if (enduro.config.powered_by_header) {
			app.use(middleware.powered_by)
		}

		// overrides the port by system environment variable
		enduro.config.port = process.env.PORT || enduro.flags.port || enduro.config.port || 5000

		// starts listening to request on specified port
		enduro.server = app.listen(enduro.config.port, function () {
			logger.timestamp('Production server started at port ' + enduro.config.port, 'enduro_events')
			if (!server_setup.development_mode && !enduro.flags.nocompile) {
				enduro.actions.render()
					.then(() => {
						resolve()
					})
			} else {
				resolve()
			}
		})

		try {
			// forward the app and server to running enduro application
			website_app.forward(app, enduro.server)
			website_app.enduro_server(enduro, app)
		} catch (e) {
			return reject(e)
		}

		app.get('/admin_api_refresh', (req, res, next) => {
			req.url = '/admin/api_refresh'
			next()
		})

		app.use('/admin', admin_router())

		// serve static files from /_generated folder
		let build_path = path.join(enduro.project_path, enduro.config.build_folder)
		app.use('/assets', express.static(path.join(build_path, 'assets'), {
			fallthrough: false
		}))
		app.use('/_prebuilt', express.static(path.join(build_path, '_prebuilt'), {
			fallthrough: false
		}))
		app.use('/remote', express.static(path.join(enduro.project_path + '/remote'), {
			fallthrough: false
		}))

		// robots.txt
		app.get('/robots.txt', robots_txt)

		// serve bricks' static assets
		app.use('/brick', brick_router())

		// handle for all admin api calls
		app.use('/admin_api', admin_api)

		// Trollhunter protection
		app.use(middleware.trollhunter)

		// AB Testing handler
		app.use(ab_testing_middleware)

		// handle all website calls
		app.use(middleware.logger)
		app.use(express.static(build_path, {
			fallthrough: false
		}))

		if (!enduro.config.disable_socket_io) {
			// init socket and store everybody in global enduro.sockets
			let io = require('socket.io')(enduro.server)
			enduro.sockets = io.sockets
		}
	})
}

enduro_server.prototype.stop = function () {
	return new Promise(function (resolve, reject) {
		enduro.server.close(() => {
			resolve()
		})
	})
}

module.exports = new enduro_server()
