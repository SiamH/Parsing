var args = process.argv.slice(2);

var CmdMethod = null;
var CmdUrlPath = null;

if (args.length > 0)
    CmdMethod = args[0];
if (args.length > 1)
    CmdUrlPath = args[1];

var sOutputFile = 'Result.txt';

var fs = require('fs');

var vIsGetmethod = false;
var vIsPostmethod = false;
if (CmdMethod !== null)
{
    vIsGetmethod = (CmdMethod.search('GET') !== -1);
    vIsPostmethod = (CmdMethod.search('POST') !== -1)
}

if (CmdMethod === null || (vIsGetmethod === false && vIsPostmethod === false))
{
    var sError = "Invalid method "  + CmdMethod;
    fs.writeFile(sOutputFile, sError, function(err)
    {
        console.log("Writing Successful to Ouput file.");
    });
    return;   
}

var vUrlParm = null;
if (CmdUrlPath !== null)
{
    if (CmdUrlPath.search('count_pending_messages') !== -1)
        vUrlParm = 'count_pending_messages';
    else if (CmdUrlPath.search('get_messages') !== -1)
         vUrlParm = 'get_messages';
    else if (CmdUrlPath.search('get_friends_progress') !== -1)
         vUrlParm = 'get_friends_progress';
    else if (CmdUrlPath.search('get_friends_score') !== -1)
         vUrlParm = 'get_friends_score';
    else
    {
        var sError = "Invalid Url path "  + Cmdmethod;
        fs.writeFile(sOutputFile, sError, function(err)
        {
            console.log("Writing error");
        });
        return;
    }
}

// Read the contents of the file into memory.
fs.readFile('Example.txt', function (err, logData) {
  
// If an error occurred, throwing it will
  // display the exception and end our app.
  if (err) throw err;
  
// logData is a Buffer, convert to string.
  var text = logData.toString();
  
  var TextToSplit = /(bytes=\d+)/;
  
// Break up the file into lines.
  var lines = text.split(TextToSplit);
  
  var MaxDyno = -1000;
  
  var searchDynoExpr = /( Dyno=web.\d+)/gi;
  var connectTimeExpr = /(connect=\d+)/g;
  var serviceTimeExpr = /(service=\d+)/g;
  
  var vURLFreq = {};
  
  var responseAll = [];
  var Totalresponse = 0;
  
  var responsefreq = [];
  
  var vModefreq = 0;
  
  var MethodExpr = 'method=';
  var vUrlName;
  if (vIsGetmethod)
  {
     MethodExpr = MethodExpr + "GET ";
     vUrlName = 'GET /api/users/{user_id}';
  }
  else
  {
     MethodExpr = MethodExpr + "POST ";
     vUrlName = 'POST /api/users/{user_id}';
  }
     
  var PathExpr = 'path=\/api\/users\/[0-9]+';
  if (vUrlParm !== null)
  {
    vUrlName = vUrlName + '\/' + vUrlParm;
    PathExpr =  PathExpr + '\/' + vUrlParm;
  }
  else
    PathExpr = PathExpr + ' ';
  
   PathExpr = MethodExpr + PathExpr ;
   
   var results = {};
   
   var vOccurence = 0;
   lines.forEach(function(line) {
      var vResult = line.match(PathExpr);
      if (vResult !== null)
      {
        vOccurence++;
        var Dyno = line.match(searchDynoExpr);
        if (Dyno !== null)
        {
            var DynoNum = Dyno.toString().split('dyno=web.')[1];
            
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
      }
    });
    
    if (vOccurence > 0)
    {
        var sLog = "Frequency of URL " + vUrlName + ": " + vOccurence;
        sLog = sLog + '\n';
        
        var vMeanResponse = Totalresponse / responseAll.length;
        sLog = sLog + "Mean response time: " + vMeanResponse;
        sLog = sLog + '\n';
        
        responseAll.sort();
        var MiddlePos = Math.floor(responseAll.length / 2);
        var vMedianVal = responseAll[MiddlePos];
        if (responseAll.length % 2 === 0)
        {
           var nextPos = MiddlePos + 1;
           if (nextPos == responseAll.length)
                nextPos = MiddlePos - 1;
                
           vMedianVal = (vMedianVal + responseAll[nextPos]) / 2;
        }
        
        sLog = sLog + "Median response time: " + vMedianVal;
        sLog = sLog + '\n';
        
        sLog = sLog + "Mode response time: " + vModefreq;
        sLog = sLog + '\n';
        
        sLog = sLog + "Maximum responded dyno: ";
        Object.keys(results).forEach(function(key){
            var v = results[key];
            if (v === MaxDyno)
               sLog = sLog + "web." + key.split(',')[0];
        });
        
    fs.writeFile(sOutputFile, sLog, function(err)
    {
        console.log("Writing Successful to Output file");
    });
    
    }
});








