
var spread = 0;
var cur_operator;
var newOperator = {};
// var operators = ["Matt", "Luke", "Sam", "Ray"];
var cur_source;
var cur_record;
var cur_field;
var cur_spreadr;
// var spreaders = [       
//         {"name":"Kuhn 8132" , capacity: 13, unit: "Tons" , width: 20, type : "Right Discharge"},
//         {"name":"Balzer" , capacity: 4800, unit: "Gallons", width: 50, type : "Right Discharge"}
// ];
// var spreaders = [];
var fields = [];
var pathTimer;

// var sources = [
//     {"name":"Pit one", nutrientUnit :"Lbs/1000Gallon", N: 20, P : 22, K: 13},
//     {"name": "Pit two", nutrientUnit :"Lbs/Ton", N:18, P:26, K: 26}
// ]; 
		

 var remoteAddress = 'https://koester:blink182@koester.cloudant.com';
//var remoteAddress = 'http://localhost:5984';
//var remoteAddress = 'https://koesterm.iriscouch.com';
//===========================================Star/Stop functions for unloading==========================================

function startUnload(){
    spread = 1;
    cur_record = {};
    if(cur_spreader == undefined){
        alert('Please select a spreader');
    }else if(JSON.stringify(cur_field).length == 2 ){
        alert('Please select a field');
    }else if(cur_source == undefined){
        alert('Please select a source');
    }else if(cur_operator == undefined){
        alert('Please select an operator');
    }else{  
       recordPath();
       unloadingDiv()
       getDateTime();
       cur_record.cSpred = cur_spreader;
       cur_record.cSource = cur_source;
       cur_record.date = spreadDate;
       cur_record.Time = spreadTime;
       cur_record.field = cur_field;
       cur_record.operator = cur_operator; 
       cur_record.fillLevel = $("#spFill").val();
       overlay();
       console.log(cur_field);
       console.log(cur_source);
    }
}
    
function loadComplete(){
    spread = 0;
    killPathTimer();
    postPath();
    createMap();
    cur_record.rate = rate.toFixed(2);
    pushRecordToDb();
    overlay();
    cur_path = [];
    startDiv();
}


//========================================Save Spreader, Table, and Click Listeners===================================
 var spreader_db = new PouchDB('spreaders');
 var remoteSp = remoteAddress+'/spreaders';

  function newSyncSpreader(){
    spreader_db.changes({since: 'now', live: true}).on('change', spreaderTableFunc);
    opts = {
        continuous: true
    };

    spreader_db.sync(remoteSp, opts);
}

    spreader_db.sync(remoteSp).on('complete',function(){
        newSyncSpreader();
        spreaderTableFunc();
    }).on('error', function(err){

    });


function pushSpreaderToDb(){
    var dbSpreader = {
        _id: new Date().toISOString(),
        obj: newSpreader
    };
    spreader_db.put(dbSpreader,function callback(err, response){
        if(!err){
        }
    });
}

function createSpreaderTable() {
    var spBody = document.getElementById('spTable');
    var bTbl = document.createElement('table');
    bTbl.style.width = '100%';
    bTbl.style.align = 'center';
    bTbl.style.borderCollapse = "collapse";
    var tbdy = document.createElement('tbody');
	tbdy.setAttribute('border', 'none');

    var tr = document.createElement('tr');
    tr.style.textAlign = 'center'
	
    
    th = document.createElement('th');
    th.innerHTML = "Name";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "Capacity";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "Unit";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "Width (ft)";
    th.width = '16.6%';
    tr.appendChild(th);
    
    th = document.createElement('th');
    th.innerHTML = "Spreader Type";
    th.width = '16.6%';
    tr.appendChild(th);
    tbdy.appendChild(tr);
    
    gHeaderCreated = true;
    bTbl.appendChild(tbdy);
    spBody.appendChild(bTbl);

    $("#spTable").append($(bTbl));
}   


function spreaderTableFunc (){

    if(document.getElementById('spTable') == null){
        $("#spTable").innerHTML = '';
        appendTableRows();
    }else{
        var Table = document.getElementById('spTable');
        Table.innerHTML = ""
        createSpreaderTable();
        appendTableRows();
    }
    spTableClickListener();
    spreaderTableDblClick();
}    


function appendTableRows(){ 
    spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
       var spreaders = doc.rows;
        var tableB = document.getElementById('spTable');
        for (var i = 0; i < spreaders.length; i++) {
         var row = tableB.insertRow(-1);
    	 row.style.height = "50px";
         tableB.style.textAlign = 'center';
    		
         var spName = row.insertCell(-1);
         spName.textAlign = 'center';
         spName.appendChild(document.createTextNode(spreaders[i].doc.obj.name));
         
         var spCapacity = row.insertCell(-1);
         spCapacity.textAlign = 'center';
         spCapacity.appendChild(document.createTextNode(spreaders[i].doc.obj.capacity));
         
         var spUnit = row.insertCell(-1);
         spUnit.textAlign = 'center';
         spUnit.appendChild(document.createTextNode(spreaders[i].doc.obj.unit));
         
         var spWidth = row.insertCell(-1);
         spWidth.textAlign = 'center';
         spWidth.appendChild(document.createTextNode(spreaders[i].doc.obj.width));
         
         var spType = row.insertCell(-1);
         spType.textAlign = 'center';
         spType.appendChild(document.createTextNode(spreaders[i].doc.obj.type));

         tableB.children[0].appendChild(row);
        }
    });
}

