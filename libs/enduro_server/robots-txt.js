module.exports = function robots_txt (req, res) {
	res.type('text/plain')
	res.send(`User-agent: *\nAllow: /`)
}
