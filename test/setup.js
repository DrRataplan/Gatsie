// Require.js config
require.config({
	"baseUrl": "/src",

	"paths": {
		"domReady":          "../test/vendor/requirejs-domready/domReady",
		"text":              "../test/vendor/requirejs-text/text",

		"test":              "../test"
	},

	"packages": [
		{
			"name": "whynot",
			"location": "../test/vendor/whynot/src"
		},
		{
			"name": "fontoxml-dom-utils",
			"location": "../test/vendor/fontoxml-dom-utils/src"
		},
		{
			"name": "slimdom",
			"location": "../test/vendor/slimdom/lib"
		}
	],

	"shim": {

	}
});
