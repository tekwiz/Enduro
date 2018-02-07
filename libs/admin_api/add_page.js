// * ———————————————————————————————————————————————————————— * //
// * 	add page
// *
// * 	endpoint: /admin_api/add_page
// *	adds new generator page
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const page_adding_service = require('../admin_utilities/page_adding_service')
const logger = require('../logger')

// routed call
module.exports = function add_page (req, res) {
	// stores page name and generator name
	const new_pagename = req.query.new_pagename
	const generator = req.query.generator

	logger.timestamp(`${req.user.username} is trying to create a new page`, 'page_manipulation')

	// checks if user is logged in
	page_adding_service.new_generator_page(new_pagename, generator).then((pagelist) => {
		logger.timestamp('adding page successful', 'page_manipulation')
		res.json({ success: true })
	}, (err) => {
		logger.err('adding page failed', 'page_manipulation', err)
		res.json({ success: false, message: 'adding page failed' })
	})
}
