var fs = require("fs"),
    path = require("path"),
    xml2js = require('xml2js'),
    filequeue = require('filequeue');

var fq = new filequeue(1000);
var parseString = xml2js.parseString;

fs.readdir("eeb_xml/", function (err, files) {
    files.map(function (file) {
        return path.join("eeb_xml/", file);
    }).forEach(function (file) {
        fq.readFile(file, "utf8", function (err, data) {
            
            parseString(data, function (err, result) {

                if (!err) {

                    var desc = result.TEI.teiHeader[0].fileDesc[0].sourceDesc[0].biblFull[0];
                    var id = result.TEI.teiHeader[0].fileDesc[0].publicationStmt[0].idno[0]._;

                    // Populate the properties of the book - currently title, author, date, publisher, and published place
                    var book = { _id: id };
                    if (desc.titleStmt[0].title) book.title = desc.titleStmt[0].title[0];
                    if (desc.titleStmt[0].author) book.author = desc.titleStmt[0].author[0];
                    if (desc.publicationStmt[0].pubPlace) book.publicationPlace = desc.publicationStmt[0].pubPlace[0].replace(' :', '').replace('[', '').replace(']', '').replace('At ', '').replace('?', '').replace('Imprinted at', '').trim();
                    if (desc.publicationStmt[0].date) book.publicationDate = desc.publicationStmt[0].date[0].replace('.', '').replace('[', '').replace(']', '').replace('?', '');
                    if (desc.publicationStmt[0].publisher) book.publisher = desc.publicationStmt[0].publisher[0];
                    if (desc.publicationStmt[0].notesStmt) book.notes = desc.publicationStmt[0].notesStmt[0].note;

                    fs.writeFile("eeb_json/" + id + ".json", JSON.stringify(book), function (err) {});
                }
            });
        });
    });
});