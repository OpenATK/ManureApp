
var infowWindow;
var polypoint = [];
var polygons = [];
var currentfield = {};
var map;
var latlng;
var cur_path = [];
var polyline = [];
var STOP = 0;
var START = 1;
var polyLength;
var spreadRate;
var cur_spreader;
var fieldName;
var cur_point = {};
var clickPostion;
var positionPoint;
var updateMarker;
var positionMarker;
var positionStatus = 0;
var arrX = [];
var arrY = [];
var arrZ = [];
var averageRslt;
var fieldSelect = 0;
var fieldTableStat = 0;
var spTableStat = 0;

function postPath(){
cur_record.path = google.maps.geometry.encoding.encodePath(cur_path);
console.log(google.maps.geometry.encoding.decodePath(cur_record.path));
}


// shows and hides unloading operation buttons
function startDiv(){
document.getElementById("unloading").style.display = 'none';
document.getElementById("notUnloading").style.display = 'block';
//hideUnload.style.backgroundColor = '	#CC0000';
}
startDiv();

function unloadingDiv(){
document.getElementById("unloading").style.display = 'block';
document.getElementById("notUnloading").style.display = 'none';
//hideUnload.style.backgroundColor = '#009900';
}


function pauseLoad(){
	if (status==STOP){
		status = START; 
	}else {
		status =  STOP;
	}
updateStatus();
console.log("hello")
}

function updateStatus(){
	if(status == START){
		$("#spStatus").text("Paused");
		$("#startStop").text("Start");
		$("#facebookG").hide();
		killPathTimer();
	}else{
		$("#spStatus").text("Spreading");
		$("#startStop").text("Pause");
		$("#facebookG").show();
		 recordPath();
	}
}	

//Add back button to each header
$(document).on("mobileinit", function() {
	$.mobile.page.options.addBackBtn = true;
});

