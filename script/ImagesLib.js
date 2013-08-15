	function ImagesLib()
	{
		var loadingMax = 0;
		var loading = 0;
		var images = [];

		var _addImage = function(code, fileName)
		{
			loading++;
			loadingMax++;
			var img = new Image();
			img.onload = function ()
				{
					loading--;
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
			images[code] = ret;
			return ret;
		}
		
		var _waitLoading = function()
		{
			if(ImagesLib.loading > 0)
			{
				Log.dialog("Caricamento in corso!");
			}
		}
		
		var _getImage = function(id)
		{
			_waitLoading();
		
			var ret = images[id];
			if(ret == undefined)
			{
				Log.error("Immagine non trovata: \"" + id + "\"");
				return null;
			}
			return ret.image;
		}
		
		var _getPattern = function(id, ctx)
		{
			if(id == null)
			{
				return null;
			}
			
			_waitLoading();
			
			var ret = images[id];
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
		
		var _initialize = function(canvasId, imagesList, onUpdateLoading)
		{
			if(imagesList != undefined);
			{
				for(var i = 0; i < imagesList.length; i++)
				{
					_addImage(imagesList[i].id, imagesList[i].fileName);
				}
			}
		}
		
		var _getLoadingPercentage = function()
		{
			return (loadingMax - loading) / loadingMax;
		}
		
		this.getImage = _getImage;
		this.getPattern = _getPattern;
		this.initialize = _initialize;
		this.getLoadingPercentage = _getLoadingPercentage;
	}
	
	// singleton
	var ImagesLib = new ImagesLib();