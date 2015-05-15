
var csvArray = []
var record;
var data = csvArray;

function parseCSV(){
	var csvArray = []
     recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var retrievedRecords = doc.rows
    	for (i = 0; i < retrievedRecords.length; i++){
    		csvString = {};
    		record = retrievedRecords[i].doc.obj;
    		console.log(record);
    		var csvString = { "Date" : record.date,  "Time" : record.Time, "Operator" : record.operator, "Source Name" : record.cSource.name, "N" : record.cSource.N,
                             "P" : record.cSource.P, "K" : record.cSource.K, "Nutrient Measure" : record.cSource.nutrientUnit, "Spreader" : record.cSpred.name,
                             "Spreader Capacity" : record.cSpred.capacity +'(' + record.cSpred.unit +')', "Load Fill Level" : record.fillLevel,
    						"Field" : record.field.name, "Field Area (ac)" : record.field.area, "Rate" : record.rate, "Rate Unit": record.field.unit,"Path Length": record.pathLength, "Path Area (ac)": record.loadArea};
    		csvArray.push(csvString);
    		stCSVArray = JSON.stringify(csvArray);
    	}
    	JSONToCSVConvertor(stCSVArray, "Record", true);
    });
}

// $(document).ready(function(){
    // $('button').click(function(){
        // var data = $('#txt').val();
        // if(data == '')
            // return;
        
        // JSONToCSVConvertor(data, "Manure Record", true);
    // });
// });

function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var csvArray = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    
    var CSV = '';    
    //Set Report title in first row or line
    
    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        
        //This loop will extract the label from 1st index of on array
        for (var index in csvArray[0]) {
            
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);
        
        //append Label row with line break
        CSV += row + '\r\n';
    }
    
    //1st loop is to extract each row
    for (var i = 0; i < csvArray.length; i++) {
        var row = "";
        
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in csvArray[i]) {
            row += '"' + csvArray[i][index] + '",';
        }

        row.slice(0, row.length - 1);
        
        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    
    //Generate a file name
    var fileName = "Manure_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV);
   

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);


    //request the persistent file system
    // request the persistent file system
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    function gotFS(fileSystem) {
        console.log(fileSystem.name);
        fileSystem.root.getFile("Manure_Records.csv", {create: true, exclusive: false, append: true}, gotFileEntry, fail);
    }
    function gotFileEntry(fileEntry) {
    fileEntry.createWriter(gotFileWriter, fail);
    }

    function gotFileWriter(writer) {
        writer.onwriteend = function(evt) {
        console.log("write success");
        };
        writer.seek(writer.length);
        writer.write(CSV);
        alert("File created successfully: Manure_Record.csv");
    }

    function fail(error) {
    console.log(error.code);
    alert (error.code);
    }

}


$("#save").on ("tap", function (event){
/*var $link = $("#dataLink");*/
    var csv = "";

    db.transaction (function (transaction) {

        var sql = "SELECT * FROM datastorage";
        transaction.executeSql (sql, undefined, 
        function (transaction, result){
            if (result.rows.length){
                for (var i = 0; i < result.rows.length; i++) {
                    var row = result.rows.item (i);
                    var id = row.id;
                    var data = row.data;
                    var book = row.book;
                    var page = row.page;

                    csv += id + "," + data + "," + book + "," + page + "\n";    
                }
                console.log(csv);
                /*$link.attr("href", 'data:Application/octet-stream,' + encodeURIComponent(csv))[0].click();*/

                // request the persistent file system
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
                function gotFS(fileSystem) {
                console.log(fileSystem.name);
                fileSystem.root.getFile("data.csv", {create: true, exclusive: false, append: true}, gotFileEntry, fail);
                }

                function gotFileEntry(fileEntry) {
                fileEntry.createWriter(gotFileWriter, fail);
                }

                function gotFileWriter(writer) {
                    writer.onwriteend = function(evt) {
                    console.log("write success");
                    };
                    writer.seek(writer.length);
                    writer.write(csv);
                }

                function fail(error) {
                console.log(error.code);
                alert (error.code);
                }

            }
        }, error);
    });
});