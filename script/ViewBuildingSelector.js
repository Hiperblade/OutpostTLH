"use strict";

function BuildingSelectorView(canvasId, width, colonyState, onSelected)
{
	let canvasView = document.getElementById(canvasId);
	let ctx = canvasView.getContext("2d");
	let size = { x: width, y: 140 };
	let state = colonyState;
	let layer = TerrainLayer.Surface;
	let hidden = true;
	let baseTile = ImagesLib.getImage("baseTile");
	let numTile = 1;
	let innerspace = 5;
	let positionIndex = 0;

	let _initialize = function()
	{
		canvasView.width = size.x;
		canvasView.height = size.y;
		let remainSize = (size.x - 100);
		numTile = Math.floor(remainSize / (baseTile.width + 5));
		numTile -= 1;
		remainSize -= baseTile.width;
		innerspace = 5 + Math.floor((remainSize - (numTile * (baseTile.width + 5))) / numTile );
		numTile += 1;
		_hide();

		canvasView.addEventListener("mousedown", _doMouseDown, false);
	};

	let _doMouseDown = function(e)
	{
		if((e.pageX > 10) && (e.pageX < 40))
		{
			// bottone previous
			if(positionIndex > 0)
			{
				_drawButton("previous", "_pressed");
				positionIndex--;
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
			if(positionIndex < _countTecnology() - numTile)
			{
				_drawButton("next", "_pressed");
				positionIndex++;
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
				let index = Math.floor((e.pageX - 50) / (baseTile.width + innerspace));
				if(onSelected != undefined)
				{
					onSelected(_findTecnology(positionIndex + index));
				}
				_hide();
			}
		}
	};

	let _countTecnology = function()
	{
		let ret = 0;
		let technology = state.getTechnology();
		for(let i = 0; i < technology.length; i++)
		{
			let item = PrototypeLib.get(technology[i]);
			if(item.getTerrainLayer() == layer)
			{
				ret++;
			}
		}
		return ret;
	};

	let _findTecnology = function(index)
	{
		let ret = 0;
		let technology = state.getTechnology();
		for(let i = 0; i < technology.length; i++)
		{
			let item = PrototypeLib.get(technology[i]);
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
	};

	let _setAbsolutePosition = function(point)
	{
		canvasView.style.left = point.x + "px";
		canvasView.style.top = (point.y - size.y) + "px";
	};

	let _hide = function()
	{
		hidden = true;
		_redraw();
	};

	let _show = function()
	{
		hidden = false;
		_redraw();
	};

	let _redraw = function()
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
			if(positionIndex > 0)
			{
				_drawButton("previous", "");
			}
			else
			{
				_drawButton("previous", "_disabled");
			}

			//next
			if(positionIndex < _countTecnology() - numTile)
			{
				_drawButton("next", "");
			}
			else
			{
				_drawButton("next", "_disabled");
			}

			for(let i = 0; i < numTile; i++)
			{
				_drawImage(ctx, i, baseTile);
			}

			let index = 0;
			let item;
			let technology = state.getTechnology();
			for(let ii = 0; ii < technology.length; ii++)
			{
				item = PrototypeLib.get(technology[ii]);
				if(item.getTerrainLayer() == layer)
				{
					if(index - positionIndex >= 0)
					{
						_drawImage(ctx, index - positionIndex, ImagesLib.getImage(item.getBuildingImageId()));
					}
					index++;
					if(index - positionIndex >= numTile)
					{
						break;
					}
				}
			}
		}
	};

	let _toScreenPosition = function(slot)
	{
		return { x: 50 + (slot * (baseTile.width + innerspace)), y: size.y - 10 };
	};

	let _drawImage = function(ctx, slot, image)
	{
		let p = _toScreenPosition(slot);
		ctx.beginPath();
		ctx.drawImage(image, p.x, p.y - image.height);
		ctx.closePath();
		ctx.fill();
	};

	let _drawButton = function(type, state)
	{
		let x = 10;
		if(type == "next")
		{
			x = size.x - 40
		}
		let image = ImagesLib.getImage("button_" + type + state);
		ctx.beginPath();
		ctx.drawImage(image, x, size.y - 10 - Math.floor((baseTile.height - image.height) / 2) - image.height);
		ctx.closePath();
		ctx.fill();
	};

	let _setLayer = function(newLayer)
	{
		layer = newLayer;
		positionIndex = 0;
		_redraw();
	};

	_initialize();

	//-----------------------------------------

	this.getLayer = function() { return layer; };
	this.setLayer = _setLayer;
	this.show = _show;
	this.hide = _hide;
	this.redraw = _redraw;
	this.setAbsolutePosition = _setAbsolutePosition;

	//-----------------------------------------
}