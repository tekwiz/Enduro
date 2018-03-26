const publishing = require('../publishing')

module.exports = function publish_status (req, res, next) {
	publishing.s3.status().then((publish_actions) => {
		res.json({ success: true, actions: Array.from(publish_actions) })
	}, (err) => {
		req.logger.error(err)
		res.status(500).json({ success: false, error: 'Something went wrong.' })
	})
}
