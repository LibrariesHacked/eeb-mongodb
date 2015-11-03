var fs = require("fs"),
    path = require("path"),
    request = require('request'),
    filequeue = require('filequeue');

var fq = new filequeue(1000);
var locations = {};

fq.readFile(file, "utf8", function (err, data) {
    locationsArray = JSON.parse(data);
    geocode();
});

var geocode = function () {

    for (var i in locationsArray) {
        var loc = locationsArray[i];

        var url = 'http://nominatim.openstreetmap.org/search?q=' + encodeURI(i) + '&format=json';
        console.log(url);
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

                locations[i].locPoint = geoJsonPoint;
                locations[i].locBound = geoJsonBound;

            });

        }, 2000);
    }

    fs.writeFile("locations.json", JSON.stringify(locations), function (err) { });
};