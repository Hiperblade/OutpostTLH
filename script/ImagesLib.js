"use strict";

	function ImagesLibConstructor()
	{
		let images = [];
		let loadingMax = 0;
		let loading = 0;
		let onUpdateLoadingCallback = undefined;

		let onLoadCallback = function()
		{
			loading--;
			if(onUpdateLoadingCallback != undefined)
			{
				onUpdateLoadingCallback();
			}
		};

		let _addImage = function(code, fileName)
		{
			loading++;
			loadingMax++;
			let ret = { code: code, image: new Image(), fileName: null };
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

		let _initialize = function(canvasId, imagesList, onUpdateLoading)
		{
			onUpdateLoadingCallback = onUpdateLoading;
			if(imagesList != undefined)
			{
				for(let i = 0; i < imagesList.length; i++)
				{
					_addImage(imagesList[i].id, imagesList[i].fileName);
				}
			}
		};

		let _getLoadingPercentage = function()
		{
			return (loadingMax - loading) / loadingMax;
		};

		let _waitLoading = function()
		{
			if(loading > 0)
			{
				Log.dialog("Caricamento in corso!");
			}
		};

		let _getImage = function(id)
		{
			_waitLoading();

			let ret = images[id];
			if(ret == undefined)
			{
				Log.error("Immagine non trovata: \"" + id + "\"");
				return null;
			}
			return ret.image;
		};

		let _getPattern = function(id, ctx)
		{
			if(id == null)
			{
				return null;
			}

			_waitLoading();

			let ret = images[id];
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

		let _getFileName = function(id)
		{
			let ret = images[id];
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
	let ImagesLib = new ImagesLibConstructor();