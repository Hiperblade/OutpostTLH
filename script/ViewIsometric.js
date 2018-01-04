"use strict";

	function IsometricView(map, canvasId, viewSize, viewTileDimension)
	{
		let yTopOffset = viewTileDimension.y * 2;
		let yBottomOffset = 50;
		let yCorner = yTopOffset + Math.floor(viewTileDimension.y * (viewSize.y) / 2);
		let yOffset = yCorner + Math.floor(viewTileDimension.y / 2);
		//let map = map;
		let canvasMap = document.getElementById(canvasId);
		canvasMap.width = viewTileDimension.x * viewSize.x;
		canvasMap.height = yTopOffset + (viewTileDimension.y * viewSize.y) + yBottomOffset;
		let ctx = canvasMap.getContext("2d");
		let canvasMask = document.createElement('canvas');
		canvasMask.id     = canvasId + "Mask";
		canvasMask.width  = canvasMap.width;
		canvasMask.height = canvasMap.height;
		let ctxMask = canvasMask.getContext("2d");
		//DEBUG: document.body.appendChild(canvasMask);
		//--------
		let buttons = [];
		let buttonsCallback = null;
		let gridCallback = null;

		let images = [];
		let texts = [];
		//--------

		let size = viewSize;
		let tileDimension = viewTileDimension;
		let position = { x: 0, y: 0 };

		let _initialize = function()
		{
			// createMask
			ctxMask.strokeStyle = "rgb(255,255,255)";
			//ctxMask.translate(0.5,0.5);
			let x, y;
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
				let res = _fromScreenPosition({ x: e.pageX, y: e.pageY });

				if(res != 0)
				{
					if(typeof res == "number")
					{
						for(let i = 0; i < buttons.length; i++)
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

		let _redraw = function()
		{
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			let i;
			// immagini
			for(i = 0; i < images.length; i++)
			{
				if(images[i].image != null)
				{
					let img = ImagesLib.getImage(images[i].image);
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
					let text = TextRepository.get(texts[i].textId);
					ctx.beginPath();
					ctx.fillStyle = "rgb(119,207,60)";
					ctx.font = texts[i].size + "px Arial";
					ctx.fillText(text, texts[i].position.x, texts[i].position.y);
					ctx.closePath();
					ctx.fill();
				}
			}

			// terreno
			let x, y;
			for(x = 0; x < size.x; x++)
			{
				for(y = 0; y < size.y; y++)
				{
					let patternId = map.getTerrainImageId(position.x + x, position.y + y);
					let pattern = ImagesLib.getPattern(patternId, ctx);
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
			let structure = map.getStructure();
			let currentLayer = map.getLayer();
			let lastStructure = null;
			for(i = 0; i < structure.length; i++)
			{
				let structurePosition = structure[i].getPosition();
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

		let _drawImage = function(ctx, point, image)
		{
			let p = _toScreenPosition(point);
			ctx.beginPath();
			ctx.drawImage(image, p.x, p.y - image.height);
			ctx.closePath();
			ctx.fill();
		};

		let _drawTile = function(ctx, tileDimension, point, pattern, strokeStyle)
		{
			if(strokeStyle == undefined)
			{
				strokeStyle	= "#77cf3c";
			}
			let p = _toScreenPosition(point);
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

		let _drawButton = function(button)
		{
			let point = button.position;
			let imageButton = button.imageButton;
			if(button.disabled)
			{
				imageButton += "_disabled";
			}
			else if(button.pressed)
			{
				imageButton += "_pressed";
			}

			let img = ImagesLib.getImage(imageButton);
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

		let _setButtonMask = function(button, erase)
		{
			let id = button.id;
			if(erase)
			{
				id = 0;
			}

			if(button.pointGrid == undefined)
			{
				let img = ImagesLib.getImage(button.imageButton);
				let width = img.width;
				let height = img.height;
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
			let img = ImagesLib.getImage(imageButton);
			// mask
			let canvasTmpMask = document.createElement('canvas');
			canvasTmpMask.width  = img.width;
			canvasTmpMask.height = img.height;
			let ctxTmpMask = canvasTmpMask.getContext("2d");
			ctxTmpMask.drawImage(img, 0, 0);
			let imageData = ctxTmpMask.getImageData(0, 0, img.width, img.height);

			let data = imageData.data;
			for(let y = 0; y < img.height; y++)
			{
				for(let x = 0; x < img.width; x++)
				{
					let alpha = data[((img.width * y) + x) * 4 + 3];
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

		let _setPosition = function(point)
		{
			position = point;
			_redraw();
		};

		let _isVisible = function(point)
		{
			let relPos = _toRelativePosition(point);
			return !(relPos.x < 0 || relPos.y < 0 || relPos.x >= size.x || relPos.y >= size.y);
		};

		let _toRelativePosition = function(point)
		{
			return { x: point.x - position.x, y: point.y - position.y };
		};

		let _toScreenPosition = function(point)
		{
			let retX = 0;
			retX += point.x * 53;
			retX += point.y * 53;

			let retY = yOffset;
			retY -= point.x * 23;
			retY += point.y * 23;

			return { x: retX, y: retY };
		};

		let _fromScreenPosition = function(point)
		{
			let curleft = 0, curtop = 0;
			let obj = ctx.canvas;
			if (obj.offsetParent)
			{
				do
				{
					curleft += obj.offsetLeft;
					curtop += obj.offsetTop;
				} while (obj = obj.offsetParent);
			}
			let x = point.x - curleft;
			let y = point.y - curtop;

			let data = ctxMask.getImageData(x, y, 1, 1).data; 

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

		let _internalAddImageButton = function(id, point, imageButton, callback, image, pointGrid)
		{
			let newButton = { id: id, position: point, imageButton: imageButton, callback: callback, image: image, pointGrid: pointGrid };
			buttons.push(newButton);
			_setButtonMask(newButton);
		};

		let _addImageButton = function(id, point, imageButton, callback, image)
		{
			_internalAddImageButton(id, point, imageButton, callback, image);
		};

		let _addButtonGrid = function(id, point, imageButton, callback)
		{
			_internalAddImageButton(id, _toScreenPosition(point), imageButton, callback, null, point);
		};

		let _addButton = function(id, point, imageButton, callback)
		{
			_internalAddImageButton(id, point, imageButton, callback);
		};

		let _setButton = function(id, enabled)
		{
			for(let i = 0; i < buttons.length; i++)
			{
				if(buttons[i].id == id)
				{
					buttons[i].disabled = !enabled;
					return;
				}
			}
		};

		let _delButton = function(id)
		{
			for(let i = 0; i < buttons.length; i++)
			{
				if(buttons[i].id == id)
				{
					buttons.splice(i, 1); // remove
					_setButtonMask(buttons[i], true);
					return;
				}
			}
		};

		let _addImageGrid = function(id, point, image)
		{
			_addImage(id, _toScreenPosition(point), image);
		};

		let _addImage = function(id, point, image)
		{
			images.push({ id: id, position: point, image: image });
		};

		let _setImage = function(id, image)
		{
			for(let i = 0; i < images.length; i++)
			{
				if(images[i].id == id)
				{
					images[i].image = image;
					return;
				}
			}
		};

		let _delImage = function(id)
		{
			for(let i = 0; i < images.length; i++)
			{
				if(images[i].id == id)
				{
					images.splice(i, 1); // remove
					return;
				}
			}
		};

		let _addText = function(id, point, size, textId)
		{
			texts.push({ id: id, position: point, size: size, textId: textId });
		};

		let _setText = function(id, textId)
		{
			for(let i = 0; i < texts.length; i++)
			{
				if(texts[i].id == id)
				{
					texts[i].textId = textId;
					return;
				}
			}
		};

		let _delText = function(id)
		{
			for(let i = 0; i < texts.length; i++)
			{
				if(texts[i].id == id)
				{
					texts.splice(i, 1); // remove
					return;
				}
			}
		};

		let _setAbsolutePosition = function(point)
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