function saveSpreader(){
    newSpreader = {};
	newSpreader = {"name": $("#spName").val(), "capacity": $("#spCapacity").val(), "unit": $("#spUnit").val(), "width": $("#spWidth").val(), "type": $("#spType").val(), "ut": $("#unloadTime").val() };
    $("#add-spreader" ).collapsible("collapse");
    pushSpreaderToDb();	
    spCancel();
	console.log(newSpreader);
}

function spCancel(){
    $('#spName').val("");
    $('#spCapacity').val("");
    $('#spUnit').val("");
    $('#spUnit').selectmenu('refresh');
    $('#spWidth').val("");
    $('#spType').val("");
    $('#spType').selectmenu('refresh');
    $('#unloadTime').val("");
    $("#add-spreader").collapsible("collapse");  
}

// spreader table click listener and highlights last selected spreader.
function spTableClickListener(){
     recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
       var retrievedRecords = doc.rows;
        last_spreader = retrievedRecords[retrievedRecords.length - 1];
        $('spTable, td').filter(function(){
            return $(this).text() == last_spreader.doc.obj.cSpred.name;
        }).parent('spTable, tr').toggleClass('highlighted');
        spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
            var spreaders = doc.rows
           var cur_spreader_name = $("#spTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< spreaders.length; i++){
                if (spreaders[i].doc.obj.name === cur_spreader_name){
                    cur_spreader = spreaders[i].doc.obj;
                    break;
                }
            }
            $("#spreaderBtn").text("Spreader : " + cur_spreader.name);
            calculateSpeed();
        });    
    });    
        
    spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
       var spreaders = doc.rows;
        $('#spTable').find('tr').click(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
           var cur_spreader_name = $("#spTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< spreaders.length; i++)
                if (spreaders[i].doc.obj.name === cur_spreader_name){
                    cur_spreader = spreaders[i].doc.obj;
                    break;
                }
            $("#spreaderBtn").text("Spreader : " + cur_spreader.name);
            console.log(spreaders[i].doc.obj);
			calculateSpeed();
        });
    });
}    
    

(function($) {
     $.fn.doubleTap = function(doubleTapCallback) {
         return this.each(function(){
			var elm = this;
			var lastTap = 0;
			$(elm).bind('vmousedown', function (e) {
                var now = (new Date()).valueOf();
				var diff = (now - lastTap);
                lastTap = now ;
                if (diff < 500) {
                    if($.isFunction( doubleTapCallback )){
                       doubleTapCallback.call(elm);
                    }
                }      
			});
         });
    }
})(jQuery);

function spreaderTableDblClick(){
    spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var spreaders = doc.rows;
        $('#spTable').find('tr').doubleTap(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
            var cur_spreader_name = $("#spTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< spreaders.length; i++){
                if (spreaders[i].doc.obj.name === cur_spreader_name){
                    edit_spreader = spreaders[i].doc.obj;
                    break;
                }
            }
            console.log(edit_spreader.name);
            document.getElementById("spreaderEdit").style.visibility = 'visible';
            document.getElementById("spreaderEdit").style.display = 'block';
            document.getElementById("spreaderInitial").style.display = 'none';
            $('#spName').val(edit_spreader.name);
            $('#spCapacity').val(edit_spreader.capacity);
            $('#spUnit').val(edit_spreader.unit);
            $('#spUnit').selectmenu('refresh');
            $('#spWidth').val(edit_spreader.width);
            $('#spType').val(edit_spreader.type);
    		$('#spType').selectmenu('refresh');
            $('#unloadTime').val(edit_spreader.ut);
            $("#add-spreader").collapsible("expand");
        });
    });
}
var removedSpreader;

function deleteSpreader(){
    spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var spreaders = doc.rows;
        console.log(edit_spreader);
        for(i =0; i< spreaders.length; i++){
            if (spreaders[i].doc.obj.name === edit_spreader.name){
               removedSpreader = spreaders[i].doc;
                break;
            }
        }
        console.log(removedSpreader);
        spreader_db.remove(removedSpreader);  
        cancelSpEd();
    });
}

function cancelSpEd(){
    document.getElementById("spreaderEdit").style.visibility = 'hidden';
    document.getElementById("spreaderEdit").style.display = 'none';
    document.getElementById("spreaderInitial").style.display = 'block';
    spCancel();
}

function saveSpEd(){
     spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        spreaders = doc.rows;    
        var editedSpreader = {"name": $("#spName").val(), "capacity": $("#spCapacity").val(), "unit": $("#spUnit").val(), "width": $("#spWidth").val(), "type": $("#spType").val(), "ut": $("#unloadTime").val() };
        for(i =0; i< spreaders.length; i++){
            if (spreaders[i].doc.obj.name === edit_spreader.name){
                spreaders[i].doc.obj = editedSpreader;
                break;
            }
        }
        spreader_db.put(spreaders[i].doc);
        cancelSpEd();
    });    
}

//====================================Save Source, Table, and Click Listeners===============================
 var source_db = new PouchDB('sources');
 var remoteSource = remoteAddress+'/sources';

