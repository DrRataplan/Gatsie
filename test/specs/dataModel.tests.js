define([
		'memory/dataModel'
	], function(
		dataModel
	) {
	'use strict';

	var expect = chai.expect,

		withAnSetUpTypedArrayOfLength = function(length, callback) {
			var array = new Uint8Array(length);
			callback(array);
		};

	describe('Writing an array',
		function() {
			it('Should round-trip raw data with length 1 to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var pointer = dataModel.writeDataModel(array, 1, dataModel.types.RAW, [123]);
						var roundTripped = dataModel.readDataModel(array, pointer);
						
						expect(roundTripped.length).to.equal(1);
						expect(roundTripped[0]).to.equal(123);
					});
				});

			it('Should round-trip raw data with length 8 to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var pointer = dataModel.writeDataModel(array, 8, dataModel.types.RAW, [0, 1, 2, 3, 4, 5, 6, 7]);
						var roundTripped = dataModel.readDataModel(array, pointer);
						
						expect(roundTripped.length).to.equal(8);
						expect(roundTripped[0]).to.equal(0);
						expect(roundTripped[1]).to.equal(1);
						expect(roundTripped[2]).to.equal(2);
						expect(roundTripped[3]).to.equal(3);
						expect(roundTripped[4]).to.equal(4);
						expect(roundTripped[5]).to.equal(5);
						expect(roundTripped[6]).to.equal(6);
						expect(roundTripped[7]).to.equal(7);
					});
				});

			it('Should round-trip a number of 1 byte to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var pointer = dataModel.writeNumber(array, 123);

						var number = dataModel.readDataModel(array, pointer);

						expect(number).to.equal(123);
					});
			});

			it('Should round-trip a number of 2 byte to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var pointer = dataModel.writeNumber(array, 0xABCD);

						var number = dataModel.readDataModel(array, pointer);

						expect(number).to.equal(0xABCD);
					});
			});

			it('Should round-trip multiple numbers of 2 byte to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var pointer1 = dataModel.writeNumber(array, 0x0123);
						var pointer2 = dataModel.writeNumber(array, 0x4567);
						var pointer3 = dataModel.writeNumber(array, 0x89AB);
						var pointer4 = dataModel.writeNumber(array, 0xCDEF);

						var number1 = dataModel.readDataModel(array, pointer1);
						var number2 = dataModel.readDataModel(array, pointer2);
						var number3 = dataModel.readDataModel(array, pointer3);
						var number4 = dataModel.readDataModel(array, pointer4);

						expect(number1).to.equal(0x0123);
						expect(number2).to.equal(0x4567);
						expect(number3).to.equal(0x89AB);
						expect(number4).to.equal(0xCDEF);
					});
			});

			it('Should round-trip a number of n byte to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var pointer = dataModel.writeNumber(array, 0x01234567);

						var number = dataModel.readDataModel(array, pointer);

						expect(number).to.equal(0x01234567);
					});
			});

			it('Should round-trip a boolean to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var pointer1 = dataModel.writeBoolean(array, true);

						var b = dataModel.readDataModel(array, pointer1);

						expect(b).to.equal(true);

						var pointer2 = dataModel.writeBoolean(array, false);

						b = dataModel.readDataModel(array, pointer2);

						expect(b).to.equal(false);

					});
			});

		});

	describe('Alloc', function() {
		it('Should start allocating memory from the beginning', function() {
			withAnSetUpTypedArrayOfLength(4, function(array) {
				var freePointer = dataModel.alloc(array, 1);
				expect(freePointer).to.equal(0);
			});
		});
		
		it('Should fill an array to the brim',
			function() {
				withAnSetUpTypedArrayOfLength(4, function(array) {
					// Remind: one header byte, so a boolean uses 2 bytes
					var pointer1, pointer2;
					expect(function() {
						pointer1 = dataModel.writeBoolean(array, true);
						pointer2 = dataModel.writeNumber(array, 126);

					}).to.not.throw(Error);
					expect(dataModel.readDataModel(array, pointer1)).to.equal(true);
					expect(dataModel.readDataModel(array, pointer2)).to.equal(126);

					expect(function() {
						dataModel.writeBoolean(array, true);
					}).to.throw(Error);
				});
		});
	});
	}
);
