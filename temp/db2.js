var node_dropbox = require('node-dropbox');
api = node_dropbox.api("FjTp_CBKuRAAAAAAAAAAC4jatPYYj04FtViOeg0N1iW4Aedi_OXfXivGOk7MTXGU");
api.account(function(err, res, body) {
	console.log(body);
});

api.getMetadata(".",function(data){console.log(data)});
 
