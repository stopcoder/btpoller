// var Dropbox = require("dropbox");
//
// var client =  new Dropbox.Client({
// 	key: "8xbui4g15ug8gh6",
// 	secret: "f8y78ehv9ht27ou"
// });

var https = require("https");
// var HttpProxyAgent = require("http-proxy-agent");
var globalTunnel = require("global-tunnel");
// var agent = new HttpsProxyAgent({
// 	host: "proxy",
// 	port: "8080",
// 	secureProxy: true
// });

globalTunnel.initialize({
  host: "proxy",
  port: 8080,
  tunnel: "neither",
  protocol: "http",
  sockets: 50 // optional pool size for each http and https
});

var token = "urZCRWipaesAAAAAAAACVzDrmqfFGHjdMvxqbpMWVZYx8s64gzrw8J0Z0W3TlTSv";

var options = {
	hostname: "https://api.dropboxapi.com",
	path: "/1/metadata/auto/",
	method: "GET",
	headers: {
		"List": true,
		"Authorization": "Bearer " + token
	}
};

https.request(options, function(res) {
	res.on("data", function(data) {
		process.stdout.write(data);
	});
});
