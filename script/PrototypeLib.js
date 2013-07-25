	function PrototypeLib() {	}
	
	PrototypeLib.list = {};
	
	PrototypeLib.priorityList = new Array();
	
	PrototypeLib.addPipe = function(pipeType, terrainLayer, buildingTime, buildingCost, parameters)
	{
		var buildingType = "Pipe_" + pipeType + "_" + terrainLayer;
		var item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
		item.create = function(position)
		{
			return new Pipe(pipeType, terrainLayer, position, buildingTime);
		}
		PrototypeLib.list[buildingType] = item;
		PrototypeLib.priorityList.push(buildingType);
		return item;
	}

	PrototypeLib.add = function(buildingType, terrainLayer, buildingTime, buildingCost, parameters)
	{
		var item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
		PrototypeLib.list[buildingType] = item;
		PrototypeLib.priorityList.push(buildingType);
		return item;
	}
	
	PrototypeLib.addResource = function(resourceType, terrainLayer)
	{
		var buildingType = "Resource_" + resourceType;
		var item = new BasePrototype(buildingType, terrainLayer, 0, {}, {});
		item.create = function(position)
		{
			return new Resource(resourceType, terrainLayer, position);
		}
		PrototypeLib.list[buildingType] = item;
		//PrototypeLib.priorityList.push(buildingType);
		return item;
	}
	
	PrototypeLib.addMine = function(resourceType, terrainLayer, buildingTime, buildingCost, parameters)
	{
		var buildingType = "Mine" + resourceType;
		var item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
		item.create = function(position)
		{
			return new Building(buildingType, terrainLayer, position, buildingTime, "RoboMiner");
		}
		PrototypeLib.list[buildingType] = item;
		PrototypeLib.priorityList.push(buildingType);
		return item;
	}

	PrototypeLib.get = function(buildingType)
	{
		return PrototypeLib.list[buildingType];
	}

	PrototypeLib.create = function(buildingType, position, alreadyBuilt)
	{
		var ret = PrototypeLib.list[buildingType].create(position);
		if(alreadyBuilt)
		{
			ret.setBuilded();
		}
		return ret;
	}
	
	PrototypeLib.createPipe = function(pipeType, layer, position, alreadyBuilt)
	{
		return PrototypeLib.create("Pipe_" + pipeType + "_" + layer, position, alreadyBuilt);
	}
	
	PrototypeLib.createResource = function(resourceType, position)
	{
		return PrototypeLib.list["Resource_" + resourceType].create(position);
	}
	
	var AreaTypes = {
		One: "1",
		TwoEast: "2e",
		TwoWest: "2w",
		Four: "4"
	};
	
	function BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters)
	{
		parameters = parameters || {};
		
		var buildingType = buildingType;
		var terrainLayer = terrainLayer;
		var buildingTime = buildingTime;
		var buildingCost = buildingCost;
		var consumption = parameters.consumption || {};
		var production = parameters.production || {};
		var productionWaste = parameters.productionWaste || {};
		var capacity = parameters.capacity || {};
		
		var requiredResource = parameters.requiredResource;
		
		this.eventBeginBuilding = parameters.eventBeginBuilding;
		this.eventEndBuilding = parameters.eventEndBuilding;
		this.eventDestroy = parameters.eventDestroy;
		
		var _create = function(position)
		{
			return new Building(buildingType, terrainLayer, position, buildingTime);
		}
		
		var _getAreaType = function()
		{
			return AreaTypes.One;
		}
		
		//-----------------------------------------
		
		this.getBuildingType = function() { return buildingType; }
		this.getTerrainLayer = function() { return terrainLayer; }
		this.getBuildingTime = function() { return buildingTime; }
		this.getBuildingCost = function() { return buildingCost; }
		this.getConsumption = function() { return consumption; }
		this.getProduction = function() { return production; }
		this.getProductionWaste = function() { return productionWaste; }
		this.getCapacity = function() { return capacity; }
		this.getRequiredResource = function() { return requiredResource; }
		this.getBuildingImageId = function() { return buildingType; }
		
		this.create = _create;
		this.getAreaType = _getAreaType;
		
		//-----------------------------------------
	}