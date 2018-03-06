const admin_security = require('../../admin_utilities/admin_security')

var router = require('express').Router()

/**
 * Username parameter.
 * Loads user identified by username into `req.user_details`.
 * Sets `req.user_details_is_current_user` to `true` if the username identifies the current user.
 */
router.param('username', (req, res, next, username) => {
	admin_security.get_user_details_by_username(username).then((user) => {
		req.user_details = user
		req.user_details_is_current_user = (req.user.username === user.username)
		next()
	}, err => next(err))
})

/**
 * List users
 * GET /admin_api/users
 */
router.get((req, res, next) => {
	if (!req.user.tags.includes('admin')) {
		return res.status(403).json({ success: false, message: 'Insufficient permissions'})
	}

	admin_security.get_all_users_details().then((users) => {
		res.json({ success: true, users: users })
	}, err => next(err))
})

/**
 * Create user
 * POST /admin_api/users
 */
router.post((req, res, next) => {
	if (!req.user.tags.includes('admin')) {
		return res.status(403).json({ success: false, message: 'Insufficient permissions'})
	}

	admin_security.add_admin(req.user_details.username, req.body.password, req.body.tags)
		.then((user) => {
			res.json({ success: true, user: user })
		}, err => next(err))
})

/**
 * Get user
 * GET /admin_api/users/:username
 */
router.get(`/:username`, (req, res, next) => {
	if (!req.user_details_is_current_user && !req.user.tags.includes('admin')) {
		return res.status(403).json({ success: false, message: 'Insufficient permissions'})
	}

	res.json({ success: true, user: req.user_details })
})

/**
 * Update user
 * GET /admin_api/users/:username
 */
router.put(`/:username`, (req, res, next) => {
	if (req.body.tags && !req.user.tags.includes('admin')) {
		return res.status(403).json({ success: false, message: 'Insufficient permissions'})
	}

	if (!req.user_details_is_current_user && !req.user.tags.includes('admin')) {
		return res.status(403).json({ success: false, message: 'Insufficient permissions'})
	}

	admin_security.update_admin(req.user_details.username, req.body.password, req.body.tags)
		.then((user) => {
			res.json({ success: true, user: user })
		}, err => next(err))
})

module.exports = router
