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

            if (book.publicationStmtPlace) {

                // Do some cleaning up of the data in order to geocode it later
                var location = book.publicationStmtPlace.toLowerCase()
                    .replace(' :', '')
                    .replace('.', '')
                    .replace('[', '')
                    .replace(']', '')
                    .replace('(', '')
                    .replace(')', '')
                    .replace('?', '')
                    .replace(',', '')
                    .replace(' in ', ' ')
                    .replace(' at ', ' ')
                    .replace(' im ', ' ')
                    .replace('imprynted', '')
                    .replace('imprinted', '')
                    .replace('enprynted', '')
                    .replace('emprynted', '')
                    .replace('imprentit', '')
                    .replace('impress', '')
                    .replace('prentyd', '')
                    .replace('printet','')
                    .replace('printed', '')
                    .replace('prynted', '')
                    .replace('prented', '')
                    .replace('england', '')
                    .replace('newly', '')
                    .trim();

                if (!locations[location]) locations[location] = { "books": [] };
                locations[location]["books"].push(book._id);
            }

            if (files.length == completed) {
                fs.writeFile("eeb_json/locations.json", JSON.stringify(locations), function (err) { });
            }
        });
    });
});