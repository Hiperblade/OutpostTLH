"use strict";

let Typology = {
	Vulcanic: "vulcanic",
	Asteroid: "asteroid",
	Ice: "ice",
	Desert: "desert",
	Jungle: "jungle",
	Rock: "rock",
	Stone: "stone"
};

let TerrainLayer = {
	Surface: "surface",
	Underground: "underground",
	Deep: "deep"
};

let Morphology = {
	Razed: "razed",
	Clear: "clear",
	Rough: "rough",
	Impervious: "impervious",
	Inaccessible: "inaccessible",
	Undiscovery: "undiscovered"
};

let StructureTypes = {
	Resource: "resource",
	Building: "building",
	Robot: "robot"
};

function TerrainMap(terrainTypology, size)
{
	let typology = terrainTypology;
	let layer = TerrainLayer.Surface;
	let surface = [];
	let underground = [];
	let deep = [];
	let structure = [];
	let state = new ColonyState();

	let _initialize = function()
	{
		let x, y;
		for(x = 0; x < size.x; x++)
		{
			surface[x] = [];
			underground[x] = [];
			deep[x] = [];
			for(y = 0; y < size.y; y++)
			{
				surface[x][y] = _randomMorphology();
				underground[x][y] = 9;
				deep[x][y] = 9;
				//debug: underground[x][y] = _randomMorphology();
				//debug: deep[x][y] = _randomMorphology();
			}
		}
	};

	let _randomMorphology = function()
	{
		let ret = Math.floor(Math.random() * 4);
		if(ret == 0) return 1;
		else if(ret == 1) return 2;
		else if(ret == 2) return 4;
		else if(ret == 3) return 8;
		return 0;
	};

	let _getMorphology = function(detritus)
	{
		if(detritus == 0)
		{
			return Morphology.Razed;
		}
		else if(detritus <= 1)
		{
			return Morphology.Clear;
		}
		else if(detritus <= 2)
		{
			return Morphology.Rough;
		}
		else if(detritus <= 4)
		{
			return Morphology.Impervious;
		}
		else if(detritus <= 8)
		{
			return Morphology.Inaccessible;
		}
		else
		{
			return Morphology.Undiscovery;
		}
	};

	let _getLayer = function(selectedLayer)
	{
		selectedLayer = selectedLayer || layer;
		switch(selectedLayer)
		{
			case TerrainLayer.Surface:
				return surface;
			case TerrainLayer.Underground:
				return underground;
			case TerrainLayer.Deep:
				return deep;
			default:
				return surface;
		}
	};

	let _getTerrainImageId = function(x, y)
	{
		let detritus = _getLayer()[x][y];
		if(detritus < 9)
		{
			return "Terrain_" + typology + "_" + layer + "_" + _getMorphology(detritus);
		}
		return null;
	};

	let _addResource = function(resourceType, position)
	{
		let val = PrototypeLib.createResource(resourceType, position);
		_addObject(structure, val);
		if(val.getLayer() == TerrainLayer.Surface)
		{
			_getLayer(val.getLayer())[position.x][position.y] = 0;
		}
	};

	let _addBuilding = function(buildingType, position, alreadyBuilt)
	{
		let placed = true;
		let newBuilding = PrototypeLib.createBuilding(buildingType, position, alreadyBuilt);
		let eventBeginBuilding = PrototypeLib.get(buildingType).eventBeginBuilding;
		if(eventBeginBuilding != undefined)
		{
			placed = eventBeginBuilding(newBuilding, this);
		}

		if(placed)
		{
			_addObject(structure, newBuilding);
			_getLayer(newBuilding.getLayer())[position.x][position.y] = 0;
			return newBuilding;
		}
		return null;
	};

	let _addPipe = function(pipeType, layer, position, alreadyBuilt)
	{
		let val = PrototypeLib.createPipe(pipeType, layer, position, alreadyBuilt);
		_addObject(structure, val);
		_getLayer(layer)[position.x][position.y] = 0;
	};

	let _addObject = function(array, val)
	{
		let valPosition = val.getPosition();
		for(let i = 0; i < array.length; i++)
		{
			let arrayPosition = array[i].getPosition();
			if((arrayPosition.x == valPosition.x) && (arrayPosition.y == valPosition.y))
			{
				if(array[i].getType() == StructureTypes.Resource)
				{
					array.splice(i, 0, val);
					return;
				}
			}
			else if((arrayPosition.x < valPosition.x) ||
				((arrayPosition.x == valPosition.x) && (arrayPosition.y > valPosition.y)))
			{
				array.splice(i, 0, val);
				return;
			}
		}
		array.push(val);
	};

	let _delBuilding = function(position, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		for(let i = 0; i < structure.length; i++)
		{
			if(structure[i].getType() == StructureTypes.Building)
			{
				let arrayPosition = structure[i].getPosition();
				if((arrayPosition.x == position.x) &&
					(arrayPosition.y == position.y) &&
					(structure[i].getLayer() == selectedLayer))
				{
					structure[i].destroy();
					structure.splice(i, 1);
					return;
				}
			}
		}
	};

	let _isVisible = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		return (_getLayer(selectedLayer)[point.x][point.y] < 9);
	};

	let _getNearTiles = function(point)
	{	
		let ret = [];
		if(point.y > 0)
		{
			if(point.x > 0)
			{
				// 1
				ret.push({ x: point.x - 1, y: point.y - 1 });
			}
			// 2
			ret.push({ x: point.x, y: point.y - 1 });
			if(point.x < size.x - 1)
			{
				// 3
				ret.push({ x: point.x + 1, y: point.y - 1 });
			}
		}

		if(point.x < size.x - 1)
		{
			// 4
			ret.push({ x: point.x + 1, y: point.y });
		}

		if(point.y < size.y - 1)
		{
			if(point.x < size.x - 1)
			{
				// 5
				ret.push({ x: point.x + 1, y: point.y + 1 });
			}
			// 6
			ret.push({ x: point.x, y: point.y + 1 });
			if(point.x > 0)
			{
				// 7
				ret.push({ x: point.x - 1, y: point.y + 1 });
			}
		}

		if(point.x > 0)
		{
			// 8
			ret.push({ x: point.x - 1, y: point.y });
		}

		return ret;
	};

	let _isDiggable = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		let tiles = _getNearTiles(point);
		for(let i = 0; i < tiles.length; i++)
		{
			if(_getLayer(selectedLayer)[tiles[i].x][tiles[i].y] >= 9)
			{
				return true;
			}
		}
		return false;
	};

	let _discoveryTile = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		if(_getLayer(selectedLayer)[point.x][point.y] >= 9)
		{
			let resource = _findResource(point, selectedLayer);
			if(resource != null)
			{
				state.addKnowledge({ discovery: [resource.getBuildingType()] });
				_getLayer(selectedLayer)[point.x][point.y] = 0;
			}
			else
			{
				_getLayer(selectedLayer)[point.x][point.y] = _randomMorphology();
			}
		}
	};

	let _discoveryNearTiles = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		let nearTiles = _getNearTiles(point);
		for(let i = 0; i < nearTiles.length; i++)
		{
			if(!_isVisible(nearTiles[i], selectedLayer))
			{
				_discoveryTile(nearTiles[i], selectedLayer);
			}
		}
	};

	let _dig = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		let tiles = _getNearTiles(point);
		let onlyCheck = false;
		for(let i = 0; i < tiles.length; i++)
		{
			let detritus = _getLayer(selectedLayer)[tiles[i].x][tiles[i].y];
			if(detritus >= 9)
			{
				if(!onlyCheck)
				{
					onlyCheck = true;

					detritus--;
					if(detritus < 9)
					{
						_discoveryTile(tiles[i], selectedLayer);
					}
					else
					{
						_getLayer(selectedLayer)[tiles[i].x][tiles[i].y] = detritus;
						return false;
					}
				}
				else
				{
					return false;
				}
			}
		}
		return true;
	};

	let _isRazable = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		let detritus = _getLayer(selectedLayer)[point.x][point.y];
		return ((detritus > 0) && (detritus < 9));
	};

	let _raze = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		let detritus = _getLayer(selectedLayer)[point.x][point.y];
		if((detritus > 0) && (detritus < 9))
		{
			detritus -= 1;
			_getLayer(selectedLayer)[point.x][point.y] = detritus;
		}
		return detritus;
	};

	let _findBuilding = function(position, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		for (let i = 0; i < structure.length; i++)
		{
			if((structure[i].getLayer() == selectedLayer) &&
				(structure[i].getPosition().x == position.x) &&
				(structure[i].getPosition().y == position.y) &&
				(structure[i].getType() == StructureTypes.Building))
			{
				return structure[i];
			}
		}
		return null;
	};

	let _findResource = function(position, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		for (let i = 0; i < structure.length; i++)
		{
			if((structure[i].getLayer() == selectedLayer) &&
				(structure[i].getPosition().x == position.x) &&
				(structure[i].getPosition().y == position.y) &&
				(structure[i].getType() == StructureTypes.Resource ))
			{
				return structure[i];
			}
		}
		return null;
	};

	let _addRoboDozer = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		let val = new Robot(RobotTypes.Dozer, selectedLayer, point);
		_addObject(structure, val);
	};

	let _addRoboDigger = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		let val = new Robot(RobotTypes.Digger, selectedLayer, point);
		_addObject(structure, val);
	};

	let _getRobot = function(point, selectedLayer)
	{
		selectedLayer = selectedLayer || layer;

		for(let i = 0; i < structure.length; i++)
		{
			if((structure[i].getPosition().x == point.x) &&
				(structure[i].getPosition().y == point.y) &&
				(structure[i].getLayer() == selectedLayer) &&
				(structure[i].getType() == StructureTypes.Robot))
			{
				return structure[i];
			}
		}

		return null;
	};

	let _addToGraph = function(list, el)
	{
		list.push(el);

		if((el.isPipe()) && (el.haveUp() || el.haveDown()))
		{
			if(list.elevators == undefined)
			{
				list.elevators = [];
			}
			list.elevators.push(el);
		}
	};

	let _getGraph = function()
	{
		let data = {};
		data[TerrainLayer.Surface] = [];
		data[TerrainLayer.Underground] = [];
		data[TerrainLayer.Deep] = [];
		for (let elIndex = 0; elIndex < structure.length; elIndex++)
		{
			let el = structure[elIndex];
			if((el.getType() == StructureTypes.Building) && (el.isPipe()))
			{
				data[el.getLayer()].push(el);
			}
		}

		let upper = _getGraphInternal(_getGraphLayer(data[TerrainLayer.Underground]), _getGraphLayer(data[TerrainLayer.Deep]));    	
		let graphList = _getGraphInternal(_getGraphLayer(data[TerrainLayer.Surface]), upper);

		let tmpRet = _getGraphBoundBildings(graphList, structure);

		// conversione da array a object
		let ret = [];
		for (let i = 0; i < tmpRet.length; i++)
		{
			let retItem = new BuildingGraph();
			for (let ii = 0; ii < tmpRet[i].length; ii++)
			{
				let buildingType = tmpRet[i][ii].getBuildingType();
				if(retItem[buildingType] == null)
				{
					retItem[buildingType] = [];
				}
				retItem[buildingType].push(tmpRet[i][ii]);
			}
			ret.push(retItem);
		}
		return ret;
	};

	let _getGraphBoundBildings = function (graphList, structure)
	{
		let ret = [];
		let orphans = [];
		let added;
		let i, ii;
		for(i = 0; i < graphList.length; i++)
		{
			added = false;
			for(ii = 0; ii < graphList[i].length; ii++)
			{
				if(graphList[i][ii].isHeadquarter)
				{
					ret.push(graphList[i]);
					added = true;
					break;
				}
			}
			if(added == false)
			{
				orphans.push(graphList[i]);
			}
		}
		let orphan = null;
		if(orphans.length > 0)
		{
			orphan = orphans[0];
			for(i = 1; i < orphans.length; i++)
			{
				for(ii = 0; ii < orphans[i].length; ii++)
				{
					orphan.push(orphans[i][ii]);
				}
			}
		}
		else
		{
			orphan = [];
		}

		// assegno gli edifici ai grafi
		for (let elIndex = 0; elIndex < structure.length; elIndex++)
		{
			let el = structure[elIndex];
			if((el.getType() == StructureTypes.Building) && (!el.isPipe()))
			{
				for(i = 0; i < ret.length; i++)
				{
					if(_getGraphIsBound(ret[i], el.getPosition(), el.getLayer()))
					{
						ret[i].push(el);
						el = null;
						break;
					}
				}
				if(el != null)
				{
					orphan.push(el);
				}
			}
		}
		if(orphan.length > 0)
		{
			ret.push(orphan);
		}
		return ret;
	};

	// restituisce true se il grafo permette il collegamento verso le coordinate point
	let _getGraphIsBound = function(graph, point, layer)
	{
		for(let i = 0; i < graph.length; i++)
		{
			if(!graph[i].isPipe())
			{
				// nei grafi sono presenti i tubi poi in fondo gli edifici
				break;
			}
			else
			{
				if(graph[i].getLayer() == layer)
				{
					let pos = graph[i].getPosition();
					if(pos.x == point.x)
					{
						if(((pos.y == point.y -1) && (graph[i].haveEast())) ||
							((pos.y == point.y +1) && (graph[i].haveWest())))
						{
							return true;
						}
					}
					else if (pos.y == point.y)
					{
						if(((pos.x == point.x -1) && (graph[i].haveSouth())) ||
							((pos.x == point.x +1) && (graph[i].haveNorth())))
						{
							return true;
						}
					}
				}
			}
		}
		return false;
	};

	let _getGraphInternal = function(upper, lower)
	{
		for(let i = 0; i < lower.length; i++)
		{
			let rootGraph = null;
			if(lower[i].elevators != undefined)
			{
				for(let ii = 0; ii < lower[i].elevators.length; ii++)
				{
					let elevator = lower[i].elevators[ii];
					if(elevator.haveUp() && !elevator.isDestroyed())
					{
						let iii;
						let upperGraph = _getGraphFind(upper, elevator.getPosition());
						if(rootGraph != null)
						{
							if(rootGraph != upperGraph)
							{
								// merge nodi di upperGraph
								for(iii = 0; iii < upperGraph.length; iii++)
								{
									_addToGraph(rootGraph, upperGraph[iii]);
								}
								upper.splice(upper.indexOf(upperGraph), 1); // remove
							}
						}
						else
						{
							rootGraph = upperGraph;
							// merge nodi di lower
							for(iii = 0; iii < lower[i].length; iii++)
							{
								rootGraph.push(lower[i][iii]);
							}
						}
					}
				}
			}
			else
			{
				upper.push(lower[i]);
			}
		}
		return upper;
	};

	let _getGraphFind = function(upper, position)
	{
		for(let i = 0; i < upper.length; i++)
		{
			if(upper[i].elevators != undefined)
			{
				for(let ii = 0; ii < upper[i].elevators.length; ii++)
				{
					let elevator = upper[i].elevators[ii];
					if(elevator.haveDown())
					{
						if((elevator.getPosition().x == position.x) &&
							(elevator.getPosition().y == position.y))
						{
							return upper[i];
						}
					}
				}
			}
		}
		return null;
	};

	let _getGraphLayer = function(pipes)
	{
		let a = null;
		let ay = -1;

		let b = [];
		let b1 = [];

		// lista di grafi
		let ret = [];

		let d = null;
		let e = [];
		let e1 = [];

		let x = 0;
		let l = null;

		let elementPosition;
		for (let elementIndex = 0; elementIndex < pipes.length; elementIndex++)
		{
			let element = pipes[elementIndex];

			elementPosition = element.getPosition();
			if (x > elementPosition.x)
			{
				a = null;
				ay = -1;
				d = null;
				if (x == elementPosition.x + 1)
				{
					b = b1;
					e = e1;
				}
				else
				{
					b = [];
					e = [];
				}
				b1 = [];
				e1 = [];
			}
			x = elementPosition.x;

			// Gestione tubi
			l = null;
			if (element.haveWest() && a != null && ay == elementPosition.y - 1)
			{
				l = a;
			}
			if (element.haveNorth() && b[elementPosition.y] != null)
			{
				if ((l != null) && (b[elementPosition.y] != a))
				{
					let tmp = b[elementPosition.y];
					let i;
					for(i = 0; i < a.length; i++)
					{
						_addToGraph(tmp, a[i]);
					}
					ret.splice(ret.indexOf(a), 1); // remove
					for(i = 0; i < b1.length; i++)
					{
						if(b1[i] == a)
						{
							b1[i] = tmp;
						}
					}
				}
				l = b[elementPosition.y];
			}
			else if(l == null)
			{
				l = [];
				ret.push(l);
			}
			_addToGraph(l, element);

			a = null;
			ay = -1;
			if (element.haveEast())
			{
				a = l;
				ay = elementPosition.y;
			}
			if (element.haveSouth())
			{
				b1[elementPosition.y] = l;
			}

			if (element.haveWest() && d != null && d.getPosition().y == elementPosition.y - 1)
			{
				_addToGraph(l, d);
				e1[d.getPosition().y] = null;
			}
			d = null;
			if (element.haveNorth() && e[elementPosition.y] != null)
			{
				_addToGraph(l, e[elementPosition.y]);
			}
			e[elementPosition.y] = null;
		}
		return ret;
	};

	let _computation = function()
	{
		let en = new Engine();
		let tmp = _getGraph();
		en.computation(state, tmp, this);
		state.setDate(state.getDate() + 1);

		_simulation();
	};

	let _simulation = function()
	{
		let en = new Engine();
		let tmp = _getGraph();
		en.simulation(state, tmp);
	};

	//-----------------------------------------

	this.getSize = function() { return size; };
	this.getLayer = function() { return layer; };
	this.setLayer = function(newLayer) { layer = newLayer; };
	this.getStructure = function() { return structure; };
	this.getState = function() { return state; };

	this.getTerrainImageId = _getTerrainImageId;
	this.addResource = _addResource;
	this.addBuilding = _addBuilding;
	this.delBuilding = _delBuilding;
	this.addPipe = _addPipe;
	this.isVisible = _isVisible;
	this.getNearTiles = _getNearTiles;
	this.isDiggable = _isDiggable;
	this.dig = _dig;
	this.discoveryTile = _discoveryTile;
	this.discoveryNearTiles = _discoveryNearTiles;
	this.isRazable = _isRazable;
	this.raze = _raze;
	this.findBuilding = _findBuilding;
	this.findResource = _findResource;
	this.getGraph = _getGraph;

	this.addRoboDozer = _addRoboDozer;
	this.addRoboDigger = _addRoboDigger;
	this.getRobot = _getRobot;

	this.computation = _computation;
	this.simulation = _simulation;

	//-----------------------------------------
	_initialize();
}

