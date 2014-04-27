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
		 * 	- 4 bit length
		 * 	- 1 bit GC
		 * 	- 3 bit type
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
		 * @param  {[type]} array  [description]
		 * @param  {[type]} length [description]
		 * @return {[type]}        [description]
		 */
		function alloc(array, length) {
			var arrayLength = array.length;
			for(var i = 0; true; ++i) {
				if(i > arrayLength) {
					throw new Error('');
				}
				//console.log('Looking at '+i);
				var headerByte = array[i],
					reservedLength = (headerByte >> 4) | 0;
				// If this item has not been GCed (GC bit = 1), it's useless
				if (headerByte && (headerByte & 0x8) !== 0x8){
					//console.log('skipping '+reservedLength+' from '+i);
					foundFreeLength = 0;
					i += reservedLength;
					continue;
				}
				//console.log('found empty @ '+i);

				// Start looking into this item to find if it's long enough
				var foundFreeLength = reservedLength + 1;

				for(var j = i + reservedLength; j < arrayLength; j++) {
					if (foundFreeLength >= length) {
						//console.log('found '+foundFreeLength+' at '+i);
						return i;
					}
					//console.log('Looking into '+j);
					headerByte = array[j];
					reservedLength = headerByte >> 4;
					if (headerByte & 0x8 === 0x8) {
						// GCed, this piece of memory is free
						j += reservedLength;
						foundFreeLength += reservedLength;
					} else if(reservedLength === 0) {
						// Empty item, see if the next item is also filled
						foundFreeLength ++;
					} else {
						// Item is in use,
						//  Look further in outer loop
						i = j;
						foundFreeLength = 0;
						break;
					}
				}
			}
			throw new Error('OUTOFMEMORY');
		}

		function free(array, offset) {
			//console.log(offset+' freed: '+(array[offset] >> 4));
			// Manually free this piece of data
			array[offset] |= 0x8;
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

			alloc: alloc,
			free: free
		};
	}
);
