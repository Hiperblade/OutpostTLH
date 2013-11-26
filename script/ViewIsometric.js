	function IsometricView(map, canvasId, viewSize, viewTileDimension)
	{
		var yTopOffset = viewTileDimension.y * 2;
		var yBottomOffset = 50;
		var yCorner = yTopOffset + Math.floor(viewTileDimension.y * (viewSize.y) / 2);
		var yOffset = yCorner + Math.floor(viewTileDimension.y / 2);
		//var map = map;
		var canvasMap = document.getElementById(canvasId);
		canvasMap.width = viewTileDimension.x * viewSize.x;
		canvasMap.height = yTopOffset + (viewTileDimension.y * viewSize.y) + yBottomOffset;
		var ctx = canvasMap.getContext("2d");
		var canvasMask = document.createElement('canvas');
		canvasMask.id     = canvasId + "Mask";
		canvasMask.width  = canvasMap.width;
		canvasMask.height = canvasMap.height;
		var ctxMask = canvasMask.getContext("2d");
		//DEBUG: document.body.appendChild(canvasMask);
		//--------
		var buttons = [];
		var buttonsCallback = null;
		var gridCallback = null;
		
		var images = [];
		var texts = [];
		//--------
		
		var size = viewSize;
		var tileDimension = viewTileDimension;
		var position = { x: 0, y: 0 };
		
		var _initialize = function()
		{
			// createMask
			ctxMask.strokeStyle = "rgb(255,255,255)";
			//ctxMask.translate(0.5,0.5);
			var x, y;
			for(x = 0; x < size.x; x++)
			{
				for(y = 0; y < size.y; y++)
				{
					_drawTile(ctxMask, tileDimension, { x: x, y: y }, "rgb(" + (x + 1) + "," + (y + 1) + ",0)", "#000000");
					ctxMask.stroke();
				}
			}
			
			//pulisco il context
			ctxMask.beginPath();
			ctxMask.closePath();
			
			canvasMap.addEventListener("mousedown", doMouseDown, false);
			function doMouseDown(e)
			{
				var res = _fromScreenPosition({ x: e.pageX, y: e.pageY });

				if(res != 0)
				{
					if(typeof res == "number")
					{
						for(var i = 0; i < buttons.length; i++)
						{
							if(buttons[i].id == res)
							{
								if(buttons[i].disabled != true)
								{
									buttons[i].pressed = true;
									_drawButton(buttons[i]);
									if(buttons[i].callback != undefined)
									{
										buttons[i].callback();
									}
									else if(buttonsCallback != null)
									{
										buttonsCallback(res);
									}

									window.setTimeout((function(index){
                                            return function()
                                            {
                                                buttons[index].pressed = false;
                                                _drawButton(buttons[index]);
                                            }
                                        }(i)), 200);
								}
								return;
							}
						}
					}
					else
					{
						if(gridCallback != null)
						{
							gridCallback(res);
						}
					}
				}
			}
		};
		
		var _redraw = function()
		{
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            var i;
			// immagini
			for(i = 0; i < images.length; i++)
			{
				if(images[i].image != null)
				{
					var img = ImagesLib.getImage(images[i].image);
					ctx.beginPath();
					ctx.drawImage(img, images[i].position.x, images[i].position.y - img.height);
					ctx.closePath();
					ctx.fill();
				}
			}
			
			// bottoni
			for(i = 0; i < buttons.length; i++)
			{
				_drawButton(buttons[i]);
			}
			
			// testi
			for(i = 0; i < texts.length; i++)
			{
				if(texts[i].textId != null)
				{
					var text = TextRepository.get(texts[i].textId);
					ctx.beginPath();
					ctx.fillStyle = "rgb(119,207,60)";
					ctx.font = texts[i].size + "px Arial";
					ctx.fillText(text, texts[i].position.x, texts[i].position.y);
					ctx.closePath();
					ctx.fill();
				}
			}

			// terreno
			var x, y;
			for(x = 0; x < size.x; x++)
			{
				for(y = 0; y < size.y; y++)
				{
					var patternId = map.getTerrainImageId(position.x + x, position.y + y);
					var pattern = ImagesLib.getPattern(patternId, ctx);
					if((patternId == null) || (pattern == undefined))
					{
						pattern = "rgb(10,10,10)";
					}
					_drawTile(ctx, tileDimension, { x: x, y: y }, pattern);
				}
			}
			//pulisco il context
			ctx.beginPath();
			ctx.closePath();
			
			//Risorse ed Edifici e Robot
			var structure = map.getStructure();
			var currentLayer = map.getLayer();
			var lastStructure = null;
			for(i = 0; i < structure.length; i++)
			{
				var structurePosition = structure[i].getPosition();
				if((structure[i].getLayer() == currentLayer) && (_isVisible(structurePosition)) && (map.isVisible(structurePosition)))
				{
					if((lastStructure == null) ||
						(lastStructure.getPosition().x != structurePosition.x) ||
						(lastStructure.getPosition().y != structurePosition.y))
					{
						_drawImage(ctx, _toRelativePosition(structurePosition), ImagesLib.getImage(structure[i].getImageId()));
						lastStructure = structure[i];
					}
				}
			}
		};
		
		var _drawImage = function(ctx, point, image)
		{
			var p = _toScreenPosition(point);
			ctx.beginPath();
			ctx.drawImage(image, p.x, p.y - image.height);
			ctx.closePath();
			ctx.fill();
		};
		
		var _drawTile = function(ctx, tileDimension, point, pattern, strokeStyle)
		{
			if(strokeStyle == undefined)
			{
				strokeStyle	= "#77cf3c";
			}
			var p = _toScreenPosition(point);
			ctx.beginPath();
			ctx.moveTo(p.x                         , p.y - (tileDimension.y / 2));
			ctx.lineTo(p.x + (tileDimension.x / 2) , p.y);
			ctx.lineTo(p.x + tileDimension.x       , p.y - (tileDimension.y / 2));
			ctx.lineTo(p.x + (tileDimension.x / 2) , p.y - tileDimension.y);
			ctx.closePath();
			ctx.fillStyle = pattern;
			ctx.lineWidth = 0.3;
			ctx.strokeStyle = strokeStyle;
			ctx.fill();
			ctx.stroke();
	 	};

		var _drawButton = function(button)
		{
			var point = button.position;
			var imageButton = button.imageButton;
			if(button.disabled)
			{
				imageButton += "_disabled";
			}
			else if(button.pressed)
			{
				imageButton += "_pressed";
			}

			var img = ImagesLib.getImage(imageButton);
			ctx.beginPath();
			ctx.drawImage(img, point.x, point.y - img.height);
			ctx.closePath();
			ctx.fill();

			if(button.image != undefined)
			{
				img = ImagesLib.getImage(button.image);
				ctx.beginPath();
				ctx.drawImage(img, point.x, point.y - img.height);
				ctx.closePath();
				ctx.fill();
			}
		};
		
		var _setButtonMask = function(button, erase)
		{
			var id = button.id;
			if(erase)
			{
				id = 0;
			}

			if(button.pointGrid == undefined)
			{
				var img = ImagesLib.getImage(button.imageButton);
				var width = img.width;
				var height = img.height;
				ctxMask.fillStyle = "rgb(0,0," + id + ")";
				ctxMask.lineWidth = 0.3;
				ctxMask.strokeStyle = "#000000";
				ctxMask.beginPath();
				ctxMask.fillRect(button.position.x, button.position.y - height, width, height);
				ctxMask.closePath();
				ctxMask.fill();
				ctxMask.stroke();
			}
			else
			{
				_drawTile(ctxMask, tileDimension, { x: button.pointGrid.x, y: button.pointGrid.y }, "rgb(0,0," + id + ")", "#000000");
			}
			
			/* Gestione inibita per compatibilit�
			var img = ImagesLib.getImage(imageButton);
			// mask
			var canvasTmpMask = document.createElement('canvas');
			canvasTmpMask.width  = img.width;
			canvasTmpMask.height = img.height;
			var ctxTmpMask = canvasTmpMask.getContext("2d");
			ctxTmpMask.drawImage(img, 0, 0);
			var imageData = ctxTmpMask.getImageData(0, 0, img.width, img.height);
			
			var data = imageData.data;
			for(var y = 0; y < img.height; y++)
			{
				for(var x = 0; x < img.width; x++)
				{
					var alpha = data[((img.width * y) + x) * 4 + 3];
					if(alpha != 0)
					{
						data[((img.width * y) + x) * 4] = 0; // red
						data[((img.width * y) + x) * 4 + 1] = 0; // green
						data[((img.width * y) + x) * 4 + 2] = id; // blue
					}
				}
			}
			ctxMask.putImageData(imageData, point.x, point.y - img.height);
			*/
		};
		
		var _setPosition = function(point)
		{
			position = point;
			_redraw();
		};
	 	
	 	var _isVisible = function(point)
	 	{
	 		var relPos = _toRelativePosition(point);
            return !(relPos.x < 0 || relPos.y < 0 || relPos.x >= size.x || relPos.y >= size.y);
		};
	 	
	 	var _toRelativePosition = function(point)
	 	{
	 		return { x: point.x - position.x, y: point.y - position.y };
	 	};
	 	
	 	var _toScreenPosition = function(point)
		{
			var retX = 0;
			retX += point.x * 53;
			retX += point.y * 53;

			var retY = yOffset;
			retY -= point.x * 23;
			retY += point.y * 23;
			
			return { x: retX, y: retY };
		};
		
		var _fromScreenPosition = function(point)
		{
			var curleft = 0, curtop = 0;
			var obj = ctx.canvas;
			if (obj.offsetParent)
			{
				do
				{
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				} while (obj = obj.offsetParent);
			}
			var x = point.x - curleft;
			var y = point.y - curtop;
			
			var data = ctxMask.getImageData(x, y, 1, 1).data; 

			if(data[0] == 0 && data[1] == 0)
			{
				return data[2];
			}
			else if(data[2] == 0)
			{
				return { x: data[0] - 1 + position.x, y: data[1] - 1 + position.y };	
			}
			return 0;
		};
		
		var _internalAddImageButton = function(id, point, imageButton, callback, image, pointGrid)
		{
			var newButton = { id: id, position: point, imageButton: imageButton, callback: callback, image: image, pointGrid: pointGrid };
			buttons.push(newButton);
			_setButtonMask(newButton);
		};
		
		var _addImageButton = function(id, point, imageButton, callback, image)
		{
			_internalAddImageButton(id, point, imageButton, callback, image);
		};
		
		var _addButtonGrid = function(id, point, imageButton, callback)
		{
			_internalAddImageButton(id, _toScreenPosition(point), imageButton, callback, null, point);
		};
		
		var _addButton = function(id, point, imageButton, callback)
		{
			_internalAddImageButton(id, point, imageButton, callback);
		};
		
		var _setButton = function(id, enabled)
		{
			for(var i = 0; i < buttons.length; i++)
			{
				if(buttons[i].id == id)
				{
					buttons[i].disabled = !enabled;
					return;
				}
			}
		};
		
		var _delButton = function(id)
		{
			for(var i = 0; i < buttons.length; i++)
			{
				if(buttons[i].id == id)
				{
					buttons.splice(i, 1); // remove
					_setButtonMask(buttons[i], true);
					return;
				}
			}
		};
		
		var _addImageGrid = function(id, point, image)
		{
			_addImage(id, _toScreenPosition(point), image);
		};
		
		var _addImage = function(id, point, image)
		{
			images.push({ id: id, position: point, image: image });
		};

		var _setImage = function(id, image)
		{
			for(var i = 0; i < images.length; i++)
			{
				if(images[i].id == id)
				{
					images[i].image = image;
					return;
				}
			}
		};
		
		var _delImage = function(id)
		{
			for(var i = 0; i < images.length; i++)
			{
				if(images[i].id == id)
				{
					images.splice(i, 1); // remove
					return;
				}
			}
		};
		
		var _addText = function(id, point, size, textId)
		{
			texts.push({ id: id, position: point, size: size, textId: textId });
		};
		
		var _setText = function(id, textId)
		{
			for(var i = 0; i < texts.length; i++)
			{
				if(texts[i].id == id)
				{
					texts[i].textId = textId;
					return;
				}
			}
		};
		
		var _delText = function(id)
		{
			for(var i = 0; i < texts.length; i++)
			{
				if(texts[i].id == id)
				{
					texts.splice(i, 1); // remove
					return;
				}
			}
		};
		
		var _setAbsolutePosition = function(point)
		{
			canvasMap.style.top = point.y + "px";
			canvasMap.style.left = point.x + "px";
		};
		
		//-----------------------------------------
		
		this.getPosition = function() { return position; };
		this.getSize = function() { return size; };
		this.getCanvasSize = function() { return { x: canvasMap.width, y: canvasMap.height }; };
		this.getVerticalMiddle = function() { return yCorner; };
		
		this.redraw = _redraw;
		this.fromScreenPosition = _fromScreenPosition;
		this.setPosition = _setPosition;
		this.addImageButton = _addImageButton;
		this.addButtonGrid = _addButtonGrid;
		this.addButton = _addButton;
		this.delButton = _delButton;
		this.setButton = _setButton;
		this.setButtonsCallback = function(callback) { buttonsCallback = callback; };
		this.setGridCallback = function(callback) { gridCallback = callback; };
		this.addImageGrid = _addImageGrid;
		this.addImage = _addImage;
		this.delImage = _delImage;
		this.setImage = _setImage;
		this.addText = _addText;
		this.setText = _setText;
		this.delText = _delText;
		this.setAbsolutePosition = _setAbsolutePosition;
		
		//-----------------------------------------
		_initialize();
	}