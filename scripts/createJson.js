var fs = require("fs"),
    path = require("path"),
    xml2js = require('xml2js'),
    filequeue = require('filequeue');

var fq = new filequeue(1000);
var parseString = xml2js.parseString;
var locations = {};
var completed = 0;

fs.readdir("eeb_xml/", function (err, files) {
    files.map(function (file) {
        return path.join("eeb_xml/", file);
    }).forEach(function (file) {
        fq.readFile(file, "utf8", function (err, data) {

            parseString(data, function (err, result) {
                completed++;
                if (!err) {

                    var fileDesc = result.TEI.teiHeader[0].fileDesc[0];
                    var profileDesc = result.TEI.teiHeader[0].profileDesc[0];
                    var biblFull = fileDesc.sourceDesc[0].biblFull[0];
                    var edition = fileDesc.editionStmt[0].edition[0];
                    var bibPubStmt = biblFull.publicationStmt[0];
                    var titleStmt = biblFull.titleStmt[0];
                    var id = fileDesc.publicationStmt[0].idno[0]._;

                    // Populate the properties of the book - currently title, author, date, edition date, and publication statement place/date/publisher
                    var book = { _id: id };
                    if (titleStmt.title) book.titles = titleStmt.title;
                    if (titleStmt.author) book.authors = titleStmt.author;
                    if (bibPubStmt.pubPlace) {
                        book.place = bibPubStmt.pubPlace[0].trim();
                        if (!locations[book.place]) locations[book.place] = { "books": [] };
                        locations[book.place]["books"].push(book._id);
                    }
                    if (bibPubStmt.date) book.date = bibPubStmt.date[0].trim();
                    if (bibPubStmt.publisher) book.publisher = bibPubStmt.publisher[0].trim();
                    if (biblFull.notesStmt) book.notes = biblFull.notesStmt[0].note;
                    if (edition.date) book.editionDate = edition.date[0];
                    if (profileDesc.langUsage[0]) book.language = profileDesc.langUsage[0].language[0]._;
                    if (profileDesc.textClass) book.keywords = profileDesc.textClass[0].keywords[0].term;

                    // For each JSON object, write it out as a file e.g. A00002.json
                    fs.writeFile("eeb_json/" + id + ".json", JSON.stringify(book), function (err) { });

                    // Once they're all done write out a JSON file for all the unique locations, and dates.
                    // if (files.length == completed) fs.writeFile("locations.json", JSON.stringify(locations), function (err) { });
                }
            });
        });
    });
});