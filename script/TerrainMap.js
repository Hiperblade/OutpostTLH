	var Typology = {
		Vulcanic: "vulcanic",
		Asteroid: "asteroid",
		Ice: "ice",
		Desert: "desert",
		Jungle: "jungle",
		Rock: "rock",
		Stone: "stone"
	};
	
	var TerrainLayer = {
		Surface: "surface",
		Underground: "underground",
		Deep: "deep"
	};
	
	var Morphology = {
		Razed: "razed",
		Clear: "clear",
		Rough: "rough",
		Impervious: "impervious",
		Inaccessible: "inaccessible",
		Undiscovery: "undiscovered"
	};

	var StructureTypes = {
		Resource: "resource",
		Building: "building",
		Robot: "robot"
	};
	
	function TerrainMap(terrainTypology, size)
	{
		var typology = terrainTypology;
		var layer = TerrainLayer.Surface;
		var surface = new Array();
		var underground = new Array();
		var deep = new Array();
		var structure = new Array();
		var state = new ColonyState();
		
		var _initialize = function()
		{
			var x, y;
			for(x = 0; x < size.x; x++)
			{
				surface[x] = new Array();
				underground[x] = new Array();
				deep[x] = new Array();
				for(y = 0; y < size.y; y++)
				{
					surface[x][y] = _randomMorphology();
					underground[x][y] = 9;
					deep[x][y] = 9;
					//debug: underground[x][y] = _randomMorphology();
					//debug: deep[x][y] = _randomMorphology();
				}
			}
		}
		
		var _randomMorphology = function()
		{
			var ret = Math.floor(Math.random() * 4);
			if(ret == 0) return 1;
			else if(ret == 1) return 2;
			else if(ret == 2) return 4;
			else if(ret == 3) return 8;
		}
		
		var _getMorphology = function(detritus)
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
		}

		var _getLayer = function(selectedLayer)
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
			}
		}
		
		var _getTerrainImageId = function(x, y)
		{
			var detritus = _getLayer()[x][y];
			if(detritus < 9)
			{
				return "Terrain_" + typology + "_" + layer + "_" + _getMorphology(detritus);
			}
			return null;
		}	
		
		var _addResource = function(resourceType, position)
		{
			var val = PrototypeLib.createResource(resourceType, position);
			_addObject(structure, val);
			if(val.getLayer() == TerrainLayer.Surface)
			{
				_getLayer(val.getLayer())[position.x][position.y] = 0;
			}
		}
		
		var _addBuilding = function(buildingType, position, alreadyBuilt)
		{
			var placed = true;
			var newBuilding = PrototypeLib.create(buildingType, position, alreadyBuilt);
			var eventBeginBuilding = PrototypeLib.get(buildingType).eventBeginBuilding;
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
		}
		
		var _addPipe = function(pipeType, layer, position, alreadyBuilt)
		{
			var val = PrototypeLib.createPipe(pipeType, layer, position, alreadyBuilt);
			_addObject(structure, val);
			_getLayer(layer)[position.x][position.y] = 0;
		}

		var _addObject = function(array, val)
		{
			var valPosition = val.getPosition();
			for(var i = 0; i < array.length; i++)
			{
				var arrayPosition = array[i].getPosition();
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
		}

		var _delBuilding = function(position, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			for(var i = 0; i < structure.length; i++)
			{
				if(structure[i].getType() == StructureTypes.Building)
				{
					var arrayPosition = structure[i].getPosition();
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
		}
		
		var _isVisible = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			return (_getLayer(selectedLayer)[point.x][point.y] < 9);
		}

		var _getNearTiles = function(point)
		{	
			var ret = new Array();
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
		}
		
		var _isDiggable = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			var tiles = _getNearTiles(point);
			for(var i = 0; i < tiles.length; i++)
			{
				if(_getLayer(selectedLayer)[tiles[i].x][tiles[i].y] >= 9)
				{
					return true;
				}
			}
			return false;
		}
		
		var _discoveryTile = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			if(_getLayer(selectedLayer)[point.x][point.y] >= 9)
			{
				var resource = _findResource(point, selectedLayer);
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
		}
		
		var _discoveryNearTiles = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			var nearTiles = _getNearTiles(point, selectedLayer);
			for(var i = 0; i < nearTiles.length; i++)
			{
				if(!_isVisible(nearTiles[i], selectedLayer))
				{
					_discoveryTile(nearTiles[i], selectedLayer);
				}
			}
		}
		
		var _dig = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			var tiles = _getNearTiles(point);
			var onlyCheck = false;
			for(var i = 0; i < tiles.length; i++)
			{
				var detritus = _getLayer(selectedLayer)[tiles[i].x][tiles[i].y];
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
		}
		
		var _isRazable = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			var detritus = _getLayer(selectedLayer)[point.x][point.y];
			return ((detritus > 0) && (detritus < 9));
		}
		
		var _raze = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			var detritus = _getLayer(selectedLayer)[point.x][point.y];
			if((detritus > 0) && (detritus < 9))
			{
				detritus -= 1;
				_getLayer(selectedLayer)[point.x][point.y] = detritus;
			}
			return detritus;
		}
		
		var _findBuilding = function(position, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			for (var i = 0; i < structure.length; i++)
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
		}
		
		var _findResource = function(position, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			for (var i = 0; i < structure.length; i++)
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
		}

		var _addRoboDozer = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;

			var val = new Robot(RobotTypes.Dozer, selectedLayer, point);
			_addObject(structure, val);
		}
		
		var _addRoboDigger = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;

			var val = new Robot(RobotTypes.Digger, selectedLayer, point);
			_addObject(structure, val);
		}
		
		var _getRobot = function(point, selectedLayer)
		{
			selectedLayer = selectedLayer || layer;
			
			for(var i = 0; i < structure.lenght; i++)
			{
				if((structure[i].x == point.x) &&
					(structure[i].y == point.y) &&
					(structure[i].layer == selectedLayer) &&
					(structure[i].getType == StructureTypes.Robot))
				{
					return structure[i];
				}
			}
			
			return null;
		}
		
		var _addToGraph = function(list, el)
		{
			list.push(el);
			
			if((el.isPipe()) && (el.haveUp() || el.haveDown()))
			{
				if(list.elevators == undefined)
				{
					list.elevators = new Array();
				}
				list.elevators.push(el);
			}
		}

		var _getGraph = function()
		{
			var data = {};
			data[TerrainLayer.Surface] = new Array();
			data[TerrainLayer.Underground] = new Array();
			data[TerrainLayer.Deep] = new Array();	
			for (var elIndex = 0; elIndex < structure.length; elIndex++)
			{
				if(structure[elIndex].getType() == StructureTypes.Building)
				{
					var el = structure[elIndex];
					data[el.getLayer()].push(el);
				}
			}
    	
			var upper = _getGraphInternal(_getLayerGraph(data[TerrainLayer.Underground]), _getLayerGraph(data[TerrainLayer.Deep]));    	
			var tmp = _getGraphInternal(_getLayerGraph(data[TerrainLayer.Surface]), upper);
			
			var ret = new Array();
			for (var i = 0; i < tmp.length; i++)
			{
				var retItem = {};
				for (var ii = 0; ii < tmp[i].length; ii++)
				{
					var buildingType = tmp[i][ii].getBuildingType();
					if(retItem[buildingType] == null)
					{
						retItem[buildingType] = new Array();
					}
					retItem[buildingType].push(tmp[i][ii]);
				}
				ret.push(retItem);
			}
			return ret;
		}
    
		var _getGraphInternal = function(upper, lower)
		{
			for(var i = 0; i < lower.length; i++)
			{
				var rootGraph = null;
				if(lower[i].elevators != undefined)
				{
					for(var ii = 0; ii < lower[i].elevators.length; ii++)
					{
						var elevator = lower[i].elevators[ii];
						if(elevator.haveUp())
						{
							var upperGraph = _findGraphInternal(upper, elevator.getPosition());
							if(rootGraph != null)
							{
								if(rootGraph != upperGraph)
								{
									// merge nodi di upperGraph
									for(var iii = 0; iii < upperGraph.length; iii++)
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
								for(var iii = 0; iii < lower[i].length; iii++)
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
		}
    
		var _findGraphInternal = function(upper, position)
		{
			for(var i = 0; i < upper.length; i++)
			{
				if(upper[i].elevators != undefined)
				{
					for(var ii = 0; ii < upper[i].elevators.length; ii++)
					{
						var elevator = upper[i].elevators[ii];
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
		}
		
		var _getLayerGraph = function(buildings)
		{
			var a = null;
			var ay = -1;

			var b = new Array();
			var b1 = new Array();
		 
			// lista di grafi
			var c = new Array();

			var d = null;
			var e = new Array();
			var e1 = new Array();

			// orfani
			var f = new Array();

			var x = 0;
			var l = null;
		  
			for (var elIndex = 0; elIndex < buildings.length; elIndex++)
			{
				var el = buildings[elIndex];
				elPosition = el.getPosition();
				
				if (x > elPosition.x)
				{
					a = null;
					ay = -1;
					d = null;
					if (x == elPosition.x + 1)
					{
						b = b1;
						e = e1;
					}
					else
					{
						// Gestione orfani di E
						for(var tmp in e)
						{
							//_addToGraph(f, tmp);
							f.push(tmp);
						}
						b = new Array();
						e = new Array();
					}
					b1 = new Array();
					e1 = new Array();
				}
				x = elPosition.x;

				if (el.isPipe())
				{
					l = null;
					if (el.haveWest() && a != null && ay == elPosition.y - 1)
					{
						l = a;
					}
					if (el.haveNorth() && b[elPosition.y] != null)
					{
						if ((l != null) && (b[elPosition.y] != a))
						{
							var tmp = b[elPosition.y];
							for(var i = 0; i < a.length; i++)
							{
								_addToGraph(tmp, a[i]);
							}
							c.splice(c.indexOf(a), 1); // remove
							for(var i = 0; i < b1.length; i++)
							{
								if(b1[i] == a)
								{
									b1[i] = tmp;
								}
							}
						}
						l = b[elPosition.y];
					}
					else if(l == null)
					{
						l = new Array();
						c.push(l);
					}
					_addToGraph(l, el);

					a = null;
					ay = -1;
					if (el.haveEast())
					{
						a = l;
						ay = elPosition.y;
					}
					if (el.haveSouth())
					{
						b1[elPosition.y] = l;
					}

					if (el.haveWest() && d != null && d.getPosition().y == elPosition.y - 1)
					{
//alert("d => " + l.length);
						_addToGraph(l, d);
						e1[d.getPosition().y] = null;
					}
					d = null;
					if (el.haveNorth() && e[elPosition.y] != null)
					{
//alert("e => " + l.length);
						_addToGraph(l, e[elPosition.y]);
					}
					e[elPosition.y] = null;
				}
				else
				{
					if (a != null && ay == elPosition.y - 1)
					{
//alert("a => " + a.length);
					_addToGraph(a, el);
					a = null;
					ay = -1;
					}
					else if (b[elPosition.y] != null)
					{
//alert("b => " + b[elPosition.y].length);
						_addToGraph(b[elPosition.y], el);
					}
					else
					{
//alert("c => ");
					d = el;
					e1[elPosition.y] = el;
					}
				}
			}
			return c;
		}
		
		var _computation = function()
		{
			var en = new Engine();
			var tmp = _getGraph();
			for(var i = 0; i < tmp.length; i++)
			{
				en.computation(state, tmp[i], this);
			}
			state.setDate(state.getDate() + 1);
			
			_simulation();
		}
		
		var _simulation = function()
		{
			var en = new Engine();
			var tmp = _getGraph();
			for(var i = 0; i < tmp.length; i++)
			{
				en.simulation(state, tmp[i]);
			}
		}
		
		//-----------------------------------------
		
		this.getSize = function() { return size; }
		this.getLayer = function() { return layer; }
		this.setLayer = function(newLayer) { layer = newLayer; }
		this.getStructure = function() { return structure; }
		this.getState = function() { return state; }
		
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
		
		var buildingType = buildingType;
		var position = position;
		var layer = terrainLayer;
		var integrity = MAX_INTEGRITY;
		var progressState = - (buildingTime || 0);
		var frozen = false;
		var owner = null;
		
		var	builder = builder;	
		if(builder == undefined)
		{
			builder = "Building_" + layer;
		}
		
		var _progress = function()
		{
			if(!frozen && progressState >= 0)
			{
				progressState++;
			}
		}
		
		var _progressBuild = function()
		{
			if(progressState < 0)
			{
				progressState++;
			}
			return (progressState == 0);
		}

		var _damage = function(value)
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
		}
		
		var _destroy = function()
		{
			integrity = 0;
		}
		
		var _isDestroyed = function()
		{
			return (integrity == 0);
		}

		var _reapair = function(value)
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
		}

		var _underConstruction = function()
		{
			return (progressState < 0);
		}
		
		var _setBuilded = function()
		{
			progressState = 0;
		}
		
		var _isOperative = function()
		{
			return (progressState >= 0) && (integrity > 0);
		}
		
		var _getImageId = function()
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
		}
		
		//-----------------------------------------
		
		this.getBuildingType = function() { return buildingType; }
		this.getPosition = function() { return position; }
		this.getLayer = function() { return layer; }
		this.getIntegrity = function() { return integrity; }
		//this.getProgressState = function() { return progressState; }
		this.getFrozen = function() { return frozen; }
		this.setFrozen = function(value) { return frozen = value; }
		//this.getOwner = function() { return owner; }
		
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
		
		this.isPipe = function() { return false; }
		this.getType = function() { return StructureTypes.Building; }
		
		//-----------------------------------------
	}
	
	var PipeType = {
		NorthEastSouthWest: "nesw",
		NorthSouth: "ns",
		EastWest: "ew",
		Up: "u",
		Down: "d"
	};
	
	function Pipe(pipeType, layer, position, buildingTime)
	{
		Building.call(this, "Pipe_" + pipeType + "_" + layer, layer, position, buildingTime);
		
		var pipeType = pipeType;
		
		this.isPipe = function() { return true; }
		
		this.haveNorth = function() { return (pipeType != PipeType.EastWest); }
		this.haveSouth = function() { return (pipeType != PipeType.EastWest); }
		this.haveEast  = function() { return (pipeType != PipeType.NorthSouth); }
		this.haveWest  = function() { return (pipeType != PipeType.NorthSouth); }
		this.haveUp    = function() { return (pipeType == PipeType.Up); }
		this.haveDown  = function() { return (pipeType == PipeType.Down); }
	}
	Pipe.inherits(Building);
	
	var RobotTypes = {
		Dozer: "RoboDozer",
		Digger: "RoboDigger",
		Miner: "RoboMiner"
	};
	
	function Resource(resourceType, layer, position)
	{
		Building.call(this, "Resource_" + resourceType, layer, position, 0);
		
		this.getType = function() { return StructureTypes.Resource; }
		
		this.getResourceType = function() { return resourceType; }
	}
	Resource.inherits(Building);
	
	function Robot(robotType, layer, position)
	{
		Building.call(this, robotType, layer, position, 0);
		
		this.getRobotType = function() { return robotType; }
		
		this.getType = function() { return StructureTypes.Robot; }
		
		this.getImageId = function() { return this.getBuildingType().toString(); }
	}
	Robot.inherits(Building);