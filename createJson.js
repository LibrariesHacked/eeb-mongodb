var fs = require("fs"),
    path = require("path"),
    xml2js = require('xml2js'),
    filequeue = require('filequeue');

var fq = new filequeue(1000);
var parseString = xml2js.parseString;
var locations = [];
var dates = [];
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
                        locations[book.publicationStmtPlace]["books"].push(id);
                    }
                    if (desc.publicationStmt[0].date) {
                        book.publicationStmtDate = desc.publicationStmt[0].date[0].trim();
                        if (!dates[book.publicationStmtDate]) dates[book.publicationStmtDate] = { "books": [] };
                        dates[book.publicationStmtDate]["books"].push(id);
                    }
                    if (desc.publicationStmt[0].publisher) book.publicationStmtPublisher = desc.publicationStmt[0].publisher[0].trim();
                    if (desc.publicationStmt[0].notesStmt) book.notes = desc.publicationStmt[0].notesStmt[0].note.trim();

                    fs.writeFile("eeb_json/" + id + ".json", JSON.stringify(book), function (err) { });

                    if (files.count == completed) {
                        fs.writeFile("locations.json", JSON.stringify(locations), function (err) { });
                        fs.writeFile("dates.json", JSON.stringify(dates), function (err) { });
                    }
                }
            });
        });
    });
});