function newSyncSource(){
    source_db.changes({since: 'now', live: true}).on('change', sourceTableFunc);
    opts = {
        continuous: true
    };

    source_db.sync(remoteSource, opts);
}

    source_db.sync(remoteSource).on('complete',function(){
        sourceTableFunc();
        newSyncSource();
    }).on('error', function(err){

    });



function pushSourceToDb(){
    var dbSource = {
        _id: new Date().toISOString(),
        obj: newSource
    };
    source_db.put(dbSource,function callback(err, response){
        if(!err){
        }
    });
}

/*Creates Source Table*/
function createSourceTable() {
    var cols = "4";
    var soBody = document.getElementById('sourceTable');
    var bTbl = document.createElement('table');
    bTbl.style.width = '100%';
    bTbl.style.align = 'center';
	bTbl.style.borderCollapse = "collapse";
    var tbdy = document.createElement('tbody');
    tbdy.texAlign="center";
    var tr = document.createElement('tr');
    tr.style.textAlign = 'center'
    
    th = document.createElement('th');
    th.innerHTML = "Name";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "Unit";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "N";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "P";
    th.width = '16.6%';
    tr.appendChild(th);
    
    th = document.createElement('th');
    th.innerHTML = "K";
    th.width = '16.6%';
    tr.appendChild(th);
    tbdy.appendChild(tr);
    
    /*th = document.createElement('th');
    th.innerHTML = "Delete";
    th.width = '16.6%';
    tr.appendChild(th);
    tbdy.appendChild(tr);
    */
    gHeaderCreated = true;

    bTbl.appendChild(tbdy);
    soBody.appendChild(bTbl);

    $("#sourceTable").append($(bTbl));
}


function sourceTableFunc() {
    if(document.getElementById('sourceTable') == null) {
        $("#sourceTable").innerHTML = "";
        appendSourceTableRows();
    }else{
        var Table = document.getElementById('sourceTable');
        Table.innerHTML = ""
        createSourceTable();
        appendSourceTableRows();
    }
    sourceTableClickListener();
    sourceTableDblClick();

}    


function appendSourceTableRows(){
    source_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var sources = doc.rows; 
        var tableB = document.getElementById('sourceTable');
        for (var i = 0; i < sources.length; i++) {
            var row = tableB.insertRow(-1);
        	row.style.height = "50px";
            tableB.style.textAlign = 'center';
            
            var sourceName = row.insertCell(-1);
            sourceName.textAlign = 'center';
            sourceName.appendChild(document.createTextNode(sources[i].doc.obj.name));
            
            var sourceNutrientUnit = row.insertCell(-1);
            sourceNutrientUnit.textAlign = 'center';
            sourceNutrientUnit.appendChild(document.createTextNode(sources[i].doc.obj.nutrientUnit));
            
            var sourceN = row.insertCell(-1);
            sourceN.textAlign = 'center';
            sourceN.appendChild(document.createTextNode(sources[i].doc.obj.N));
            
            var sourceP = row.insertCell(-1);
            sourceP.textAlign = 'center';
            sourceP.appendChild(document.createTextNode(sources[i].doc.obj.P));
            
            var sourceK = row.insertCell(-1);
            sourceK.textAlign = 'center';
            sourceK.appendChild(document.createTextNode(sources[i].doc.obj.K));

            tableB.children[0].appendChild(row);
        }
    });
    recordTableStyle();    
}

// Saves and pushes source information to array
function saveSource(){
    newSource = { name: $("#sourceName").val(), nutrientUnit: $("#sourceUnit").val(), N:$("#nUnits").val(), P: $("#pUnits").val(), K: $("#kUnits").val()};   
    pushSourceToDb();
    cancelSource();
    //Changes rate label to display selected unit of measure
    // $(document).ready(function() {
    //     $("select[id = rateUnit").change(function(){
    //     var newText = $('option:selected',this).text();
    //     $("label[for = number]").text(newText);
    //     newText.bold();
    //     });
    // });
    newSource = {};
}
 
 function cancelSource(){
    $( "#add_source" ).collapsible("collapse");
    $('#sourceName').val("");
    $('#sourceUnit').val("");
    $('#sourceUnit').selectmenu('refresh');
    $('#nUnits').val("");
    $('#kUnits').val("");
    $('#pUnits').val("");
 }

function sourceTableClickListener(){
    recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var retrievedRecords = doc.rows; 
        var last_source = retrievedRecords[retrievedRecords.length - 1];
        $('sourceTable, td').filter(function(){
        return $(this).text() == last_source.doc.obj.cSource.name;
        }).parent('sourceTable, tr').toggleClass('highlighted');
        source_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
            var sources = doc.rows;    
            cur_source_name = $("#sourceTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< sources.length; i++){
                if (sources[i].doc.obj.name === cur_source_name){
                    cur_source = sources[i].doc.obj;
                    break;
                }
            }   
            $("#sourceBtn").text("Source : " +cur_source.name);
            numberLoadsFromSource();
        });
    });

    source_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var sources = doc.rows; 
        $('#sourceTable').find('tr').click(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
           cur_source_name = $("#sourceTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< sources.length; i++){
                if (sources[i].doc.obj.name === cur_source_name){
                    cur_source = sources[i].doc.obj;
                    break;
                }
            }
            $("#sourceBtn").text("Source : " + cur_source.name);
            numberLoadsFromSource();
        });
	});
}

