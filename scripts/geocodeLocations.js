var fs = require("fs"),
    path = require("path"),
    request = require('request'),
    filequeue = require('filequeue');

var fq = new filequeue(1000);
var locations = {};
var index = 0;

// Reads in the file of locations created in createJson.js
fq.readFile("eeb_json/locations.json", "utf8", function (err, data) {
    locations = JSON.parse(data);
    geocode();
});

/////
// Function geocode()
// A recursive function that geocodes each item in the locations object
////
var geocode = function () {

    var loc = Object.keys(locations)[index];
    console.log(loc);
    var url = 'http://nominatim.openstreetmap.org/search?q=' + encodeURI(loc) + '&format=json';
    console.log(url);

    // There is a limit to how often you can call the geocoding service.  Run this on a delay of just over a second
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

            locations[loc].locPoint = geoJsonPoint;
            locations[loc].locBound = geoJsonBound;

            if ((index + 1) == Object.keys(locations).length) {
                fs.writeFile("eeb_json/locations_geocoded.json", JSON.stringify(locations), function (err) { });
            } else {
                index++;
                geocode();
            }
        });

    }, 1200);
};