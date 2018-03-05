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
	console.warn(`Publishing (${req.user.username})\n    ${publish_details}`)

	publishing.s3.publish(actions).then(() => {
		console.warn(`Publish succeeded`)
		res.json({ success: true })
	}, (err) => {
		console.error(`Publish failed ${err.stack}`)
		res.status(500).json({ success: false, error: 'Something went wrong.' })
	})
}
