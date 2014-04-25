module.exports = function(grunt) {
 
		// Project configuration.
		grunt.initConfig({
				pkg: grunt.file.readJSON('package.json'),
				docular: {
					groups: [
						{
							groupTitle: "webworker-test",
							groupId: "webworker-test",
							showSource: true,
							sections: [
								{
									id: "linked-list",
									scripts: [
										"src/linked_list/"
									],
									title: "linked_list",

								}
							]
						}
					]
				}
		});

		grunt.loadNpmTasks('grunt-docular');
};
