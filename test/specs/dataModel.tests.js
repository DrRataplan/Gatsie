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
						dataModel.writeDataModel(array, 0, 1, dataModel.types.RAW, [123]);
						var roundTripped = dataModel.readDataModel(array, 0);
						
						expect(roundTripped.length).to.equal(1);
						expect(roundTripped[0]).to.equal(123);
					});
				});

			it('Should round-trip raw data with length 8 to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						dataModel.writeDataModel(array, 0, 8, dataModel.types.RAW, [0, 1, 2, 3, 4, 5, 6, 7]);
						var roundTripped = dataModel.readDataModel(array, 0);
						
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
						dataModel.writeNumber(array, 0, 123);

						var number = dataModel.readDataModel(array, 0);

						expect(number).to.equal(123);
					});
			});

			it('Should round-trip a number of 2 byte to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						dataModel.writeNumber(array, 0, 0xABCD);

						var number = dataModel.readDataModel(array, 0);

						expect(number).to.equal(0xABCD);
					});
			});

			it('Should round-trip multiple numbers of 2 byte to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						var newOffset = dataModel.writeNumber(array, 0, 0xABCD);

						dataModel.writeNumber(array, newOffset, 0xEF01);

						var number2 = dataModel.readDataModel(array, newOffset);

						expect(number2).to.equal(0xEF01);
					});
			});

			it('Should round-trip a number of n byte to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						dataModel.writeNumber(array, 0, 0x01234567);

						var number = dataModel.readDataModel(array, 0);

						expect(number).to.equal(0x01234567);
					});
			});

			it('Should round-trip a boolean to the same result',
				function() {
					withAnSetUpTypedArrayOfLength(128, function(array) {
						dataModel.writeBoolean(array, 0, true);

						var b = dataModel.readDataModel(array, 0);

						expect(b).to.equal(true);

						dataModel.writeBoolean(array, 0, false);

						b = dataModel.readDataModel(array, 0);

						expect(b).to.equal(false);

					});
			});
		});
	}
);