function sourceTableDblClick(){
    source_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var sources = doc.rows;    
        $('#sourceTable').find('tr').doubleTap(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
            var cur_source_name = $("#sourceTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< sources.length; i++){
                if (sources[i].doc.obj.name === cur_source_name){
                    edit_source = sources[i].doc.obj;
                    break;
                }
            }
            console.log(edit_source);
            document.getElementById("sourceEdit").style.visibility = 'visible';
            document.getElementById("sourceEdit").style.display = 'block';
            document.getElementById("sourceInitial").style.display = 'none';
            $("#add_source").collapsible("expand");
            $('#sourceName').val(edit_source.name);
            $('#sourceUnit').val(edit_source.nutrientUnit);
            $('#sourceUnit').selectmenu('refresh');
            $('#nUnits').val(edit_source.N);
            $('#kUnits').val(edit_source.K);
            $('#pUnits').val(edit_source.P);
        });
    });
}

function deleteSource(){
    source_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var sources = doc.rows;    
        for(i =0; i< sources.length; i++){
            if (sources[i].doc.obj.name === edit_source.name){
                removedSource = sources[i].doc;
                break;
            }
        }
    source_db.remove(removedSource);
        cancelSourceEd();
    });    
}

function cancelSourceEd(){
    document.getElementById("sourceEdit").style.visibility = 'hidden';
    document.getElementById("sourceEdit").style.display = 'none';
    document.getElementById("sourceInitial").style.display = 'block';
    cancelSource();
}

function saveEdSource(){
    source_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var sources = doc.rows;
        var editedSource = {name: $("#sourceName").val(), nutrientUnit: $("#sourceUnit").val(), N:$("#nUnits").val(), P: $("#pUnits").val(), K: $("#kUnits").val()}; 
         for(i =0; i< sources.length; i++){
            if (sources[i].doc.obj.name === edit_source.name){
                sources[i].doc.obj = editedSource;
                break;
            }
        }
        source_db.put(sources[i].doc)
        cancelSourceEd();
    });
}

//counts the number of loads from source
function numberLoadsFromSource(){
    recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var retrievedRecords = doc.rows;     
        var count = 1;
        var currentSN = cur_source_name;
        for(i =0; i< retrievedRecords.length; i++){
            if (retrievedRecords[i].doc.obj.cSource.name === currentSN){
            numberOfLoadsS = count++;
            document.getElementById('numberLFS').innerHTML ='<strong>'+numberOfLoadsS+'</strong>';
            }
        }
    });
}

/*Function returning Date and Time*/
function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
        var month = '0'+month;
    }
    if(day.toString().length == 1) {
        var day = '0'+day;
    }   
    if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
    spreadDate = year+'/'+month+'/'+day;   
    spreadTime = hour+':'+minute;
}

//=====================================Saves Field, Table, and Click Listeners==================================
 var field_db = new PouchDB('fields');
 var remoteFields = remoteAddress+'/fields';

function newSyncField(){
    field_db.changes({since: 'now', live: true}).on('change', fieldsTableFunc);
    opts = {
        continuous: true
    };
    field_db.sync(remoteFields, opts);     
    
}
    field_db.sync(remoteFields).on('complete', function(){
        fieldsTableFunc();
        newSyncField();
    }).on('error', function(){

    });

function pushFieldToDb(){
    var dbField = {
        _id: new Date().toISOString(),
        obj: newField
    };
    field_db.put(dbField,function callback(err, response){
        if(!err){
        }
    });
}

/*Creates Field Table*/
function createFieldsTable() {
    var cols = "4";
    var fBody = document.getElementById('fieldsTable');
    
    var bTbl = document.createElement('table');
    bTbl.style.borderCollapse = "collapse";

    bTbl.style.width = '100%';
    bTbl.style.align = 'center';
    var tbdy = document.createElement('tbody');
    tbdy.texAlign="center";
    var tr = document.createElement('tr');
    tr.style.textAlign = 'center'
	tr.style.height = "50px";
    
    th = document.createElement('th');
    th.innerHTML = "Name";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "Unit";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "Rate";
    th.width = '16.6%';
    tr.appendChild(th);

    th = document.createElement('th');
    th.innerHTML = "Area";
    th.width = '16.6%';
    tr.appendChild(th);
    tbdy.appendChild(tr);

    bTbl.appendChild(tbdy);
    fBody.appendChild(bTbl);

    $("#fieldsTable").append($(bTbl));
} 

// $(document).ready(function(){
//     fieldsTableFunc();
// });

function fieldsTableFunc() {
    if(document.getElementById('fieldsTable') == null) {
        appendFieldsTableRows();
    }else{
        var Table = document.getElementById('fieldsTable');
        Table.innerHTML = ""
        createFieldsTable();
        appendFieldsTableRows();
    }
    fieldTableClickListener();
    fieldTableDblClick();
}

