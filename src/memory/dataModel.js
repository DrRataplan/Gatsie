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
		 * @param  {Uint8Array}   array     [description]
		 * @param  {Number}        offset          [description]
		 * @param  {Number}        length          [description]
		 * @param  {Number}        type            [description]
		 * @param  {Array.Number}  serializedData  The data, serialized as 8-bit numbers to write to the array
		 * @return {Number}        The new Offset
		 */
		function writeDataModel(array, offset, length, type, serializedData) {
			array[offset] = (length << 4) | type;
			for (var i = 0; i < length; i++) {
				array[offset + i + 1] = serializedData[i]; 
			}

			return offset + length + 1;
		}

		function writeNumber(array, offset, numberToWrite) {
			var serializedData = [];
			for (var number = numberToWrite | 0; number; number = number >> 8) {
				serializedData.push(number & 0xFF);
			}

			var result = writeDataModel(array, offset, serializedData.length, types.NUMBER, serializedData);
			return result;
		}

		function writeBoolean(array, offset, booleanToWrite) {
			return writeDataModel(array, offset, 1, types.BOOLEAN, [booleanToWrite | 0]);
		}

		function readDataModel(array, offset) {
			var type = array[offset] & 0x7;
			switch(type) {
				case types.BOOLEAN:
					return readBoolean(array, offset + 1);
				case types.NUMBER:
					return readNumber(array, offset + 1, array[offset] >> 4);
				case types.RAW:
					return new Uint8Array(array.buffer, offset + 1, array[offset] >> 4);
			}

			throw new Error(type + ' is not supported!');
		}

		function readBoolean(array, offset) {
			return !!array[offset];
		}

		function readNumber(array, offset, length) {
			var number = 0;

			for(var i = 0; i < length; i++) {
				number |= array[offset + i] << (8 * i);
			}
			return number;
		}

		function alloc(array, length) {

		}

		function writeObject(array, offset, objectToWrite) {
			// First: write all the values
			var keys = Object.keys(objectToWrite),
				key = key.pop(),
				keyPointerMap;

			while(key) {
				var value = objectToWrite[key];
				keyPointerMap[key] = offset;
				switch(typeof value) {
					case 'object':
						offset = writeObject(array, offset, value);
						break;
					case 'number':
						offset = writeNumber(array, offset, value);
						break;
					case 'boolean':
						offset = writeBoolean(array, offset, value);
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
