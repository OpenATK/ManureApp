/*var scopes = 'https://spreadsheets.google.com/feeds';
var clientId = '709292561497-l889002bdhb28rsbu1gi4j99r1rvhaa0.apps.googleusercontent.com';
var apiKey = 'AIzaSyDix-PcT_EUN-kVGfLctLzRKtHITqSmvZg';
var answer;
var data;
function handleClientLoad() {
    console.log('inside handleClientLoad function');
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth,1);
}

function checkAuth() {
    console.log('inside checkAuth function');
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
    console.log('finished checkAuth function');
}

function handleAuthResult(authResult) {
    console.log('inside handleAuthResult function');
    console.log(gapi.auth.getToken());

    if (authResult && !authResult.error) {
        //Access token has been successfully retrieved, requests can be sent to the API.
        loadClient();
    } else {
        //No access token could be retrieved, show the button to start the authorization flow
         gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    }
}

function loadClient() {
    console.log('inside loadClient function');
    token = gapi.auth.getToken().access_token;
   // var urlLocation = '1wrTuRSXhuzu50ozWG5RcTeolnGe3GCnCCYtvpLoTGP0'; //Get this from the URL of your Spreadsheet in the normal interface for Google Drive.

    //This gives a spitout of ALL spreadsheets that the user has access to.
    var url = 'https://spreadsheets.google.com/feeds/spreadsheets/private/full';//?access_token=' + token+'&alt=json-in-script';
// console.log(url);
// //     This gives a list of all worksheets inside the Spreadsheet, does not give actual data
//     var url = 'https://spreadsheets.google.com/feeds/worksheets/' + urlLocation + '/private/full?access_token=' + token;
// console.log(url);
// //     //This gives the data in a list view - change the word list to cells to work from a cell view and see https://developers.google.com/google-apps/spreadsheets/#working_with_cell-based_feeds for details
	//var url = 'https://spreadsheets.google.com/feeds/list/' + urlLocation + '/1/private/full';
	//console.log(url);
    
 
	$.ajax({
		type: 'GET',
		url: url,
		processData: true,
		crossDomain: true,
		data: {
		access_token: token,
		alt: 'json-in-script'
		},
		dataType: "jsonp",
		success: function (data) {
		console.log(data);

		answer="";
			for(i=0; i< data.feed.entry.length; i++){
				if("proposedManureAppTemp" === data.feed.entry[i].title.$t){
				answer = data.feed.entry[i].link[0].href;
				console.log(answer);
				getData();
				break;
				}
			}
		}
	});
}

function getData(){
console.log(answer);
	$.ajax({
			type: 'GET',
			url: answer,
			processData: true,
			crossDomain: true,
			data: {
			access_token: token,
			alt: 'json-in-script'
			},
			dataType: "jsonp",
			success: function (data) {
			console.log(data);
			}
		});	
}

function appendSpreadsheet(){
var atom = ["<?xml version='1.0' encoding='UTF-8'?>",
          '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:gsx="http://schemas.google.com/spreadsheets/2006/extended">',//'--END_OF_PART\r\n',
          '<gsx:columnTitle>',records,'</gsx:columnTitle>',//'--END_OF_PART\r\n',
          '</entry>'].join('');
  
  $.ajax({
		type:"POST",
		url: 'https://spreadsheets.google.com/feeds/cells/1wrTuRSXhuzu50ozWG5RcTeolnGe3GCnCCYtvpLoTGP0/o3o7gnr/private/full',
		crossDomain: true,
		data: atom,
		access_token: token,
		dataType: 'xml',
		success: function(data){
			alert("row added")
		},
		error: function(){
			alert("error");
		}
	});			
}

*/