function appendFieldsTableRows(){
    field_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var fields = doc.rows;    
        var tableB = document.getElementById('fieldsTable');
        for (var i = 0; i < fields.length; i++) {
            var row = tableB.insertRow(-1);
            tableB.style.textAlign = 'center';
        	row.style.height = "50px";

            var fieldName = row.insertCell(-1);
            fieldName.textAlign = 'center';
            fieldName.appendChild(document.createTextNode(fields[i].doc.obj.name));
             
            var rateUnit = row.insertCell(-1);
            rateUnit.textAlign = 'center';
            rateUnit.appendChild(document.createTextNode(fields[i].doc.obj.unit));
             
            var rateVal = row.insertCell(-1);
            rateVal.textAlign = 'center';
            rateVal.appendChild(document.createTextNode(fields[i].doc.obj.rate));
             
            var fieldArea = row.insertCell(-1);
            fieldArea.textAlign = 'center';
            fieldArea.appendChild(document.createTextNode(fields[i].doc.obj.area));
                
            tableB.children[0].appendChild(row);
        }
    });       
}

function fieldTableClickListener(){
    recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var retrievedRecords = doc.rows;
        last_field = retrievedRecords[retrievedRecords.length - 1];
        $('fieldsTable, td').filter(function(){
        return $(this).text() == last_field.doc.obj.field.name;
        }).parent('fieldsTable, tr').toggleClass('highlighted');
        field_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
            var fields = doc.rows;
            cur_field_name = $("#fieldsTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< fields.length; i++){
                if (fields[i].doc.obj.name === cur_field_name){
    				cur_field = fields[i].doc.obj;
    				break;
    			}
    		}
            $("#fieldBtn").text("Field : " + cur_field.name);
            numberLoadsOnField();
        }); 
    });
    field_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var fields = doc.rows; 
		$('#fieldsTable').find('tr').click(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
			cur_field_name = $("#fieldsTable tr.highlighted td")[0].innerHTML;
			for(i =0; i< fields.length; i++){
				if (fields[i].doc.obj.name === cur_field_name){
					cur_field = fields[i].doc.obj;
					break;
				}
			}	
            $("#fieldBtn").text("Field : " + cur_field.name);
            calculateSpeed();
            numberLoadsOnField();
        });
    });
    calculateSpeed();  
}

function saveField(){
    newField = {};
    console.log(fields);
	newField = {name: $("#fieldName").val(), unit: $("#rateUnit").val(), rate: $("#rateValue").val(), area: areaAcres, polygon: encodePGon }; 
	addFieldMap();
    pushFieldToDb();
	cancelField();
}

function cancelField(){
	$("#fieldName").val("");
	$("#rateUnit").val("")
	$("#rateUnit").selectmenu("refresh");
	$("#rateValue").val("")
	$("#addNewField").text("+ Add Field Boundary");
	$("#add_field").collapsible("collapse");
}

function doneDraw(){
	$("#addNewField").text("Field Boundary Added");
}

function cancelDraw(){
	window.location.href = "#field-list";
	cancelField();
}

function fieldTableDblClick(){
    field_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var fields = doc.rows;
        $('#fieldsTable').find('tr').doubleTap(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
            var cur_field_name = $("#fieldsTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< fields.length; i++){
                if (fields[i].doc.obj.name === cur_field_name){
                    edit_field = fields[i].doc.obj;
                    break;
                }
            }
            document.getElementById("fieldEdit").style.visibility = 'visible';
            document.getElementById("fieldEdit").style.display = 'block';
            document.getElementById("fieldInitial").style.display = 'none';
    		$("#fieldName").val(edit_field.name);
    		$("#rateUnit").val(edit_field.unit);
    		$("#rateUnit").selectmenu("refresh");
    		$("#rateValue").val(edit_field.rate);
    		$("#addNewField").text("+ Add Field Boundary");
    		$("#addNewField").text("Edit Field Boundary");
    		$("#add_field").collapsible("expand");
        });
    });
}

function cancelFieldEd(){
	document.getElementById("fieldEdit").style.visibility = 'hidden';
    document.getElementById("fieldEdit").style.display = 'none';
    document.getElementById("fieldInitial").style.display = 'block';
	cancelField();
}

function deleteField(){
     field_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var fields = doc.rows;
        for(i =0; i< fields.length; i++){
            if (fields[i].doc.obj === edit_field){
                removedField = fields[i].doc;
                break;
            }
        }
        field_db.remove(removedField);
        cancelFieldEd();
    });
}

function saveFieldEd(){
    field_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        fields = doc.rows;    
        var editedField = {name: $("#fieldName").val(), unit: $("#rateUnit").val(), rate: $("#rateValue").val(), area: areaAcres, polygon: encodePGon }; 
        for(i =0; i< fields.length; i++){
            if (fields[i].doc.obj === edit_spreader){
                fields[i].doc.obj = editedSpreader;
            }
        }
        field_db.put(fields[i].doc);
        cancelFieldEd();
    });
}

//Counts number of loads spread on field
function numberLoadsOnField(){
	recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var retrievedRecords = doc.rows;
        var count = 1;
        var currentFN = cur_field_name;   
        for(i =0; i< retrievedRecords.length; i++){
            if (retrievedRecords[i].doc.obj.field.name === currentFN){
                numberOfLoadsF = count++;
            }
        }
        document.getElementById('numberLonF').innerHTML ='<strong>'+numberOfLoadsF+'</strong>';
    });
}


//===============================Saves Operator, Tables, and Click Listener================================
//Set up and sync operators database to remote database
 var op_db = new PouchDB('operators');
 var operatorsRemote = remoteAddress+'/operators';

