var Dropbox = require('dropbox');
var dbx = new Dropbox({ accessToken: 'FjTp_CBKuRAAAAAAAAAAC4jatPYYj04FtViOeg0N1iW4Aedi_OXfXivGOk7MTXGU' });
console.log(dbx);
dbx.filesListFolder({path: '/dld2016'})
  .then(function(response) {
    	for (var i in response.entries)
	{
		entry=response.entries[i];
		/*dbx.getFile(entry.path,function(res){
		console.log("img:"+Yres)
		});*/
		console.log(entry.name);
		//break; 
	}
	//console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  }); 
