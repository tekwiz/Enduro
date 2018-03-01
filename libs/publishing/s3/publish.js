const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const mime = require('mime-types')
const get_digest = require('../get-digest')

function put_action (s3, build_path, key, digest) {
	return new Promise((resolve, reject) => {
		s3.upload({
			Key: key,
			Body: fs.createReadStream(path.join(build_path, key)),
			ContentType: mime.contentType(key),
			Metadata: {
				digest: digest
			}
		}, (err, data) => {
			if (err) return reject(err)
			resolve(data)
		})
	})
}

function delete_actions (s3, keys) {
	var objects = keys.map((k) => {
		return { Key: k }
	})

	return new Promise((resolve, reject) => {
		s3.deleteObjects({
			Delete: {
				Objects: objects
			}
		}, (err, data) => {
			if (err) return reject(err)
			resolve(data)
		})
	})
}

function post_publish (actions, options) {
	if (enduro.post_publish) {
		return enduro.post_publish(actions, options)
	}
	return Promise.resolve()
}

module.exports = function publish (actions, options) {
	const build_path = path.join(enduro.project_path, enduro.config.build_folder)

	var s3 = new AWS.S3({
		accessKeyId: enduro.config.variables.S3_KEY,
		secretAccessKey: enduro.config.variables.S3_SECRET,
		region: enduro.config.s3.region,
		params: {
			Bucket: enduro.config.s3.bucket
		}
	})

	var action_promises = []
	var keys_to_delete = []

	for (let action of actions) {
		switch (action[1]) {
			case '': break
			case 'put':
				if (options.dryrun) {
					action_promises.push({ put: path.join(build_path, action[0]) })
					break
				}
				action_promises.push(
					get_digest(path.join(build_path, action[0]))
						.then(digest => put_action(s3, build_path, action[0], digest))
				)
				break
			case 'delete':
				keys_to_delete.push(action[0])
				break
			default:
				return Promise.reject(new Error(`Unknown action: ${action}`))
		}
	}

	if (options.dryrun && keys_to_delete.length) {
		action_promises.push({ delete: keys_to_delete })
	} else if (keys_to_delete.length) {
		action_promises.push(delete_actions(s3, keys_to_delete))
	}

	if (!action_promises.length) {
		console.info(`No changes to publish`)
	}

	if (options.dryrun) { // skip running the actions
		return post_publish(actions, options)
	}

	return Promise.all(action_promises)
		.then(() => post_publish(actions, options))
}
