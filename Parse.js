// Load the fs (filesystem) module
var fs = require('fs');

// Read the contents of the file into memory.
fs.readFile('Example.txt', function (err, logData) {
  
// If an error occurred, throwing it will
  // display the exception and end our app.
  if (err) throw err;
  
// logData is a Buffer, convert to string.
  var text = logData.toString();
  var searchurlparms = 
  [
      'count_pending_messages',
      'get_messages',
      'get_friends_progress',
      'get_friends_score',
      ' ',
  ];
  
  var searchUrl = 
  {
      'GET': searchurlparms,
      'POST' : ' ',
  };
  
  var results = {};

  var TextToSplit = 'bytes=';
  
// Break up the file into lines.
  var lines = text.split(TextToSplit);
  
  var MaxDyno = -1000;
  
  var searchDynoExpr = /( Dyno=web.\d+)/;
  var connectTimeExpr = /(connect=\d+)/g;
  var serviceTimeExpr = /(service=\d+)/g;
  
  var MethodGETWithTagExpr = /(method=GET path=\/api\/users\/[0-9]+\/[A-Z|_]+)/gi;
  var MethodGETWithoutTagExpr = /(method=GET path=\/api\/users\/[0-9]+)/gi;
  var MethodPOSTExpr = /(method=POST path=\/api\/users\/[0-9]+)/gi;
  
  var vLastpartForGet = /([A-Z|_]+)/gi;
  
  var vURLFreq = {};
  var vPosturlname = 'POST /api/users/{user_id}';
  var vGeturlname = 'GET /api/users/{user_id}';
  
  var responseAll = [];
  var Totalresponse = 0;
  
  var responsefreq = [];
  
  var vModefreq = 0;
 
      
  lines.forEach(function(line) {
        var IsGetMethodWithTag = line.match(MethodGETWithTagExpr);
        var IsGetMethodWithoutTag = line.match(MethodGETWithoutTagExpr);
        var IsPostMethod = line.match(MethodPOSTExpr);
        
        var vUrlName = '';
        if (IsPostMethod !== null) 
            vUrlName = vPosturlname;
        else if (IsGetMethodWithTag !== null)
        {
            UrllastPeak = IsGetMethodWithTag.toString().match(vLastpartForGet)[5]; 
            console.log(UrllastPeak);
            if (UrllastPeak.toString() in searchurlparms)
                vUrlName = vGeturlname + '/' + urllastPeak;
        }
        else if (IsGetMethodWithoutTag !== null)
            vUrlName = vGeturlname;
        
        if (vUrlName !== '')
        {
            if(!vURLFreq[vUrlName]) {
                vURLFreq[vUrlName] = 1;
            }
            else
                vURLFreq[vUrlName] = ++vURLFreq[vUrlName];
        }
        
        //console.log(vURLFreq);
        
        var Dyno = line.match(searchDynoExpr);
        if (Dyno !== null)
        {
            var DynoNum = Dyno.toString().split('Dyno=web.')[1];
            
            if(!results[DynoNum]) {
                results[DynoNum] = 1;
            }
            else
                results[DynoNum] = ++results[DynoNum];
                
            if (MaxDyno < results[DynoNum])
                MaxDyno = results[DynoNum];
        }
        
        var connect = line.match(connectTimeExpr);
        var service = line.match(serviceTimeExpr);
        if (connect !== null && service !== null)
        {
            var connectval = connect.toString().split('connect=')[1];
            var serviceval = service.toString().split('service=')[1];
            var response = parseInt(connectval) + parseInt(serviceval);
            Totalresponse = Totalresponse + response;
            responseAll.push(Totalresponse);
            
            if(!responsefreq[response]) {
                responsefreq[response] = 1;
            }
            else
                responsefreq[response] = ++responsefreq[response];
    
            if (vModefreq === 0 || responsefreq[vModefreq] < responsefreq[response])
                vModefreq = response;
        }
    });
    
    console.log(vURLFreq);
    
    var vMeanResponse = Totalresponse / responseAll.length;
    console.log("Mean response time:");
    console.log(vMeanResponse);
    
    responseAll.sort();
    var MiddlePos = Math.floor(responseAll.length / 2);
    var vMedianPos = responseAll[MiddlePos];
    if (responseAll.length % 2 === 0)
    {
       var nextPos = MiddlePos + 1;
       vMedianPos = (vMedianPos + responseAll[nextPos]) / 2;
    }
    
    console.log("Median response time:");   
    console.log(vMedianPos);
    
    console.log("Mode response time:");
    console.log(vModefreq);
    
    Object.keys(results).forEach(function(key){
        var v = results[key];
        if (v === MaxDyno)
        {
           console.log("Maximum responded dyno");
           console.log("web." + key.split(',')[0]);
        }
    });
    
});



