// * ———————————————————————————————————————————————————————— * //
// * 	Rename page
// *
// * 	endpoint: /admin_api/rename_page
// *	renames a page
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const page_service = require('../admin_utilities/page_service')

// routed call
module.exports = function delete_page (req, res) {
	const pagename = req.query.pagename
	const new_pagename = req.query.new_pagename

	req.logger.debug('Renaming page')

	page_service.rename_page(pagename, new_pagename).then(() => {
		req.logger.debug('Renamed page')
		res.json({ success: true })
	}, (err) => {
		req.logger.error(err, 'Failed to rename page')
		res.json({ success: false, message: 'remaming page failed' })
	})
}
