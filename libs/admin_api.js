// * ———————————————————————————————————————————————————————— * //
// * 	Admin api handler
// *	All admin_api/* endpoints are routed here, and are consequently
// *	routed into the admin_api folder
// * ———————————————————————————————————————————————————————— * //
const fs = require('fs')
const path = require('path')
const bodyParser = require('body-parser')

// * enduro dependencies
const logger = require('./logger_new')
const admin_security = require('./admin_utilities/admin_security')

var api_router = require('express').Router()

api_router.use((err, req, res, next) => {
	req.logger.error(err)
	res.status(500).json({ success: false, message: 'api endpoint error' })
})

api_router.use((req, res, next) => {
	var api_name = req.url.match(/\/([^?\/]+)/)[1] // eslint-disable-line no-useless-escape
	req.logger = logger.child({ api: api_name, req: req })
	next()
})

api_router.use('/login_by_password', (req, res, next) => {
	req.user_not_required = true
	next()
})

api_router.use('/get_admin_extensions', (req, res, next) => {
	req.user_not_required = true
	next()
})

api_router.use('/get_application_settings', (req, res, next) => {
	req.user_not_required = true
	next()
})

api_router.use((req, res, next) => {
	if (!req.session || !req.session.username) {
		if (req.user_not_required) return next()
		return res.status(401).json({ success: false, message: 'not logged-in'})
	}

	admin_security.get_user_by_username(req.session.username).then((user) => {
		req.user = user
		req.logger = req.logger.child({ user: user })
		next()
	}, next)
})

api_router.use(bodyParser.json())

let admin_api_dir = path.join(__dirname, 'admin_api')
fs.readdirSync(admin_api_dir).forEach((fn) => {
	if (!fn.endsWith('.js')) return

	let api_name = path.basename(fn, '.js')
	let api_endpoint = require(path.join(admin_api_dir, fn))

	api_router.all(`/${api_name}`, api_endpoint)
})

api_router.use('/users', require('./admin_api/users'))

module.exports = api_router
