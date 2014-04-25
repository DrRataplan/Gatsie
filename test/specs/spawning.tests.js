define([
		'linked_list/linked-list',
		'WebworkerWrapper'
	],
	function(
			node,
			WebworkerWrapper
		) {
		'use strict';
		var expect = chai.expect;

		describe('linked-list', function() {
			it('should have an insert round-trip to same output', function() {
				var array = new ArrayBuffer(256);
				node.insert(array, 0, 200, 0xFF);
				
				expect(node.get(array, 0)).to.equal(0xFF);
			});
			it('should have a 32 bit insert round-trip to the same output', function() {
				var array = new ArrayBuffer(256);

				node.insert(array, 0, 200, 0xFFFF);

				expect(node.get(array, 0)).to.equal(0xFFFF);
			});
		});

		describe('webworker', function() {
			var webworker, buffer;
			it('should execute a webworker', function() {
				webworker = new WebworkerWrapper(function(arrayBuffer) {
					// NA
					worker.postMessage();
				});

				buffer = new ArrayBuffer(256);
				webworker.start(buffer, 0);
			});
		});
	}
);
