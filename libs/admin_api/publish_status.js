const publishing = require('../publishing')

module.exports = function publish_status (req, res, next) {
	publishing.s3.status().then((publish_actions) => {
		res.json({ success: true, actions: Array.from(publish_actions) })
	}, (err) => {
		console.error(err.stack)
		res.status(500).json({ success: false, error: 'Something went wrong.' })
	})
}