function Building(buildingType, terrainLayer, position, buildingTime, builder)
{
	const MAX_INTEGRITY = 1000;

	//let buildingType = buildingType;
	//let position = position;
	let layer = terrainLayer;
	let integrity = MAX_INTEGRITY;
	let progressState = - (buildingTime || 0);
	let frozen = false;
	//let owner = null;

	//var	builder = builder;
	if(builder == undefined)
	{
		builder = "Building_" + layer;
	}

	let _progress = function()
	{
		if(!frozen && progressState >= 0)
		{
			progressState++;
		}
	};

	let _progressBuild = function()
	{
		if(!frozen && progressState < 0)
		{
			progressState++;
		}
		return (progressState == 0);
	};

	let _damage = function(value)
	{
		if(!frozen)
		{
			if(integrity > 0)
			{
				integrity -= value;
			}
			if(integrity <= 0)
			{
				_destroy();
			}
		}
		return integrity;
	};

	let _destroy = function()
	{
		integrity = 0;
	};

	let _isDestroyed = function()
	{
		return (integrity == 0);
	};

	let _reapair = function(value)
	{
		if(integrity > 0)
		{
			integrity += value;
		}

		if(integrity > MAX_INTEGRITY)
		{
			integrity = MAX_INTEGRITY;
		}
		return integrity;
	};

	let _underConstruction = function()
	{
		return (progressState < 0);
	};

	let _setBuilded = function()
	{
		progressState = 0;
	};

	let _isOperative = function()
	{
		return (progressState >= 0) && (integrity > 0);
	};

	let _getImageId = function()
	{
		if(_isDestroyed())
		{
			return "Ruins_" + layer;
		}
		else if(_underConstruction())
		{
			return builder;
		}
		else
		{
			return buildingType.toString();
		}
	};

	//-----------------------------------------

	this.getBuildingType = function() { return buildingType; };
	this.getPosition = function() { return position; };
	this.getLayer = function() { return layer; };
	this.getIntegrity = function() { return integrity; };
	this.getProgressState = function() { return progressState; };
	this.getFrozen = function() { return frozen; };
	this.setFrozen = function(value) { frozen = value; return this; };
	//this.getOwner = function() { return owner; };

	this.progress = _progress;
	this.progressBuild = _progressBuild;
	this.damage = _damage;
	this.destroy = _destroy;
	this.isDestroyed = _isDestroyed;
	this.reapair = _reapair;
	this.underConstruction = _underConstruction;
	this.setBuilded = _setBuilded;
	this.isOperative = _isOperative;
	this.getImageId = _getImageId;

	this.isPipe = function() { return false; };
	this.getType = function() { return StructureTypes.Building; };

	//-----------------------------------------
}