function newSyncOperator(){
    op_db.changes({since: 'now', live: true}).on('change', operatorsTableFunc);
    opts = {
        continuous: true
    }; 
    op_db.sync(operatorsRemote, opts);
}

    op_db.sync(operatorsRemote).on('complete', function(){
        operatorsTableFunc();
        newSyncOperator();
    }).on('error', function(err){
        alert('operators did not sync')
    });


function pushOpToDb(){
    var dbOperator = {
        _id: new Date().toISOString(),
        obj: newOperator
    };
    op_db.put(dbOperator,function callback(err, response){
        if(!err){
        }
    });
}
//Create operator table
function createOpTable() {
    var fBody = document.getElementById('operator_table');
    var bTbl = document.createElement('table');

    bTbl.style.borderCollapse = "collapse";
    bTbl.style.width = '90%';
    bTbl.style.align = 'center';
    bTbl.style.marginLeft = '5%';
    bTbl.fontsize ='13px';

    var tbdy = document.createElement('tbody');
    tbdy.texAlign="center";
    var tr = document.createElement('tr');
    tr.style.textAlign = 'center'
    

    th = document.createElement('th');
    th.innerHTML = "Operators";
    th.width = '16.6%';
    tr.appendChild(th);
    tbdy.appendChild(tr);

    bTbl.appendChild(tbdy);
    fBody.appendChild(bTbl);

    $("#opearato_table").append($(bTbl));
}   


function saveOperator(){
	if($("#opName").val().length ==''){
		alert("Please enter operator's name");
    }else{
	var opname = $("#opName").val();
	newOperator = opname;
	pushOpToDb();
	$("#opName").val('');
	$("#add_operator").collapsible('collapse');
	}
}

function cancelOperator(){
    $("#opName").val("");
    $("#add_operator").collapsible("collapse");
    operatorListDblClick();
}

function appendOpTableRows(){ 

    op_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        operators = doc.rows // DEFINED operators here globally;
    	var tableB = document.getElementById('operator_table');
        for (var i = 0; i < operators.length; i++) {
    	   var row = tableB.insertRow(-1);
    	   row.style.height = "50px"
    	   tableB.style.textAlign = 'center';
    	   var operatorName = row.insertCell(-1);
    	   operatorName.textAlign = 'center';
    	   operatorName.appendChild(document.createTextNode(operators[i].doc.obj));
    	   tableB.children[0].appendChild(row);
    	}
    });
}


function opTableClickListener(){
    recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var retrievedRecords = doc.rows;
         last_operator = retrievedRecords[retrievedRecords.length - 1];
            $('operator_table, td').filter(function(){
            return $(this).text() == last_operator.doc.obj.operator
            }).parent('operator_table, tr').toggleClass('highlighted');
        op_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
            operators = doc.rows;    
            var cur_op_name = $("#operator_table tr.highlighted td")[0].innerHTML;
            for(i =0; i< retrievedRecords.length; i++){
                if (retrievedRecords[i].doc.obj.operator === cur_op_name){
                    cur_operator = retrievedRecords[i].doc.obj.operator;
                    break;
                }
            }
            $("#operatorBtn").text("Operator : " + cur_operator);
        });
    });
    op_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        operators = doc.rows;
        $('#operator_table').find('tr').click(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
           var cur_op_name = $("#operator_table tr.highlighted td")[0].innerHTML;
            for(i =0; i< operators.length; i++)
                if (operators[i].doc.obj === cur_op_name){
                    cur_operator = operators[i].doc.obj;
                    break;
                }
            $("#operatorBtn").text("Operator : " + cur_operator);
        });
    });      
    document.getElementById("opEdit").style.visibility = 'hidden';
    document.getElementById("opEdit").style.display = 'none';
    document.getElementById("opInitial").style.display = 'block';
    	
}   

function operatorsTableFunc() {
    if(document.getElementById('operator_table') == null) {
        appendOpTableRows();
    }else{
        var Table = document.getElementById('operator_table');
        Table.innerHTML = ""
        createOpTable();
        appendOpTableRows();
    }
    opTableClickListener();
    operatorListDblClick();
}    

//Double click to edit or delete operator
function operatorListDblClick(){
    op_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        operators = doc.rows;
        $('#operator_table').find('tr').doubleTap(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
            var cur_op_name = $("#operator_table tr.highlighted td")[0].innerHTML;
            for(i =0; i< operators.length; i++){
                if (operators[i].doc.obj === cur_op_name){
                    edit_operator = operators[i].doc.obj;
                    break;
                }
            }
            document.getElementById("opEdit").style.visibility = 'visible';
            document.getElementById("opEdit").style.display = 'block';
            document.getElementById("opInitial").style.display = 'none';
            $("#add_operator").collapsible("expand");
            $("#opName").val(edit_operator);
            console.log(edit_operator);
        });
    });
}   

function cancelOpEd(){
    cancelOperator()
    document.getElementById("opEdit").style.visibility = 'hidden';
    document.getElementById("opEdit").style.display = 'none';
    document.getElementById("opInitial").style.display = 'block';
}
var removedOp;
function deleteOp(){
    op_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        operators = doc.rows;
        for(i =0; i< operators.length; i++){
            if (operators[i].doc.obj === edit_operator){
                removedOp = operators[i].doc;
                break;
            }
        }
        op_db.remove(removedOp);  
        $("#opName").val('');
        $("#add_operator").collapsible("collapse");
    });    
}

