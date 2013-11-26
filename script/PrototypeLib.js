	var AreaTypes = {
		One: "1",
		TwoEast: "2e",
		TwoWest: "2w",
		Four: "4"
	};
	
	function PrototypeLibConstructor()
	{	
		var list = {};
		
		var priorityList = [];
		
		var _addPipe = function(pipeType, terrainLayer, buildingTime, buildingCost, parameters)
		{
			var buildingType = "Pipe_" + pipeType + "_" + terrainLayer;
			var item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
			item.createItem = function(position)
			{
				return new Pipe(pipeType, terrainLayer, position, buildingTime);
			};
			list[buildingType] = item;
			priorityList.push(buildingType);
			return item;
		};

		var _add = function(buildingType, terrainLayer, buildingTime, buildingCost, parameters)
		{
			var item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
			list[buildingType] = item;
			priorityList.push(buildingType);
			return item;
		};
		
		var _addResource = function(resourceType, terrainLayer)
		{
			var buildingType = "Resource_" + resourceType;
			var item = new BasePrototype(buildingType, terrainLayer, 0, {}, {});
			item.createItem = function(position)
			{
				return new Resource(resourceType, terrainLayer, position);
			};
			list[buildingType] = item;
			//priorityList.push(buildingType);
			return item;
		};
		
		var _addMine = function(resourceType, terrainLayer, buildingTime, buildingCost, parameters)
		{
			var buildingType = "Mine" + resourceType;
			var item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
			item.createItem = function(position)
			{
				return new Building(buildingType, terrainLayer, position, buildingTime, "RoboMiner");
			};
			list[buildingType] = item;
			priorityList.push(buildingType);
			return item;
		};

		var _get = function(buildingType)
		{
			return list[buildingType];
		};

		var _createBuilding = function(buildingType, position, alreadyBuilt)
		{
			var ret = list[buildingType].createItem(position);
			if(alreadyBuilt)
			{
				ret.setBuilded();
			}
			return ret;
		};
		
		var _createPipe = function(pipeType, layer, position, alreadyBuilt)
		{
			return _createBuilding("Pipe_" + pipeType + "_" + layer, position, alreadyBuilt);
		};
		
		var _createResource = function(resourceType, position)
		{
			return list["Resource_" + resourceType].createItem(position);
		};
		
		this.addPipe = _addPipe;
		this.add = _add;
		this.addResource = _addResource;
		this.addMine = _addMine;
		this.get = _get;
		this.createBuilding = _createBuilding;
		this.createPipe = _createPipe;
		this.createResource = _createResource;
		this.getPriorityList = function() { return priorityList; }
	}
	
	function BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters)
	{
		parameters = parameters || {};

        //var buildingType = buildingType;
		//var terrainLayer = terrainLayer;
		//var buildingTime = buildingTime;
		//var buildingCost = buildingCost;
		var consumption = parameters.consumption || {};
		var production = parameters.production || {};
		var productionWaste = parameters.productionWaste || {};
		var capacity = parameters.capacity || {};
		var requiredResource = parameters.requiredResource;
		
		var _createItem = function(position)
		{
			return new Building(buildingType, terrainLayer, position, buildingTime);
		};
		
		var _getAreaType = function()
		{
			return AreaTypes.One;
		};
		
		//-----------------------------------------
		
		this.eventBeginBuilding = parameters.eventBeginBuilding;
		this.eventEndBuilding = parameters.eventEndBuilding;
		this.eventDestroy = parameters.eventDestroy;
		
		this.getBuildingType = function() { return buildingType; };
		this.getTerrainLayer = function() { return terrainLayer; };
		this.getBuildingTime = function() { return buildingTime; };
		this.getBuildingCost = function() { return buildingCost; };
		this.getConsumption = function() { return consumption; };
		this.getProduction = function() { return production; };
		this.getProductionWaste = function() { return productionWaste; };
		this.getCapacity = function() { return capacity; };
		this.getRequiredResource = function() { return requiredResource; };
		this.getBuildingImageId = function() { return buildingType; };
		
		this.createItem = _createItem;
		this.getAreaType = _getAreaType;
		
		//-----------------------------------------
	}
	
	// singleton
	var PrototypeLib = new PrototypeLibConstructor();