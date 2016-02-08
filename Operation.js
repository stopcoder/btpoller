var https = require("https");
var extend = require("extend");
var promise = require("promise");
var fs = require("fs");
var Transmission = require("transmission");

var oTrans = new Transmission({
  host: "192.168.0.23",
  port: 9091,
  url: "/transmission/rpc",
  username: "transmission",
  password: "transmission"
});

var sToken = "urZCRWipaesAAAAAAAACVzDrmqfFGHjdMvxqbpMWVZYx8s64gzrw8J0Z0W3TlTSv";

var sApiArg = "Dropbox-API-Arg";

var mOptions = {
  list: {
    hostname: "api.dropboxapi.com",
    path: "/2/files/list_folder/",
    headers: {
      "Content-Type": "application/json"
    }
  },
  download: {
    hostname: "content.dropboxapi.com",
    path: "/2/files/download"
  },
  delete: {
    hostname: "api.dropboxapi.com",
    path: "/2/files/delete",
    headers: {
      "Content-Type": "application/json"
    }
  }
}

var oOptionsBase = {
	method: "POST",
	headers: {
		"Authorization": "Bearer " + sToken
	}
};

function request(oOptions, sData) {
  var pRequest = new Promise(function(fnFullfill, fnReject) {
    var req = https.request(oOptions, function(res) {
      // console.log("statusCode: ", res.statusCode);
      // console.log("headers: ", res.headers);
      var sData = "";
    	res.on("data", function(data) {
    		sData = sData + data;
    	});
      res.on("end", function() {
        fnFullfill(sData, res.headers["Dropbox-API-Result"]);
      });
      res.on("error", function(e) {
        fnReject(e);
      });
    });

    req.on("error", function(e) {
      fnReject(e);
    });

    if (sData) {
      req.write(sData);
    }

    req.end();
  });

  return pRequest;
}

function requestRaw(oOptions, sData) {
  var pRequest = new Promise(function(fnFullfill, fnReject) {
    var req = https.request(oOptions, function(res) {
      fnFullfill(res);
    });

    req.on("error", function(e) {
      fnReject(e);
    });

    if (sData) {
      req.write(sData);
    }

    req.end();
  });

  return pRequest;
}

module.exports = {
  list: function() {
    var oOptions = extend(true, {}, oOptionsBase, mOptions.list);
    var sData = JSON.stringify({
      "path": "",
      "recursive": false,
      "include_media_info": false,
      "include_deleted": false
    });

    var pResponse = request(oOptions, sData);

    return pResponse.then(function(data) {
      var oResult = JSON.parse(data.toString());
      return oResult.entries;
    });
  },
  download: function(sPath) {
    var oOptions = extend(true, {}, oOptionsBase, mOptions.download);
    var sData = JSON.stringify({
      path: sPath
    });
    oOptions.headers[sApiArg] = sData;

    var pResponse = requestRaw(oOptions);

    return pResponse.then(function(res) {
      var pSaved = new Promise(function(fnFullfill) {
        var sSavePath = "./torrent" + sPath;
        var oFileWriter = fs.createWriteStream("./torrent" + sPath);
        oFileWriter.on('finish', function() {
          fnFullfill({
            diskPath: sSavePath,
            serverPath: sPath
          });
        });
        res.pipe(oFileWriter);
      });
      return pSaved;
    });
  },
  delete: function(sPath) {
    var oOptions = extend(true, {}, oOptionsBase, mOptions.delete);
    var sData = JSON.stringify({
      path: sPath
    });

    var pResponse = request(oOptions, sData);
    return pResponse.then(function(data) {
      return JSON.parse(data.toString());
    });
  },
  transmission: function(sPath) {
    var pAdded = new Promise(function(fnFullfill, fnReject) {
      oTrans.addFile(sPath, function(err, arg) {
        if (err) {
          fnReject(err)
        } else {
          fnFullfill(arg);
        }
      });
    });
    return pAdded;
  }
};
