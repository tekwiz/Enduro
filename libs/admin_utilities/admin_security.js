// * ———————————————————————————————————————————————————————— * //
// * 	Enduro Admin Security
// * ———————————————————————————————————————————————————————— * //
const admin_security = function () {}

// * vendor dependencies
const crypto = require('crypto')

// * enduro dependencies
const flat = require('../flat_db/flat')

function get_sanitized_user (user) {
	return {
		username: user.username,
		tags: user.tags,
		user_created_timestamp: user.user_created_timestamp,
		user_updated_timestamp: user.user_updated_timestamp
	}
}

admin_security.prototype.get_user_details_by_username = function (username) {
	return flat.load(enduro.config.admin_secure_file).then((users) => {
		users = (users.users ? users.users : [])
		let result = users.find(u => u.username === username)
		if (!result) return null
		return get_sanitized_user(result)
	})
}

// * ———————————————————————————————————————————————————————— * //
// * 	get user by username
// *	@param {string} username - username of user to be returned
// *	@return {object} - User as defiend in the user file
// * ———————————————————————————————————————————————————————— * //
admin_security.prototype.get_user_by_username = function (username) {
	return new Promise(function (resolve, reject) {
		// load up all admins
		return flat.load(enduro.config.admin_secure_file)
			.then((raw_userlist) => {

				// if there are no users
				if (!raw_userlist.users) {
					return reject('no users found')
				}

				// find user with specified username
				const selected_user = raw_userlist.users.filter((user) => {
					if (user.username == username) {
						return user
					}
				})

				// resolve/reject based on if user was found
				selected_user.length
					? resolve(selected_user[0])
					: reject('user not found')

			})
	})
}

// * ———————————————————————————————————————————————————————— * //
// * 	get all users
// *	@return {list} - list of all user names
// * ———————————————————————————————————————————————————————— * //
admin_security.prototype.get_all_users = function () {

	// load up the user file
	return flat.load(enduro.config.admin_secure_file)
		.then((raw_userlist) => {

			// return empty array if no users found
			if (!raw_userlist.users) {
				return []
			}

			// return just usernames
			return raw_userlist.users.map(function (user) {
				return user.username
			})
		})
}

admin_security.prototype.get_all_users_details = function () {
	return flat.load(enduro.config.admin_secure_file).then((users) => {
		users = (users.users ? users.users : [])
		return users.map(get_sanitized_user)
	})
}

// * ———————————————————————————————————————————————————————— * //
// * 	login by password
// *	@param {string} username
// *	@param {string} plaintext password
// *	@return {promise} - resolves if login successful and returns user
// * ———————————————————————————————————————————————————————— * //
admin_security.prototype.login_by_password = function (username, password) {
	const self = this

	return new Promise(function (resolve, reject) {

		// if username or password is missing
		if (!username || !password) {
			return reject({success: false, message: 'username or password not provided'})
		}

		// gets user with specified username
		self.get_user_by_username(username)
			.then((user) => {

				// hashes password
				const hashed_input_password = hash(password, user.salt)

				// compares hashed password with stored hash
				if (hashed_input_password == user.hash) {
					resolve(user)
				} else {

					// reject if provided password does not match the stored one
					reject({success: false, message: 'wrong password'})
				}
			}, () => {

				// reject if user does not exist
				reject({success: false, message: 'wrong username'})
			})
	})
}

// * ———————————————————————————————————————————————————————— * //
// * 	add addmin
// *	@param {string} username
// *	@param {string} plaintext password
// *	@return {promise} - resolves/rejects based on if the creation was successful
// * ———————————————————————————————————————————————————————— * //
admin_security.prototype.add_admin = function (username, password, tags) {
	// sets username to 'root' if no username is provided
	if (!username || typeof username == 'object') {
		username = 'root'
	}

	// generate random password if no password is provided
	if (!password) {
		password = Math.random().toString(10).substring(10)
	}

	// put empty tag if no tags are provided
	if (typeof tags == 'string') {
		tags = tags.split(',')
	} else if (!tags) {
		tags = []
	}

	const logincontext = {
		username: username,
		password: password,
		tags: tags
	}

	return this.get_user_by_username(logincontext.username)
		.then(() => {
			throw new Error(`User already exists: ${username}`)
		}, () => {
			salt_and_hash(logincontext)
			timestamp(logincontext)
			return flat.upsert(enduro.config.admin_secure_file, { users: [ logincontext ] })
		})
		.then(() => {
			console.info(`Created user ${username}`)
			return get_sanitized_user(logincontext)
		})
}

admin_security.prototype.update_admin = function (username, password, tags) {
	var user = {
		username: username,
		tags: tags,
		user_updated_timestamp: Date.now()
	}

	if (typeof user.tags == 'string') {
		user.tags = (user.tags ? user.tags.trim().split(/\s*,\s*/) : [])
	}

	if (!user.tags) user.tags = []

	if (password) {
		Object.assign(user, salt_and_hash({ username: username, password: password }))
	}

	return flat.load(enduro.config.admin_secure_file)
		.then((users_context) => {
			var user_index = users_context.users.findIndex(u => u.username === username)
			if (user_index === -1) throw new Error(`User not found: ${username}`)

			let updated_user = Object.assign(users_context.users[user_index], user)
			return flat.save(enduro.config.admin_secure_file, users_context).then(() => updated_user)
		})
		.then((updated_user) => {
			console.info(`Updated user ${updated_user.username}`)
			return get_sanitized_user(updated_user)
		})
}

admin_security.prototype.remove_admin = function (username) {
	return flat.load(enduro.config.admin_secure_file)
		.then((users_context) => {
			var user_index = users_context.users.findIndex(u => u.username === username)
			if (user_index === -1) throw new Error(`User not found: ${username}`)

			let removed_user = users_context.users[user_index]
			users_context.users.splice(user_index, 1)
			return flat.save(enduro.config.admin_secure_file, users_context).then(() => removed_user)
		})
		.then((removed_user) => {
			console.info(`Removed user ${removed_user.username}`)
			return get_sanitized_user(removed_user)
		})
}

admin_security.prototype.remove_all_users = function () {
	return flat.save('.users', {})
}

// private functions

// * ———————————————————————————————————————————————————————— * //
// * 	hash
// *	@param {string} plaintext password
// *	@param {string} salt
// *	@return {string} - hashed password
// * ———————————————————————————————————————————————————————— * //
function hash (password, salt) {
	return require('crypto').createHash('sha256').update(password + salt, 'utf8').digest('hex')
}

// * ———————————————————————————————————————————————————————— * //
// * 	salt and hash
// *	@param {object} logincontext
// *	@return {} - nothing, just adds salt and hash to logincontext
// * ———————————————————————————————————————————————————————— * //
function salt_and_hash (logincontext) {
	if (!logincontext || !logincontext.username || !logincontext.password) {
		return
	}

	// adds salt
	logincontext.salt = crypto.randomBytes(16).toString('hex')

	// adds hash
	logincontext.hash = hash(logincontext.password, logincontext.salt)

	// deletes plain password
	delete logincontext.password

	return logincontext
}

// * ———————————————————————————————————————————————————————— * //
// * 	timestamp
// *	@param {object} logincontext
// *	@return {} - nothing, just adds timestamp to logincontext
// * ———————————————————————————————————————————————————————— * //
function timestamp (logincontext) {
	logincontext.user_created_timestamp = Date.now()
	logincontext.user_updated_timestamp = Date.now()

	return logincontext
}

module.exports = new admin_security()