let PipeType = {
	NorthEastSouthWest: "nesw",
	NorthSouth: "ns",
	EastWest: "ew",
	Up: "u",
	Down: "d"
};

function Pipe(pipeType, layer, position, buildingTime)
{
	Building.call(this, "Pipe_" + pipeType + "_" + layer, layer, position, buildingTime);

	//let pipeType = pipeType;

	this.isPipe = function() { return true; };

	this.haveNorth = function() { return (pipeType != PipeType.EastWest); };
	this.haveSouth = function() { return (pipeType != PipeType.EastWest); };
	this.haveEast  = function() { return (pipeType != PipeType.NorthSouth); };
	this.haveWest  = function() { return (pipeType != PipeType.NorthSouth); };
	this.haveUp    = function() { return (pipeType == PipeType.Up); };
	this.haveDown  = function() { return (pipeType == PipeType.Down); };
}
Pipe.inherits(Building);

let RobotTypes = {
	Dozer: "RoboDozer",
	Digger: "RoboDigger",
	Miner: "RoboMiner"
};

function Resource(resourceType, layer, color, position)
{
	Building.call(this, "Resource_" + resourceType, layer, position, 0);

	this.getType = function() { return StructureTypes.Resource; };

	this.getResourceType = function() { return resourceType; };

	this.getColor = function() {return color; };
}
Resource.inherits(Building);

