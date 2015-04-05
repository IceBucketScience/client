var request = require("request");
var fs = require("fs");

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        js: "<%= pkg.js %>/**/*.{js,jsx}",
        bundle: "<%= pkg.dest %>/bundle",
        watch: {
            files: ["<%= js %>"],
            tasks: ["package:dev"]
        },
        browserify: {
            options: {
                debug: true,
                transform: ["browserify-shim", "reactify"]
            },
            dev: {
                options: {
                    alias: ["react:"]
                },
                src: ["<%= js %>"],
                dest: "<%= bundle %>.js"
            },
            dist: {
                options: {
                    debug: false,
                    transform: ["reactify", ["uglifyify", {"global": true}]]
                },
                src: ["<%= js %>"],
                dest: "<%= bundle %>.min.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-browserify");

    grunt.registerTask("downloadFbSDK", function() {
        var done = this.async();

        var fbSdkFileStream = request(grunt.config("pkg.fbSdkUrl")).pipe(fs.createWriteStream(grunt.config("pkg.dest") + "/fb-sdk.js"));

        fbSdkFileStream.on("finish", function() {
            done();
        });

        fbSdkFileStream.on("error", function(err) {
            grunt.log.writeln(err);
            done(false);
        });
    });

    grunt.registerTask("package:dev", [/*"downloadFbSDK",*/ "browserify:dev"]);
    grunt.registerTask("package:dist", [/*"downloadFbSDK",*/ "browserify:dist"]);
};