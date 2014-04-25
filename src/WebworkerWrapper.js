define([
	],
	function(
		) {
		'use strict';

		function WebWorkerWrapper(func){
			this._worker = new Worker(
				window.URL.createObjectURL(new Blob([
					'var worker = this;\n' +
					'onmessage = function(arrayBuffer, returnPointer) {\n' +
						'(' + func.toString() + ')(arrayBuffer);\n' +
						'var returnRegister = new Uint8Array(' +
							'arrayBuffer,' +
							'returnPointer,' +
							'1);\n'+
						'returnRegister[0] = 128;\n' +
						'returnRegister.set(arrayBuffer, returnPointer);\n' +
						'worker.postMessage();\n' +
						'};\n'
					]
				))
			);
		}

		// Will set the first bit in the array to 1, after executing func
		WebWorkerWrapper.prototype.start = function(arrayBuffer, returnPointer) {
			this._worker.postMessage(arrayBuffer);
		};

		return WebWorkerWrapper;
	}
);