function saveOpEd(){
    op_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        operators = doc.rows;
        if( $("#opName").val() == ""){
        }else{
            for(i =0; i< operators.length; i++){
                if (operators[i].doc.obj == edit_operator){
                    operators[i].doc.obj = $("#opName").val();
                    break;
                };
                
            }
        op_db.put(operators[i].doc);
        $("#opName").val('');
        }
        document.getElementById("opEdit").style.visibility = 'hidden';
        document.getElementById("opEdit").style.display = 'none';
        document.getElementById("opInitial").style.display = 'block';
        $("#add_operator").collapsible("collapse");
    });    
}


//===========================BLE Spreader Table==================================
var bleArray = {};
function createBleTable() {
    var bleBody = document.getElementById('bleSpreaderTable');
    var bTbl = document.createElement('table');

    bTbl.style.borderCollapse = "collapse";
    bTbl.style.width = '40%';
    bTbl.style.align = 'center';
    bTbl.setAttribute('border','1');
    bTbl.style.marginLeft = '5%';
    bTbl.fontsize ='13px';

    var tbdy = document.createElement('tbody');
    tbdy.texAlign="center";
    var tr = document.createElement('tr');
    tr.style.textAlign = 'center'
    

    th = document.createElement('th');
    th.innerHTML = "Spreaders";
    th.width = '16.6%';
    tr.appendChild(th);
    tbdy.appendChild(tr);

    bTbl.appendChild(tbdy);
    bleBody.appendChild(bTbl);

    $("#bleSpreaderTable").append($(bTbl));
} 

function bleTableFunc(){
    document.getElementById("bleSpreaderSelect").style.visibility = 'visible';
    document.getElementById("bleSpreaderSelect").style.display = 'block';
    if(document.getElementById('bleSpreaderTable') == null) {
        $("#bleSpreaderTable").innerHTML = "";
        appendBleTableRows();
    }else{
        var Table = document.getElementById('bleSpreaderTable');
        Table.innerHTML = "";
        createBleTable();
        appendBleTableRows();
    }
    bleTableClickListener();
}

function appendBleTableRows(){ 
    spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var spreaders = doc.rows;
        var tableB = document.getElementById('bleSpreaderTable');
        for (var i = 0; i < spreaders.length; i++) {
           var row = tableB.insertRow(-1);
           row.style.height = "50px";
           tableB.style.textAlign = 'center';
           var spreadersName = row.insertCell(-1);
           spreadersName.textAlign = 'center';
           spreadersName.appendChild(document.createTextNode(spreaders[i].doc.obj.name));
           tableB.children[0].appendChild(row);
        }
    });
    recordTableStyle();
}

function saveBle(){
     spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var spreaders = doc.rows;
        for(i =0; i< spreaders.length; i++){
            if (spreaders[i].doc.obj.name === bleSpreader.name){
                break;
            }
        }
        spreaders[i].doc.obj.address = bleAddress;
        cur_spreader = spreaders[i].doc.obj;
        spreader_db.put(spreaders[i].doc);
        $('spTable, td').filter(function(){
        return $(this).text() == cur_spreader.name;
        }).parent('spTable, tr').toggleClass('highlighted');
        $("#spreaderBtn").text("Spreader : " + cur_spreader.name);
    });
    document.getElementById("bleSpreaderSelect").style.visibility = 'hidden';
    document.getElementById("bleSpreaderSelect").style.visibility = 'none';
}

function bleTableClickListener(){
    bleSpreader = {};
    spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var spreaders = doc.rows;
        $('#bleSpreaderTable').find('tr').click(function(){
            $(this).siblings().removeClass("highlighted");
            $(this).toggleClass("highlighted");
           var ble_select_spreader = $("#bleSpreaderTable tr.highlighted td")[0].innerHTML;
            for(i =0; i< spreaders.length; i++){
                if (spreaders[i].doc.obj.name === ble_select_spreader){
                    bleSpreader = spreaders[i].doc.obj;
                    break;
                }
            }
        });
    });      
}

function bleTagSpreader(){
    spreader_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
        var spreaders = doc.rows;
        for(i =0; i< spreaders.length; i++){
            if(spreaders[i].doc.obj.address === bleAddress){
                break;
            }   
        }
        if(!spreaders[i]){
            bleTableFunc();
        }else if(spreaders[i].doc.obj.address == bleAddress){
            cur_spreader = spreaders[i].doc.obj;
            $('spTable, td').filter(function(){
            return $(this).text() == cur_spreader.name;
        }).parent('spTable, tr').toggleClass('highlighted');
            $("#spreaderBtn").text("Spreader : " + cur_spreader.name);
        }
    });
}

//==========================================Creates Record Table When Load is Complete======================================
 var recorddb = new PouchDB('records');
 var recordRemote = remoteAddress+'/records';

    function newSyncRecord(){
        recorddb.changes({since: 'now', live: true}).on('change', recordTableFunc, recordTableStyle);
        opts = {
            continuous: true
        };

        recorddb.sync(recordRemote, opts);
    }

    recorddb.sync(recordRemote).on('complete', function(){
        newSyncRecord();
        recordTableFunc();
        recordTableStyle();
    }).on('error',function(err){
        alert('problem syncing records');
    })

