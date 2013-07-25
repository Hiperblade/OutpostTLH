	function ImagesLib()
	{
	}
	
	ImagesLib.initialize = function(canvasId, imagesList, onUpdateLoading)
	{
		ImagesLib.loadingMax = 0;
		ImagesLib.loading = 0;
		ImagesLib.images = [];

		var _addImage = function(code, fileName)
		{
			ImagesLib.loading++;
			ImagesLib.loadingMax++;
			var img = new Image();
			img.onload = function ()
				{
					ImagesLib.loading--;
					if(onUpdateLoading != undefined)
					{
						onUpdateLoading();
					}
				}
			img.crossOrigin='anonymous';
			if(fileName == undefined)
			{
				img.src = "images/" + code + ".gif";
			}
			else
			{
				img.src = "images/" + fileName;
			}
			
			var ret = {code: code, image: img};
			ImagesLib.images[code] = ret;
			return ret;
		}

		//**************************

		if(imagesList != undefined);
		{
			for(var i = 0; i < imagesList.length; i++)
			{
				_addImage(imagesList[i].id, imagesList[i].fileName);
			}
		}
		
		//**************************

		ImagesLib.addImage = function(code, fileName)
		{
			_addImage(code, fileName);
		}

		ImagesLib.waitLoading = function()
		{
			if(ImagesLib.loading > 0)
			{
				Log.dialog("Caricamento in corso!");
			}
		}
	}
	
	ImagesLib.getImage = function(id)
	{
		ImagesLib.waitLoading();
	
		var ret = ImagesLib.images[id];
		if(ret == undefined)
		{
			Log.error("Immagine non trovata: \"" + id + "\"");
			return null;
		}
		return ret.image;
	}
	
	ImagesLib.getPattern = function(id, ctx)
	{
		if(id == null)
		{
			return null;
		}
		
		ImagesLib.waitLoading();
		
		var ret = ImagesLib.images[id];
		if(ret == undefined)
		{
			Log.error("Immagine non trovata: \"" + id + "\"");
			return null;
		}
		if(ret.pattern == undefined)
		{
			ret.pattern = ctx.createPattern(ret.image, "repeat");
		}
		return ret.pattern;
	}