function overlay() {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

function syncing() {
	ss = document.getElementById("syncingSpinner");
	ss.style.visibility = (ss.style.visibility == "visible") ? "hidden" : "visible";
}
	
function recordPath() {
    geoP = navigator.geolocation.watchPosition( 
        function ( position) {
        	
		points = (new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
       	travelSpeed = position.coords.speed*2.2369;
		positionE = position.coords.accuracy;
		if(position.coords.accuracy < 15){
			cur_path.push(points)
		}
		
		document.getElementById('cur_speed').innerHTML = '<strong>'+travelSpeed.toFixed(2) +' (MPH)</strong>  '+ positionE.toFixed(2) + 'error meters'  ;
		console.log(travelSpeed);
        },
        function () { /*error*/ }, {
            maximumAge: 1000, //  1 seconds
            enableHighAccuracy: true
 			 
        }

	);

};

function recordPath() {
    geoP = navigator.geolocation.watchPosition( 
        function ( position) {
        	
		points = (new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
       	travelSpeed = position.coords.speed*2.2369;
		positionE = position.coords.accuracy;
		if(position.coords.accuracy < 15){
			cur_path.push(points)
		}
		
		document.getElementById('cur_speed').innerHTML = '<strong>'+travelSpeed.toFixed(2) +' (MPH)</strong>  '+ positionE.toFixed(2) + 'error meters'  ;
		console.log(travelSpeed);
        },
        function () { /*error*/ }, {
            maximumAge: 1000, //  1 seconds
            enableHighAccuracy: true
 			 
        }

	);

};


function killPathTimer(){
	navigator.geolocation.clearWatch(geoP);
	polyLength = google.maps.geometry.spherical.computeLength(cur_path)*3.2804;
	console.log(polyLength)
	var spreadWidth = cur_spreader.width;
	var spreadAmount = cur_spreader.capacity
	var spreadArea = spreadWidth*polyLength;
	spreadArAc = spreadArea/43560;
	rate = spreadAmount /spreadArAc;
}


	//Map
function createMap(){
    var defaultLatLng = new google.maps.LatLng(40.4240,-86.9290);  // Default to Purdue Universitywhen no geolocation support
    if ( navigator.geolocation ) {
        function success(pos) {
            // Location found, show map with these coordinates
            drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        }
        function fail(error) {
            drawMap(defaultLatLng);  // Failed to find location, show default map
        }
        // Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
    } else if(!navigator.geolocation) {
        drawMap(defaultLatLng);  // No geolocation support, show default map
        console.log("drewWrongMap")
    }
    function drawMap(latlng) {
    	recorddb.allDocs({include_docs: true, descending: true}, function(er, doc) {
	       		retrievedRecords = doc.rows;
	        var myOptions = {
	            zoom: 16,
	            center: latlng,
	            mapTypeId: google.maps.MapTypeId.SATELLITE
			};

	        map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
			var latLngBounds = new google.maps.LatLngBounds();

				for(var i=0; i < retrievedRecords.length; i++){
					decoded = retrievedRecords[i].doc.obj.path;
					newPolyline = google.maps.geometry.encoding.decodePath(decoded);
					for(var j = 0; j < newPolyline.length; j++) {
						latLngBounds.extend(newPolyline[j]);
						// Place the marker
						var marker = new google.maps.Marker({
						map: map,
						position: newPolyline[j],
						title: "Point " + (j + 1)
						});
						marker.visible = false;
					}
					var polyline = new google.maps.Polyline({
						map: map,
						path: newPolyline,
						strokeColor: '#0000FF',
						strokeOpacity: 1.0,
						strokeWeight: 8
					});
				}
				// google.maps.event.addListener(map, 'click', function( event ){
  		// 			alert( "Latitude: "+event.latLng.lat()+" "+", longitude: "+event.latLng.lng() ); 
				// });	
				// google.maps.event.addListener(map, 'click', function(e) {
    //     			positionPoint = e.latLng;
    //     			updateMarker();

    //     		});

	        map.fitBounds(latLngBounds);  		
			map.setTilt(0);
			field_db.allDocs({include_docs: true, descending: true}, function(er, doc) {
	        	var fields = doc.rows;
				for(var i=0; i < fields.length; ++i){
					var polyPath = [];
					var vertices = google.maps.geometry.encoding.decodePath(fields[i].doc.obj.polygon);
					for (var j =0; j < vertices.length; j++) {
						lat = vertices[j].lat();
						lng = vertices[j].lng();
						point = new google.maps.LatLng(lat, lng);
						polyPath.push(point)
					}
					polyPath.name = fields[i].doc.obj.name;
					polyPath.area = fields[i].doc.obj.area;

					var samsPolygon = new google.maps.Polygon({
						path: polyPath,
						fillColor: 'green',
						strokeColor: 'yellow',
						strokeOpacity: 0.7,
						strokeWeight: 4,
						fillOpacity: 0.2,
						visible: true
					});
					var infoWindow = new google.maps.InfoWindow();
					samsPolygon.set("name", polyPath.name);
					samsPolygon.set("area", polyPath.area);
					samsPolygon.setMap(map);
					
					var currentMark;
		 			google.maps.event.addListener(samsPolygon,'click', function(event) {
							infoWindow.setContent("<b> Field information </b><br>" + "Name : " + this.get("name") + "<br>"
							+ "Area : " + this.get("area") + "<br>");
		   					infoWindow.setPosition(event.latLng);
		   					infoWindow.open(map);
		   					currentMark = infoWindow;
		   					samsPolygon.getEditable(map);
					});
					google.maps.event.addListener(infoWindow,'closeclick',function(){
	   					currentMark.setMap(null); //removes the marker
					});

			    }	
			});
		});
		updateMarker = function(){
			if(positionStatus == 1){
				positionMarker.setMap(null);
				positionMarker = new google.maps.Marker({
				map: map,
				position: positionPoint,
				title: "You"
			});

			}else{
			
			positionMarker = new google.maps.Marker({
				map: map,
				position: positionPoint,
				title: "You"
			});
			positionStatus = 1;
			}		
		}
	}
}
	
//Add Field Map
function addFieldMap(){
    var defaultLatLng = new google.maps.LatLng(40.4240,-86.9290);  // Default to Purdue University when no geolocation support
    if ( navigator.geolocation ) {
        function success(pos) {
            // Location found, show map with these coordinates
            drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        }
        function fail(error) {
            drawMap(defaultLatLng);  // Failed to find location, show default map
        }
        // Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
    } else {
        drawMap(defaultLatLng);  // No geolocation support, show default map
    }
    function drawMap(latlng) {
        var myOptions = {
            zoom: 16,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.HYBRID
        };
	
	var map = new google.maps.Map(document.getElementById("addFieldMap"), myOptions);
		
		google.maps.event.addListenerOnce(map, 'idle', function() {
		google.maps.event.trigger(map, 'resize');
		
		});
		var dm = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.POLYGON,
			drawingControl: false,
			map: map,
			
			polygonOptions: {
			editable: true,
			fillColor: 'green',
			strokeColor: 'yellow',
			strokeWeight: 4
			}
			
		});
		
		map.setTilt(0);
		dm.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);	
		google.maps.event.addListener(dm, 'polygoncomplete', function(polygon) {
			dm.setDrawingMode(null);
			currentfield = polygon.getPath();
			encodePGon = google.maps.geometry.encoding.encodePath(currentfield);
			var fArea = google.maps.geometry.spherical.computeArea(polygon.getPath());

			areaAc = fArea * 0.000247105;
			areaAcres = areaAc.toFixed(2)
			$('#deleteField').on('click', function() {
			deleteMarkers();
			});
			function deleteMarkers () {
			polygon.setPath([]);
			addFieldMap();
			}	
		});

		field_db.allDocs({include_docs: true, descending: true}, function(er, doc) {
	        	var fields = doc.rows;
			for(var i=0; i < fields.length; ++i){
				var polyPath = [];
				vertices = google.maps.geometry.encoding.decodePath(fields[i].doc.obj.polygon);
				for (var j =0; j < vertices.length; j++) {
					lat = vertices[j].lat();
					lng = vertices[j].lng();
					point = new google.maps.LatLng(lat, lng);
					polyPath.push(point)
				}
				polyPath.name = fields[i].doc.obj.name;
				polyPath.area = fields[i].doc.obj.area;
				
				var samsPolygon = new google.maps.Polygon({
				path: polyPath,
				fillColor: 'green',
				strokeColor: 'yellow',
				strokeOpacity: 0.7,
				strokeWeight: 4,
				fillOpacity: 0.35,
				visible: true,
				editable: false
				});

				infoWindow = new google.maps.InfoWindow();
				samsPolygon.set("name", polyPath.name);
				samsPolygon.set("area", polyPath.area);
				samsPolygon.setMap(map);			
			}
		});

			
	}
}


