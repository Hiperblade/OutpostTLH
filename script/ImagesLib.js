	function ImagesLibConstructor()
	{
		var images = [];
		var loadingMax = 0;
		var loading = 0;
		var onUpdateLoadingCallback = undefined;

		var onLoadCallback = function()
		{
			loading--;
			if(onUpdateLoadingCallback != undefined)
			{
				onUpdateLoadingCallback();
			}
		};

		var _addImage = function(code, fileName)
		{
			loading++;
			loadingMax++;
			var ret = { code: code, image: new Image(), fileName: null };
			ret.image.onload = onLoadCallback;
			ret.image.crossOrigin='anonymous';
			if(fileName == undefined)
			{
				fileName = "images/" + code + ".gif";
			}
			else
			{
				fileName = "images/" + fileName;
			}
			ret.fileName = fileName;
			ret.image.src = fileName;
			images[code] = ret;
			return ret;
		};

		var _initialize = function(canvasId, imagesList, onUpdateLoading)
		{
			onUpdateLoadingCallback = onUpdateLoading;
			if(imagesList != undefined)
			{
				for(var i = 0; i < imagesList.length; i++)
				{
					_addImage(imagesList[i].id, imagesList[i].fileName);
				}
			}
		};

		var _getLoadingPercentage = function()
		{
			return (loadingMax - loading) / loadingMax;
		};

		var _waitLoading = function()
		{
			if(loading > 0)
			{
				Log.dialog("Caricamento in corso!");
			}
		};

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
		};

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
		};

		var _getFileName = function(id)
		{
			var ret = images[id];
			if(ret == undefined)
			{
				Log.error("Immagine non trovata: \"" + id + "\"");
				return null;
			}
			return ret.fileName;
		};

		this.getImage = _getImage;
		this.getPattern = _getPattern;
		this.getFileName = _getFileName;
		this.initialize = _initialize;
		this.getLoadingPercentage = _getLoadingPercentage;
	}

	// singleton
	var ImagesLib = new ImagesLibConstructor();