define([
	],
	function(
		) {
		'use strict';
		/**
		 * @doc module
		 * @id webworker-test.linked-list:index
		 * @name blaat
		 * @module linked-list
		 * @description Provides various functions to use an ArrayBuffer as a serialization for a linked list
		 */
		/**
		 * @doc function
		 * @method insert
		 * @name webworker-test.linked-list:.insert
		 * 
		 * @description Provides a linked list using a
		 *   2 byte pointer to the previous item, a 2 byte pointer to the next item
		 *   and a 4 byte pointer to the data item
		 *
		 * To retrieve the data set here, use {@link webworker-test.linked-list:.get}
		 *
		 * Serializes to a 16bit array
		 *`
		 * @param   {ArrayBuffer}  array            The arraybuffer to serialize to
		 * @param   {Number}       headPointer      The offset in bytes to start writing at
		 * @param   {Number}       previousPointer  The previous linked-list in the list
		 * @param   {Number}       data             The data to save
		 * @return  {Number}       The new HeadPointer
		 *
		 * @usage vcd
		 * @functionOf webworker-test.linked-list:index
		 * @example
		 * var arr = new ArrayBuffer(arraybufferLength),
		 * 	data = 1234;
		 * linked-list.insert(arr, 0, 0, data);
		 */

		function insert(array, headPointer, previousPointer, data) {
			if(headPointer > 0xFF)
				throw new Error('Out of Bounds');
			if(data > 0xFFFF)
				throw new Error('Data Out of Bounds');

			// get the previous one
			var previous = new Uint16Array(array, previousPointer | 0, 4);
			if (previous[0]) {
				previous[4] = headPointer;
				previous.set(array, previousPointer | 0);
			}

			var newItem = new Uint16Array(array, headPointer | 0, 4);
			newItem[0] = previousPointer;
			newItem[1] = data >> 16;
			newItem[2] = (data & 0xFFFF)| 0;
			newItem[3] = 0;
			newItem.set(array, headPointer | 0);

			return headPointer + newItem.length;
		}

		/**
		 * @doc function
		 * 
		 * @description Get the value of data at the given offset
		 * @name webworker-test.linked-list:.get
		 * @method get
		 * 
		 * @param  {ArrayBuffer} array    The arraybuffer to serialize from
		 * @param  {Number}      pointer  The offset in bytes to read from
		 * @return {Number}      The value of data
		 */
		function get(array, pointer) {
			var item = new Uint16Array(array, pointer | 0, 4);

			return (item[1] << 16) | item[2] | 0;
		}

		/**
		 * @doc  function
		 *
		 * @description  Get the data of the previous linked-list in the linked list
		 * @name webworker-test.linked-list:.previous
		 * @method previous
		 * 
		 * @param  {ArrayBuffer} array    The ArrayBuffer to serialize from
		 * @param  {Number}      pointer  The offset in bytes to start reading the next linked-list from
		 * @return {Number}               The data vaue of the previous linked-list in the linked list
		 */
		function previous(array, pointer) {
			var prev = new Uint16Array(array, pointer | 0, 4);
			return get(array, prev[0] | 0);
		}

		return { 
			insert: insert, 
			get: get,   
			previous: previous
		};
	}
);