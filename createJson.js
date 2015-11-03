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

                    var desc = result.TEI.teiHeader[0].fileDesc[0].sourceDesc[0].biblFull[0];
                    var id = result.TEI.teiHeader[0].fileDesc[0].publicationStmt[0].idno[0]._;

                    // Populate the properties of the book - currently title, author, date, edition date, and publication statement place/date/publisher
                    var book = { _id: id };
                    if (desc.titleStmt[0].title) book.title = desc.titleStmt[0].title[0].trim();
                    if (desc.titleStmt[0].author) book.author = desc.titleStmt[0].author[0].trim();
                    if (desc.publicationStmt[0].pubPlace) {
                        book.publicationStmtPlace = desc.publicationStmt[0].pubPlace[0].trim();
                        if (!locations[book.publicationStmtPlace]) locations[book.publicationStmtPlace] = { "books": [] };
                        locations[book.publicationStmtPlace]["books"].push(book._id);
                    }
                    if (desc.publicationStmt[0].date) book.publicationStmtDate = desc.publicationStmt[0].date[0].trim();
                    if (desc.publicationStmt[0].publisher) book.publicationStmtPublisher = desc.publicationStmt[0].publisher[0].trim();
                    if (desc.publicationStmt[0].notesStmt) book.notes = desc.publicationStmt[0].notesStmt[0].note.trim();
                    if (result.TEI.teiHeader[0].fileDesc[0].editionStmt[0].edition[0].date) book.editionDate = result.TEI.teiHeader[0].fileDesc[0].editionStmt[0].edition[0].date[0];

                    // For each JSON object, write it out as a file e.g. A00002.json
                    fs.writeFile("eeb_json/" + id + ".json", JSON.stringify(book), function (err) { });

                    // Once they're all done write out a JSON file for all the unique locations, and dates.
                    if (files.length == completed) fs.writeFile("locations.json", JSON.stringify(locations), function (err) { });
                }
            });
        });
    });
});