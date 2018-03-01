const chalk = require('chalk')

module.exports = {
	command: ['publish', 'p'],
	desc: 'publish all static files',
	builder: {
		'dry-run': {
			alias: 'd',
			describe: 'dry run (implies status)',
		}
	},
	handler: function (cli_arguments) {
		const enduro_instance = require('../index')
		const publishing = require('../libs/publishing')

		const options = {
			dryrun: cli_arguments['dry-run']
		}

		enduro_instance.init()
			.then(() => {
				return publishing.s3.status(options)
					.then((publish_actions) => {
						console.log(chalk.bold('Publishing...'))

						for (let action of publish_actions) {
							switch (action[1]) {
								case '':
									console.log(chalk.green(`  ${action[0]}`))
									break
								case 'put':
									console.log(chalk.yellow(`+ ${action[0]}`))
									break
								case 'delete':
									console.log(chalk.red(`- ${action[0]}`))
									break
								default:
									return Promise.reject(new Error(`Unknown action: ${action}`))
							}
						}

						return publish_actions
					})
			})
			.then(actions => publishing.s3.publish(actions, options))
			.then(() => {
				console.log(chalk.green(chalk.bold('Publishing complete')))
			}, (err) => {
				console.log(chalk.red(chalk.bold('Publishing failed')))
				if (err) console.error(err.stack)
			})
	}
}
