"use strict";

function MapView(map, canvasId, backgroundImage, areaSize, onChangePosition)
{
	let canvasMap = document.getElementById(canvasId);
	let ctx = canvasMap.getContext("2d");
	let position = { x: 0, y: 0 };
	let findResources = {};

	let _initialize = function()
	{
		canvasMap.width = 300;
		canvasMap.height = 150;
		canvasMap.addEventListener("mousedown", _doMouseDown, false);
	};

	let _doMouseDown = function(e)
	{
		if(onChangePosition != null)
		{
			let newPosition = _fromScreenPosition({ x: e.pageX, y: e.pageY });
			onChangePosition(newPosition);
		}
	};

	let _redraw = function()
	{
		findResources = {};
		let knowledge = map.getState().getTheory();
		for(let know = 0; know < knowledge.length; know++)
		{
			if(knowledge[know].indexOf("Find_") == 0)
			{
				findResources[knowledge[know].substr(5)] = true;
			}
		}

		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		ctx.beginPath();
		ctx.drawImage(ImagesLib.getImage(backgroundImage), 0, 0);
		ctx.closePath();
		ctx.fill();

		let structure = map.getStructure();
		for(let i = 0; i < structure.length; i++)
		{
			if(structure[i].getType() == StructureTypes.Resource)
			{
				_drawResource(structure[i].getPosition(), structure[i]);
			}
			else if(structure[i].getType() == StructureTypes.Building)
			{
				_drawBuilding(structure[i].getPosition(), structure[i]);
			}
		}

		_drawActiveArea();
	};

	let _setPosition = function(point)
	{
		position = point;
		_redraw();
	};

	let _drawActiveArea = function()
	{
		let point = _toScreenPosition(position);
		ctx.lineWidth = 1;
		ctx.strokeStyle = "lime";
		ctx.strokeRect(point.x - 1, point.y - areaSize.x - 1, areaSize.y + 2, areaSize.x + 2);
	};

	let _drawResource = function(position, resource)
	{
		if(findResources[resource.getResourceType()])
		{
			if((resource.getLayer() == map.getLayer()) &&
				(map.findBuilding( position, resource.getLayer()) == null))
			{
				let point = _toScreenPosition(position);
				ctx.beginPath();
				ctx.arc(point.x, point.y, 3, 0, Math.PI * 2, false);
				ctx.closePath();
				ctx.lineWidth = 1;
				ctx.strokeStyle = resource.getColor();
				ctx.stroke();
			}
		}
	};

	let _drawBuilding = function(position, building)
	{
		if(building.getLayer() == map.getLayer()
			/*&& building.isPipe()*/)
		{
			let point = _toScreenPosition(position);
			ctx.lineWidth = 1;
			ctx.strokeStyle = "#00FFFF";
			ctx.strokeRect(point.x, point.y, 1, 1);
		}
	};

	let _fromScreenPosition = function(point)
	{
		let currentLeft = 0, currentTop = 0;
		let obj = ctx.canvas;
		if (obj.offsetParent)
		{
			do
			{
				currentLeft += obj.offsetLeft;
				currentTop += obj.offsetTop;
			}
			while (obj = obj.offsetParent);
		}
		return { x: 150 - (point.y - currentTop), y: point.x - currentLeft };
	};

	let _toScreenPosition = function(point)
	{
		return { x: 0 + point.y, y: 150 - point.x };
	};

	_initialize();

	//-----------------------------------------

	this.getPosition = function(){ return position; };

	this.setPosition = _setPosition;
	this.redraw = _redraw;
	this.fromScreenPosition = _fromScreenPosition;

	//-----------------------------------------
}