function Robot(robotType, layer, position)
{
	Building.call(this, robotType, layer, position, 0);

	this.getRobotType = function() { return robotType; };

	this.getType = function() { return StructureTypes.Robot; };

	this.getImageId = function() { return this.getBuildingType().toString(); };
}
Robot.inherits(Building);

function BuildingGraph()
{
	/** @param {BuildingGraph} graph */
	BuildingGraph.countAll = function(graph)
	{
		let ret = 0;
		for(let buildingType in graph)
		{
			if(graph.hasOwnProperty(buildingType))
			{
				ret += graph[buildingType].length;
			}
		}
		return ret;
	};

	/** @param {BuildingGraph} graph */
	BuildingGraph.countPipes = function(graph)
	{
		let ret = 0;
		for(let buildingType in graph)
		{
			if(graph.hasOwnProperty(buildingType))
			{
				if(graph[buildingType][0].isPipe())
				{
					ret += graph[buildingType].length;
				}
			}
		}
		return ret;
	};

	/** @param {BuildingGraph} graph */
	BuildingGraph.getHeadquarter = function(graph)
	{
		for(let buildingType in graph)
		{
			if(graph.hasOwnProperty(buildingType))
			{
				if(graph[buildingType][0].isHeadquarter)
				{
					return graph[buildingType][0];
				}
			}
		}
		return null;
	};

	/** @param {BuildingGraph} graph */
	BuildingGraph.hasHeadquarter = function(graph)
	{
		return (BuildingGraph.getHeadquarter(graph) != null);
	};
}