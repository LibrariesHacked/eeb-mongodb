var fs = require("fs"),
    path = require("path"),
    filequeue = require('filequeue');

var fq = new filequeue(1000);
var locations = {};
var dates = {};
var completed = 0;

fs.readdir("eeb_json/", function (err, files) {
    files.map(function (file) {
        return path.join("eeb_json/", file);
    }).forEach(function (file) {
        fq.readFile(file, "utf8", function (err, data) {

            var book = JSON.parse(data);
            completed++;

            if (book.publicationPlace) {
                if (!locations[book.publicationPlace]) locations[book.publicationPlace] = { "books": [] };
                locations[book.publicationPlace]["books"].push(book._id);
            }
            if (book.publicationDate) {
                if (!dates[book.publicationDate]) dates[book.publicationDate] = { "books": [] };
                dates[book.publicationDate]["books"].push(book._id);
            }

            if (files.length == completed) {
                fs.writeFile("eeb_json/locations.json", JSON.stringify(locations), function (err) { });
                fs.writeFile("eeb_json/dates.json", JSON.stringify(dates), function (err) { });
            }
        });
    });
});