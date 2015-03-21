module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        js: "<%= pkg.js %>/*.{js,jsx}",
        bundle: "<%= pkg.dest %>/bundle",
        watch: {
            files: ["<%= js %>"],
            tasks: ["browserify"]
        },
        browserify: {
            options: {
                debug: true,
                transform: ["reactify"],
                extensions: [".jsx"]
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
};