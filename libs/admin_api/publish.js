const publishing = require('../publishing')

module.exports = function publish (req, res, next) {
	var actions = req.body.actions

	if (!Array.isArray(actions)) {
		return res.status(422).json({
			success: false,
			error: 'actions must be Array of arrays for Map'
		})
	}

	try {
		actions = new Map(actions)
	} catch (e) {
		return res.status(422).json({
			success: false,
			error: 'actions must be Array of arrays for Map'
		})
	}

	let publish_details = req.body.actions.map(a => `${a[1].toUpperCase()} ${a[0]}`).join(`\n    `)
	req.logger.debug({ actions: publish_details }, 'Publishing')

	publishing.s3.publish(actions).then(() => {
		req.logger.info({ actions: publish_details }, 'Published')
		res.json({ success: true })
	}, (err) => {
		req.logger.error(err, { actions: publish_details }, 'Publish failed')
		res.status(500).json({ success: false, error: 'Something went wrong.' })
	})
}
