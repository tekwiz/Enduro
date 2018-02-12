// * ———————————————————————————————————————————————————————— * //
// * 	delete page
// *
// * 	endpoint: /admin_api/delete_page
// *	deletes a page if it's possible to do so
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const page_service = require('../admin_utilities/page_service')
const logger = require('../logger')

// routed call
module.exports = function delete_page (req, res) {
	const pagename = req.query.pagename

	logger.timestamp(`${req.user.username} is trying to delete page ${pagename}`, 'page_manipulation')

	page_service.delete_page(pagename).then((pagelist) => {
		logger.timestamp('deleting page successful', 'page_manipulation')
		res.json({ success: true })
	}, (err) => {
		logger.timestamp('deleting page failed', 'page_manipulation', err)
		res.json({ success: false, message: 'deleting page failed' })
	})
}