$("#addNewField").click(function(){
	addFieldMap();
});


	// If field name is empty reminds enter field name
$('#saveField').click(function () {
    if ($('#fieldName').val().length == '') {
    	alert('Please add field name.');
	}else if($('#rateUnit').val() ==""){
		alert('Please select desired rate.');
	}else if($('#rateValue').val().length == ''){
		alert('Please select desired rate.');
	}else{
		saveField();
	}	
		$("#fieldName").val("");
		$("#rateValue").val("");
		console.log(areaAcres);
    });

	// Save Field name and Polygon to array 

function addFieldRerun(){
	addFieldMap();
}

var cur_field;

 function calculateSpeed(){
 	if(fieldTableStat == 1 && spTableStat == 1){
 		console.log(fieldTableStat == 1 && spTableStat == 1);
		var  rtSelect = cur_field.unit;
		console.log(rtSelect);
		if(rtSelect =='gal/ac'){
			console.log(rtSelect);
			var rate =  cur_field.rate;
			console.log(rate);
			var width = cur_spreader.width;
			console.log(width);
			var unloadTime = cur_spreader.ut;
			console.log(unloadTime);
			if(cur_spreader.unit == "Tons"){
				spCap = (cur_spreader.capacity * 2000)/8.3;
			}else{
				spCap = cur_spreader.capacity
			}
			s = ((spCap/unloadTime)*8.25*60)/(width * rate);
			document.getElementById('speedReturn').innerHTML = '<strong>'+s.toFixed(2) +' (MPH)</strong>';

		}else if (rtSelect == '1000gal/ac') {
		var rate =  cur_field.rate *1000;
			console.log(rate);
			var width = cur_spreader.width;
			console.log(width);
			var unloadTime = cur_spreader.ut;
			console.log(unloadTime);
			if(cur_spreader.unit == "Tons"){
				spCap = (cur_spreader.capacity * 2000)/8.3;
			}else{
				spCap = cur_spreader.capacity
			}
			s = ((spCap/unloadTime)*8.25*60)/(width * rate);
			document.getElementById('speedReturn').innerHTML = '<strong>'+s.toFixed(2) +' (MPH)</strong>';

		} else if (rtSelect == 'tons/ac') {
			console.log(rtSelect);
			var rate =  cur_field.rate;
			console.log(rate);
			var width = cur_spreader.width;
			console.log(width);
			var unloadTime = cur_spreader.ut;
			console.log(unloadTime);
			if(cur_spreader.unit == "Gallons" ){
				spCap = (cur_spreader.capacity*8.3)/2000;
			}else {
				spCap = cur_spreader.capacity;
			}
		s = ((spCap/unloadTime)*8.25*60)/(width * rate);
		document.getElementById('speedReturn').innerHTML ='<strong>'+s.toFixed(2) +' (MPH)</strong>';
		}
	}
}

