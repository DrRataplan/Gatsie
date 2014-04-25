define([
	],
	function(
	) {
		'use strict';

		/**
		 * @enum
		 */
		var types = {
			BOOLEAN: 0,
			NUMBER: 1,
			STRING: 2,
			RAW: 3,
		};

		/**
		 * Writes a piece of data as:
		 * 	- 4 byte length
		 * 	- 1 byte not used
		 * 	- 3 byte type
		 * 	- <length> byte serializedData
		 *
		 *	If 
		 * 
		 * @param  {ArrayBuffer}   arraybuffer     [description]
		 * @param  {Number}        offset          [description]
		 * @param  {Number}        length          [description]
		 * @param  {Number}        type            [description]
		 * @param  {Array.Number}  serializedData  The data, serialized as 8-bit numbers to write to the array
		 * @return {Number}        The new Offset
		 */
		function writeDataModel(arraybuffer, offset, length, type, serializedData) {
			var arr = new Uint8Array(arraybuffer, offset, length + 1);

			arr[0] = (length << 4) | type;
			for (var i = 0; i < length; i++) {
				arr[i + 1] = serializedData[i]; 
			}

			arr.set(arraybuffer, offset);

			return offset + length + 1;
		}

		function writeNumber(arraybuffer, offset, numberToWrite) {
			var serializedData = [];
			for (var number = numberToWrite | 0; number; number = number >> 8) {
				serializedData.push(number & 0xFF);
			}

			return writeDataModel(arraybuffer, offset, serializedData.length, types.NUMBER, serializedData);
		}

		function writeBoolean(arraybuffer, offset, booleanToWrite) {
			return writeDataModel(arraybuffer, offset, 1, types.BOOLEAN, [booleanToWrite | 0]);
		}

		function readDataModel(arraybuffer, offset) {
			var lengthReader = new Uint8Array(arraybuffer, offset, 1);
			var type = lengthReader[0] & 0x7;
			switch(type) {
				case types.BOOLEAN:
					return readBoolean(arraybuffer, offset + 1);
				case types.NUMBER:
					return readNumber(arraybuffer, offset + 1, lengthReader[0] >> 4);
				case types.RAW:
					var arr = new Uint8Array(arraybuffer, offset + 1, lengthReader[0] >> 4);
					return arr;
			}

			throw new Error(type + ' is not supported!');
		}

		function readBoolean(arraybuffer, offset) {
			var arr = new Uint8Array(arraybuffer, offset, 1);
			return !!arr[0];
		}

		function readNumber(arraybuffer, offset, length) {
			var arr = new Uint8Array(arraybuffer, offset, length),
				number = 0;

			while (length) {
				length--;
				number |= arr[length] << (8 * length);
			}
			return number;
		}

		function writeObject(arraybuffer, offset, objectToWrite) {
			// First: write all the values
			var keys = Object.keys(objectToWrite),
				key = key.pop(),
				keyPointerMap;

			while(key) {
				var value = objectToWrite[key];
				keyPointerMap[key] = offset;
				switch(typeof value) {
					case 'object':
						offset = writeObject(arraybuffer, offset, value);
						break;
					case 'number':
						offset = writeNumber(arraybuffer, offset, value);
						break;
					case 'boolean':
						offset = writeBoolean(arraybuffer, offset, value);
				}
				key = keys.pop();
			}
		}

		return {
			types: types,
			writeDataModel: writeDataModel,
			writeBoolean: writeBoolean,
			writeNumber: writeNumber,
			readDataModel: readDataModel
		};
	}
);
