// * ———————————————————————————————————————————————————————— * //
// * 	delete page
// *
// * 	endpoint: /admin_api/delete_page
// *	deletes a page if it's possible to do so
// * ———————————————————————————————————————————————————————— * //

// * enduro dependencies
const page_service = require('../admin_utilities/page_service')

// routed call
module.exports = function delete_page (req, res) {
	const pagename = req.query.pagename

	page_service.delete_page(pagename).then((pagelist) => {
		req.logger.info('Deleted page')
		res.json({ success: true })
	}, (err) => {
		req.logger.error(err, 'Failed to delete page')
		res.json({ success: false, message: 'deleting page failed' })
	})
}
