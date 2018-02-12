// * ———————————————————————————————————————————————————————— * //
// * 	Rename page
// *
// * 	endpoint: /admin_api/rename_page
// *	renames a page
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const page_service = require('../admin_utilities/page_service')
const logger = require('../logger')

// routed call
module.exports = function delete_page (req, res) {
	const pagename = req.query.pagename
	const new_pagename = req.query.new_pagename

	logger.timestamp(`${req.user.username} is trying to rename page ${pagename} to ${new_pagename}`, 'page_manipulation')

	page_service.rename_page(pagename, new_pagename).then(() => {
		logger.timestamp('renaming page successful', 'page_manipulation')
		res.json({ success: true })
	}, (err) => {
		logger.timestamp('renaming page failed', 'page_manipulation', err)
		res.json({ success: false, message: 'remaming page failed' })
	})
}
