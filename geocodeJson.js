var fs = require("fs"),
    path = require("path"),
    request = require('request'),
    filequeue = require('filequeue');

var fq = new filequeue(1000);
var booksArray = [];
var geoLocations = {};

fs.readdir("eeb_json/", function (err, files) {
    fileCount = files.length - 1;
    files.map(function (file) {
        return path.join("eeb_json/", file);
    }).forEach(function (file) {
        fq.readFile(file, "utf8", function (err, data) {
            if (!err) {
                booksArray.push(JSON.parse(data));
            }
        });
    });
});

booksArray.forEach(function (book) {
    if (!geoLocations[book.publicationPlace]) {

        var url = 'http://nominatim.openstreetmap.org/search?q=' + encodeURI(book.publicationPlace) + '&format=json';
        setTimeout(function () {
            var option = { method: 'GET', uri: url };
            request(option, function (err, res, body) {
                var resp = JSON.parse(body);
                var geoJsonPoint = { type: "Point", coordinates: [resp[0].lat, resp[0].lon] };
                var bBox = resp[0].boundingbox;
                var geoJsonBound = {
                    type: "Polygon",
                    coordinates: [[[bBox[0], bBox[2]], [bBox[1], bBox[2]], [bBox[1], bBox[3]], [bBox[0], bBox[3]], [bBox[0], bBox[2]]]]
                };

                geoLocations[place] = { locPoint: geoJsonPoint, locBound: geoJsonBound };
                book.locPoint = geoJsonPoint;
                book.locBound = geoJsonBound;
                fs.writeFile("eeb_json_geocoded/" + id + ".json", JSON.stringify(book), function (err) {});
            });

        }, 2000);

    } else {
        book.locPoint = geoLocations[place].locPoint;
        book.locBound = geoLocations[place].locBound;
        fs.writeFile("eeb_json_geocoded/" + id + ".json", JSON.stringify(book), function (err) {});
    }
});