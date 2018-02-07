const expect = require('chai').expect
const request = require('request').defaults({ jar: true })

const local_enduro = require('../../index').quick_init()
const test_utilities = require('../libs/test_utilities')

describe('admin api', function () {
	this.timeout(7000)

	before(function (done) {
		test_utilities.before(local_enduro, 'admin_api').then(() => {
			return enduro.actions.start()
		}).then(() => {
			request.get({
				url: 'http://localhost:5000/admin_api/login_by_password',
				qs: { username: 'gottwik', password: '123' },
			}, (err) => done(err))
		})
	})

	it('should not get token if no session is provided', function (done) {
		request({
			url: 'http://localhost:5000/admin_api/check_session',
			jar: request.jar()
		}, (err, response, body) => {
			if (err) return done(err)
			const res = JSON.parse(body)
			expect(res.success).to.be.not.ok
			done()
		})
	})

	it('should be able to login with password', function (done) {
		request.get({
			url: 'http://localhost:5000/admin_api/login_by_password',
			qs: {username: 'gottwik', password: '123'},
			jar: request.jar()
		}, (err, response, body) => {
			if (err) return done(err)
			const res = JSON.parse(body)
			expect(res.success).to.be.ok
			expect(res).to.have.all.keys('success', 'username', 'sid', 'created', 'expires_at')
			sid = res.sid
			done()
		})
	})

	it('should be able to get cms list', function (done) {
		request.get({
			url: 'http://localhost:5000/admin_api/get_cms_list'
		}, (err, response, body) => {
			if (err) return done(err)
			const res = JSON.parse(body)
			expect(res.success).to.be.ok
			expect(res.data).to.contain.all.keys('structured', 'flat')
			done()
		})
	})

	it('should be able to get admin_extension list', function (done) {
		request.get({
			url: 'http://localhost:5000/admin_api/get_admin_extensions'
		}, (err, response, body) => {
			if (err) return done(err)
			const res = JSON.parse(body)
			expect(res.success).to.be.ok
			expect(res.data[0]).to.have.string('sample_extension')
			done()
		})
	})

	after(function () {
		return enduro.actions.stop_server().then(() => {
			return test_utilities.after()
		})
	})

})