//======================field selector=====================

var fieldSelectDB = new PouchDB('fsDB');

function putFieldSelectPref(){   
    var fieldSelectObject = {
        _id: new Date().toISOString(),
        obj: fieldSelect
    };
    fieldSelectDB.put(fieldSelectObject,function callback(err, response){
        if(!err){
        }
    });
}

function userLocation() {
    uLocation = navigator.geolocation.watchPosition( 
        function ( position) {	
        currentPosition = [];
		positionPoint = (new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			updateMarker();
			fieldSelector();
        },
        function () { /*error*/ }, {
            maximumAge: 1000, //  3 seconds
            enableHighAccuracy: true
 			 
        }

	);

};
	
function turnOffPosition(){
	navigator.geolocation.clearWatch(uLocation);
}

function fieldSelector(){
	field_db.allDocs({include_docs: true, descending: false}, function(er, doc) {
		var fields = doc.rows;
		for(var i=0; i < fields.length; ++i){
			var polyPath = [];
			var vertices = google.maps.geometry.encoding.decodePath(fields[i].doc.obj.polygon);
			for (var j =0; j < vertices.length; j++) {
				var lat = vertices[j].lat();
				var lng = vertices[j].lng();
				point = new google.maps.LatLng(lat, lng);
				polyPath.push(point)
			}
			var testPolygon = new google.maps.Polygon({
				path: polyPath
			});
			if(google.maps.geometry.poly.containsLocation(positionPoint, testPolygon)){
			 	cur_field = fields[i].doc.obj;
			 	result = true;
			 	break;
			 	
			}else{
				result = false;
			}
		}
		if(result == true){
		$("#fieldBtn").text("Field: " + cur_field.name);
		calculateSpeed();
		}else{
		}
	});
	updateMarker();
}

function autoFieldOn(){
	fieldSelect = 1;
	putFieldSelectPref()
	userLocation();
}

function autoFieldOff(){
	fieldSelect = 0;
	putFieldSelectPref();
	turnOffPosition();
}

function handleAutoFieldStatus(){
	 fieldSelectDB.allDocs({include_docs: true, descending: true}, function(er, doc) {
	 	if(doc.rows >= 1){
	        var fieldSelect = doc.rows[0].doc.obj;
	        console.log(fieldSelect.doc.obj);
			if(fieldSelect.doc.obj == 1){
				userLocation();
				$("#fieldSelectStatus").text("Automatic Field Selector : ON")
			}else{
				turnOffPosition();
				$("#fieldSelectStatus").text("Automatic Field Selector : OFF")
			}
		}
	});
}

$(document).ready(function(){
	handleAutoFieldStatus();
})

//==========================================SensorTag Code======================================

	var sensortag = evothings.tisensortag.createInstance()

	function initialiseSensorTag()
	{
		//
		// Here sensors are set up.
		//
		// If you wish to use only one or a few sensors, just set up
		// the ones you wish to use.
		//
		// First parameter to sensor function is the callback function.
		// Several of the sensors take a millisecond update interval
		// as the second parameter.
		// Gyroscope takes the axes to enable as the third parameter:
		// 1 to enable X axis only, 2 to enable Y axis only, 3 = X and Y,
		// 4 = Z only, 5 = X and Z, 6 = Y and Z, 7 = X, Y and Z.
		//
		sensortag
			.statusCallback(statusHandler)
			.errorCallback(errorHandler)
			.accelerometerCallback(accelerometerHandler, 50)
			.connectToClosestDevice()
	}
// .gyroscopeCallback(gyroscopeHandler, 200, 7) // 7 = enable all axes.
	function statusHandler(status)
	{
		if ('Device data available' == status)
		{
			// displayValue('FirmwareData', sensortag.getFirmwareString())
		}
		displayValue('StatusData', status)
		if("Sensors online" == status){
			accelTimer = setInterval(function(){
				console.log("timer started")
				var sumX = 0
				arrX.map(function(item){
					sumX += item;
				});
					var averageX = sumX/arrX.length;
					arrX = [];


				var sumY = 0
				arrY.map(function(item){
					sumY += item;
				});
					var averageY = sumY/arrY.length;
					arrY = [];


				var sumZ = 0
				arrZ.map(function(item){
					sumZ += item;
				});
					var averageZ = sumZ/arrZ.length;
					arrZ = [];

				
				averageRslt = (Math.sqrt(Math.pow(averageX, 2) + Math.pow(averageY, 2) + Math.pow(averageZ, 2))) - 1;
				spreaderFunction();
				$("#averageAccel").text("data: "+averageRslt.toFixed(5));
				
			}, 5000);	

		}
		
	}

	function errorHandler(error)
	{
		console.log('Error: ' + error)
		if ('disconnected' == error)
		{
			// Clear current values.
			var blank = '[Waiting for value]'
			displayValue('StatusData', 'Ready to connect')
			displayValue('AccelerometerData', blank)
			// displayValue('GyroscopeData', blank)


			// If disconneted attempt to connect again.
			setTimeout(
				function() { sensortag.connectToClosestDevice() },
				1000)
		}
	}

	// calculations implemented as based on TI wiki pages
	// http://processors.wiki.ti.com/index.php/SensorTag_User_Guide
	function accelerometerHandler(data)
	{
		// Calculate the x,y,z accelerometer values from raw data.
		var values = sensortag.getAccelerometerValues(data)
		var x = values.x
		var y = values.y
		var z = values.z

		arrX.push(x);
		arrY.push(y);
		arrZ.push(z);

		// Prepare the information to display.
		string =
			//'raw: 0x' + bufferToHexStr(data, 0, 3) + '<br/>'
			'x = ' + (x >= 0 ? '+' : '') + x.toFixed(4) + 'G<br/>'
			+ 'y = ' + (y >= 0 ? '+' : '') + y.toFixed(4) + 'G<br/>'
			+ 'z = ' + (z >= 0 ? '+' : '') + z.toFixed(4) + 'G<br/>'

		// Update the value displayed.
		displayValue('AccelerometerData', string)
	}

	function gyroscopeHandler(data)
	{
		// Calculate the gyroscope values from raw sensor data.
		var values = sensortag.getGyroscopeValues(data)
		var x = values.x
		var y = values.y
		var z = values.z

		var xSqrd = Math.pow(x, 2);
		var ySqrd = Math.pow(y, 2);
		var zSqrd = Math.pow(z, 2);

		// var xSqrt = Math.sqrt(xSqrd);
		// var ySqrt = Math.sqrt(ySqrd);
		// var zSqrt = Math.sqrt(zSqrd);


		var sumSqrd = xSqrd + ySqrd + zSqrd;
		var sumSqrt = Math.sqrt(sumSqrd);

		gyroData.push(sumSqrt);
		cur_point.gyroRslt = sumSqrt;
		cur_point.gyroX = x;
		cur_point.gyroY = y;
		cur_point.gyroZ = z;

		// Prepare the information to display.
		string =
			//'raw: 0x' + bufferToHexStr(data, 0, 6) + '<br/>'
			 'x = ' + (x >= 0 ? '+' : '') + x.toFixed(4) + '<br/>'
			+ 'y = ' + (y >= 0 ? '+' : '') + y.toFixed(4) + '<br/>'
			+ 'z = ' + (z >= 0 ? '+' : '') + z.toFixed(4) + '<br/>'

		// Update the value displayed.
		displayValue('GyroscopeData', string)
	}

	function displayValue(elementId, value)
	{
		document.getElementById(elementId).innerHTML = value
	}

	/**
	 * Convert byte buffer to hex string.
	 * @param buffer - an Uint8Array
	 * @param offset - byte offset
	 * @param numBytes - number of bytes to read
	 * @return string with hex representation of bytes
	 */
	function bufferToHexStr(buffer, offset, numBytes)
	{
		var hex = ''
		for (var i = 0; i < numBytes; ++i)
		{
			hex += byteToHexStr(buffer[offset + i])
		}
		return hex
	}

	/**
	 * Convert byte number to hex string.
	 */
	function byteToHexStr(d)
	{
		if (d < 0) { d = 0xFF + d + 1 }
		var hex = Number(d).toString(16)
		var padding = 2
		while (hex.length < padding)
		{
			hex = '0' + hex
		}
		return hex
	}

	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(initialiseSensorTag) },
		false)

function spreaderFunction(){
	if(averageRslt > 3){
		if(spread == 0){
				startUnload();
			}else{
			}
		}else if(averageRslt< 3){
			if(spread == 1){
				loadComplete();
			}else{
		}
	}
}

