var Operation = require("./Operation.js");

setInterval(function() {
  var pList = Operation.list();

  pList.then(function(aFiles) {
    return Promise.all(aFiles.map(function(oFile) {
      return Operation.download(oFile.path_lower)
                //add to transmission
                .then(function(oParams) {
                  console.log("File saved to " + oParams.diskPath);
                  return Operation.transmission(oParams.diskPath).then(function(arg) {
                    console.log("Added to transmission");
                    return oParams.serverPath;
                  });
                })
                //delete from dropbox
                .then(function(sPath) {
                  return Operation.delete(sPath);
                })
                .then(function(data) {
                  console.log("Deleted!");
                })
                .catch(function(e) {
                  return Promise.reject(e);
                });
    }));
  }).then(function() {
    console.log("all done");
  }).catch(function(e) {
    console.log(e);
  });
}, 60 * 1000);
