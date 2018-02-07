// * ———————————————————————————————————————————————————————— * //
// * 	delete page
// *
// * 	endpoint: /admin_api/delete_page
// *	deletes a page if it's possible to do so
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const page_adding_service = require(enduro.enduro_path + '/libs/admin_utilities/page_adding_service')
const logger = require(enduro.enduro_path + '/libs/logger')

// routed call
module.exports = function delete_page (req, res) {
	const pagename = req.query.pagename

	logger.timestamp(`${req.user.username} is trying to delete page ${pagename}`, 'page_manipulation')

	page_adding_service.delete_page(pagename).then((pagelist) => {
		logger.timestamp('deleting page successful', 'page_manipulation')
		res.json({ success: true })
	}, (err) => {
		logger.timestamp('deleting a page failed', 'page_manipulation', err)
		res.json({ success: false, message: 'deleting a page failed' })
	})
}
