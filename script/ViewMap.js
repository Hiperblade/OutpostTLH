	function MapView(map, canvasId, backgroundImage, areaSize, onChangePosition)
	{
		var map = map;
		var canvasMap = document.getElementById(canvasId);
		var ctx = canvasMap.getContext("2d");
		var backgroundImage = backgroundImage;
		var areaSize = areaSize;
		var position = { x: 0, y: 0 };

		var _initialize = function()
		{
			canvasMap.width = 300;
			canvasMap.height = 150;
			canvasMap.addEventListener("mousedown", _doMouseDown, false);
		}
		
		var _doMouseDown = function(e)
		{
			if(onChangePosition != null)
			{
				var newPosition = _fromScreenPosition({ x: e.pageX, y: e.pageY });
				onChangePosition(newPosition);
			}
		}
		
		var _redraw = function()
		{
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			
			ctx.beginPath();
			ctx.drawImage(ImagesLib.getImage(backgroundImage), 0, 0);
			ctx.closePath();
			ctx.fill();
			
			var structure = map.getStructure();
			for(var i = 0; i < structure.length; i++)
			{
				if(structure[i].getType() == StructureTypes.Resource)
				{
					_drawResource(structure[i].getPosition(), structure[i]);
				}
				else if(structure[i].getType() == StructureTypes.Building)
				{
					//_drawBuilding(structure[i].getPosition());
				}
			}
			
			_drawActiveArea();
		}
		
		var _setPosition = function(point)
		{
			position = point;
			_redraw();
		}
		
		var _drawActiveArea = function()
		{
			var point = _toScreenPosition(position);
			ctx.lineWidth = 1;
			ctx.strokeStyle = "lime";
			ctx.strokeRect(point.x - 1, point.y - areaSize.x - 1, areaSize.y + 2, areaSize.x + 2);
	 	}

		var _drawResource = function(position, resource)
		{
			var point = _toScreenPosition(position);
			ctx.beginPath();
			ctx.arc(point.x, point.y, 3, 0, Math.PI * 2, false);
			ctx.closePath();
			ctx.lineWidth = 1;
			ctx.strokeStyle = _getResourceColor(resource);
			ctx.stroke();
	 	}
		
		var _getResourceColor = function(resource)
		{
			var layer = resource.getLayer();
			//var type = resource.getResourceType();
			
			if(layer == TerrainLayer.Surface)
			{
				return "#FFFF00";
			}
			else if(layer == TerrainLayer.Underground)
			{
				return "#FF6600";
			}
			else if(layer == TerrainLayer.Deep)
			{
				return "#77FF77";
			}
			
			return "#FFFFFF";
		}
		
		var _drawBuilding = function(position)
		{
			var point = _toScreenPosition(position);
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#00FFFF";
			ctx.strokeRect(point.x, point.y, 1, 1);
		}
		
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
			
			return { x: 150 - y, y: x };
		}

		var _toScreenPosition = function(point)
		{
			return { x: point.y, y: 150 - point.x };
		}
		
		var _setAbsolutePosition = function(point)
		{
			canvasMap.style.top = point.y + "px";
			canvasMap.style.left = point.x + "px";
		}
		
		_initialize();
		
		//-----------------------------------------
		
		this.getPosition = function(){ return position; }
		
		this.setPosition = _setPosition;
		this.redraw = _redraw;
		this.fromScreenPosition = _fromScreenPosition;
		this.setAbsolutePosition = _setAbsolutePosition;
		
		//-----------------------------------------
	}