	function BuildingSelectorView(canvasId, width, colonyState, onSelected)
	{
		var canvasView = document.getElementById(canvasId);
		var ctx = canvasView.getContext("2d");
		var size = { x: width, y: 140 };
		var position = { x: 0, y: 0 };
		var state = colonyState;
		var layer = TerrainLayer.Surface;
		var hidden = true;
		var baseTile = ImagesLib.getImage("baseTile");
		var numTile = 1;
		var innerspace = 5;
		var position = 0;
		
		var _initialize = function()
		{
			canvasView.width = size.x;
			canvasView.height = size.y;
			var remainSize = (size.x - 100);
			numTile = Math.floor(remainSize / (baseTile.width + 5));
			numTile -= 1;
			remainSize -= baseTile.width;
			innerspace = 5 + Math.floor((remainSize - (numTile * (baseTile.width + 5))) / numTile );
			numTile += 1;
			_hide();
			
			canvasView.addEventListener("mousedown", _doMouseDown, false);
		}
		
		var _doMouseDown = function(e)
		{
			if((e.pageX > 10) && (e.pageX < 40))
			{
				// bottone previous
				if(position > 0)
				{
					_drawButton("previous", "_pressed");
					position--;
				}
				_redraw();
				
				window.setTimeout(function()
					{
						_redraw();
					}, 200);
			}
			else if((e.pageX > size.x - 40) && (e.pageX < size.x - 10))
			{
				// bottone next
				if(position < _countTecnology() - numTile)
				{
					_drawButton("next", "_pressed");
					position++;
				}
				_redraw();
				
				window.setTimeout(function()
					{
						_redraw();
					}, 200);
			}
			else if((e.pageX > 40) && (e.pageX < size.x - 40))
			{
				// edificio
				if(((e.pageX - 50) % (baseTile.width + innerspace)) <= baseTile.width)
				{
					var index = Math.floor((e.pageX - 50) / (baseTile.width + innerspace));
					if(onSelected != undefined)
					{
						onSelected(_findTecnology(position + index));
					}
					_hide();
				}
			}
		}
		
		var _countTecnology = function()
		{
			var ret = 0;
			var technology = state.getTechnology();
			for(var i = 0; i < technology.length; i++)
			{
				item = PrototypeLib.get(technology[i]);
				if(item.getTerrainLayer() == layer)
				{
					ret++;
				}
			}
			return ret;
		}
		
		var _findTecnology = function(index)
		{
			var ret = 0;
			var technology = state.getTechnology();
			for(var i = 0; i < technology.length; i++)
			{
				item = PrototypeLib.get(technology[i]);
				if(item.getTerrainLayer() == layer)
				{
					if(ret == index)
					{
						return technology[i];
					}
					ret++;
				}
			}
			return null;
		}
		
		var _setAbsolutePosition = function(point)
		{
			position = point;
			canvasView.style.left = point.x + "px";
			canvasView.style.top = (point.y - size.y) + "px";
		}
		
		var _hide = function()
		{
			hidden = true;
			_redraw();
		}
		
		var _show = function()
		{
			hidden = false;
			_redraw();
		}
		
		var _redraw = function()
		{
			if(hidden)
			{
				canvasView.style.display = 'none';
				//canvasView.style.visibility = "hidden";
			}
			else
			{
				canvasView.style.display = 'block';
				//canvasView.style.visibility = "visible";
				
				ctx.globalAlpha = 0.8;
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.fillStyle = "black";
				ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.globalAlpha = 1;
				
				//previous
				if(position > 0)
				{
					_drawButton("previous", "");
				}
				else
				{
					_drawButton("previous", "_disabled");
				}
				
				//next
				if(position < _countTecnology() - numTile)
				{
					_drawButton("next", "");
				}
				else
				{
					_drawButton("next", "_disabled");
				}
				
				for(var i = 0; i < numTile; i++)
				{
					_drawImage(ctx, i, baseTile);
				}
				
				var index = 0;
				var item;
				var technology = state.getTechnology();
				for(var i = 0; i < technology.length; i++)
				{
					item = PrototypeLib.get(technology[i]);
					if(item.getTerrainLayer() == layer)
					{
						if(index - position >= 0)
						{
							_drawImage(ctx, index - position, ImagesLib.getImage(item.getBuildingImageId()));	
						}
						index++;
						if(index - position >= numTile)
						{
							break;
						}
					}
				}
			}
		}
		
		var _toScreenPosition = function(slot)
		{
			return { x: 50 + (slot * (baseTile.width + innerspace)), y: size.y - 10 };
		}
		
		var _drawImage = function(ctx, slot, image)
		{
			var p = _toScreenPosition(slot);
			ctx.beginPath();
			ctx.drawImage(image, p.x, p.y - image.height);
			ctx.closePath();
			ctx.fill();
		}
		
		var _drawButton = function(type, state)
		{
			var x = 10;
			if(type == "next")
			{
				x = size.x - 40
			}
			var image = ImagesLib.getImage("button_" + type + state);
			ctx.beginPath();
			ctx.drawImage(image, x, size.y - 10 - Math.floor((baseTile.height - image.height) / 2) - image.height);
			ctx.closePath();
			ctx.fill();
		}
		
		var _setLayer = function(newLayer)
		{
			layer = newLayer;
			position = 0;
			_redraw();
		}
		
		_initialize();
		
		//-----------------------------------------
		
		this.getLayer = function() { return layer; }
		this.setLayer = _setLayer;
		this.show = _show;
		this.hide = _hide;
		this.redraw = _redraw;
		this.setAbsolutePosition = _setAbsolutePosition;
		
		//-----------------------------------------
	}