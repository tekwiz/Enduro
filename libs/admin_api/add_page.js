// * ———————————————————————————————————————————————————————— * //
// * 	add page
// *
// * 	endpoint: /admin_api/add_page
// *	adds new generator page
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const page_service = require('../admin_utilities/page_service')

// routed call
module.exports = function add_page (req, res) {
	// stores page name and generator name
	const new_pagename = req.query.new_pagename
	const generator = req.query.generator

	// checks if user is logged in
	page_service.new_generator_page(new_pagename, generator).then((pagelist) => {
		req.logger.info('Added page')
		res.json({ success: true })
	}, (err) => {
		req.logger.error(err, 'Failed to add page')
		res.json({ success: false, message: 'adding page failed' })
	})
}