function pushRecordToDb(){
    var newRecord = {
        _id: new Date().toISOString(),
        obj: cur_record
    };
    recorddb.put(newRecord,function callback(err, response){
        if(!err){
        }
    });
}


function createRecordTable() {
    var reBody = document.getElementById('recordTable');
    
    var rbTbl = document.createElement('table');
    

    rbTbl.style.width = '99%';
    rbTbl.style.align = 'center';
    rbTbl.setAttribute('border','1');
    rbTbl.style.marginLeft = '1%';
    var rtbdy = document.createElement('tbody');

    var rtr = document.createElement('tr');
    rtr.style.textAlign = 'center'
    
    rth = document.createElement('th');
    rth.innerHTML = "Date";
    rth.width = '10%';
    rtr.appendChild(rth);

    rth = document.createElement('th');
    rth.innerHTML = "Time";
    rth.width = '10%';
    rtr.appendChild(rth);

    rth = document.createElement('th');
    rth.innerHTML = "Operator";
    rth.width = '10%';
    rtr.appendChild(rth);

    rth = document.createElement('th');
    rth.innerHTML = "Field";
    rth.width = '10%';
    rtr.appendChild(rth);

    rth = document.createElement('th');
    rth.innerHTML = "Source";
    rth.width = '10%';
    rtr.appendChild(rth);

    rth = document.createElement('th');
    rth.innerHTML = "Spreader";
    rth.width = '10%';
    rtr.appendChild(rth);
    
    rth = document.createElement('th');
    rth.innerHTML = "Amount";
    rth.width = '10%';
    rtr.appendChild(rth);
    
    rth = document.createElement('th');
    rth.innerHTML = "Rate";
    rth.width = '10%';
    rtr.appendChild(rth);
    
    rth = document.createElement('th');
    rth.innerHTML = "Load Fill Level";
    rth.width = '10%';
    rtr.appendChild(rth);
    rtbdy.appendChild(rtr);
    
    gHeaderCreated = true;

    rbTbl.appendChild(rtbdy);
    reBody.appendChild(rbTbl);

    $("#recordTable").append($(rbTbl));

} 


function recordTableFunc() {
    if(document.getElementById('recordTable') == null) {
        $("#recordTable").innerHTML = "";
        appendRecordTableRows();
    }else{
        var Table = document.getElementById('recordTable');
        Table.innerHTML = "";
        createRecordTable();
        appendRecordTableRows();
    }
}  

function appendRecordTableRows(){ 
    recorddb.allDocs({include_docs: true, descending: false}, function(er, doc) {
        aName = doc.rows
        console.log(aName);
        var recordTab = document.getElementById('recordTable');
        for (var i = 0; i < aName.length; i++) {
         var row = recordTab.insertRow(-1);
          recordTab.style.textAlign = 'center';
         
         var recordDate = row.insertCell(-1);
         recordDate.textAlign = 'right';
         recordDate.appendChild(document.createTextNode(aName[i].doc.obj.date));
         
         var recordTime = row.insertCell(-1);
         recordTime.textAlign = 'center';
         recordTime.appendChild(document.createTextNode(aName[i].doc.obj.Time));

        var recordOp = row.insertCell(-1);
         recordOp.textAlign = 'center';
         recordOp.appendChild(document.createTextNode(aName[i].doc.obj.operator));

         var recordField = row.insertCell(-1);
         recordField.textAlign = 'center';
         recordField.appendChild(document.createTextNode(aName[i].doc.obj.field.name));
         
         var recordSource = row.insertCell(-1);
         recordSource.textAlign = 'center';
         recordSource.appendChild(document.createTextNode(aName[i].doc.obj.cSource.name));
         
         var recordSpreader = row.insertCell(-1);
         recordSpreader.textAlign = 'center';
         recordSpreader.appendChild(document.createTextNode(aName[i].doc.obj.cSpred.name));
         
         var recordAmount = row.insertCell(-1);
         recordAmount.textAlign = 'center';
         recordAmount.appendChild(document.createTextNode(aName[i].doc.obj.cSpred.capacity+"("+ aName[i].doc.obj.cSpred.unit +")" ));
         
         var loadRate = row.insertCell(-1);
         loadRate.textAlign = 'center';
         loadRate.appendChild(document.createTextNode(aName[i].doc.obj.rate));
         
         var SpreaderFillLevel = row.insertCell(-1);
         SpreaderFillLevel.textAlign = 'center';
         SpreaderFillLevel.appendChild(document.createTextNode(aName[i].doc.obj.fillLevel));
         
         recordTab.children[0].appendChild(row);
        }
    });
    recordTableStyle();  
}

$(document).ready(function(){
    recordTableStyle();
});

function recordTableStyle(){
    $("#recordTable").removeAttr('class');  
    var table = document.getElementById('recordTable');  
    var rows = table.getElementsByTagName("tr"); 
    for(i = 0; i < rows.length; i++){          
        if(i % 2 == 0){
            rows[i].className = "evenrowcolor";
        }else{
            rows[i].className = "oddrowcolor";
        }      
    }
}
