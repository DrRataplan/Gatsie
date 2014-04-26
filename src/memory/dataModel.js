define([
	],
	function(
	) {
		'use strict';

		/**
		 * @enum
		 */
		var types = {
			BOOLEAN: 4,
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
		 * @param  {Number}        length          [description]
		 * @param  {Number}        type            [description]
		 * @param  {Array.Number}  serializedData  The data, serialized as 8-bit numbers to write to the array
		 * @return {Number}        The offset (pointer) to the data
		 */
		function writeDataModel(array, length, type, serializedData) {
			var offset = alloc(array, length + 1);
			array[offset] = (length << 4) | type;
			for (var i = 0; i < length; i++) {
				array[offset + i + 1] = serializedData[i]; 
			}

			return offset;
		}

		function writeNumber(array, numberToWrite) {
			var serializedData = [];
			for (var number = numberToWrite | 0; number; number = number >> 8) {
				serializedData.push(number & 0xFF);
			}

			var result = writeDataModel(array, serializedData.length, types.NUMBER, serializedData);
			return result;
		}

		function writeBoolean(array, booleanToWrite) {
			return writeDataModel(array, 1, types.BOOLEAN, [booleanToWrite | 0]);
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

		/**
		 * Lineary looks for a gap large enough to fit length
		 *
		 * See, there IS a use for GOTOs
		 * @param  {[type]} array  [description]
		 * @param  {[type]} length [description]
		 * @return {[type]}        [description]
		 */
		function alloc(array, length) {
			var arrayLength = array.length;
			for(var i = 0; i < arrayLength; ++i) {
				var reservedLength = array[i] >> 4;

				if (reservedLength !== 0) {
					i += reservedLength;
					continue;
				}

				// Look for free space at all of the next positions
				var j = i + 1,
					foundFreeLength = 1;
				while(array[j++] >> 4 === 0) {	
					if (++foundFreeLength >= length) {
						return i;
					}
				}
				foundFreeLength = 0;
				i = j;
			}
			throw new Error('OUTOFMEMORY');
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
			readDataModel: readDataModel,

			alloc: alloc
		};
	}
);
