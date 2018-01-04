"use strict";

	let AreaTypes = {
		One: "1",
		TwoEast: "2e",
		TwoWest: "2w",
		Four: "4"
	};

	function PrototypeLibConstructor()
	{	
		let list = {};
		let priorityList = [];

		/**
		 *  @param {PipeType} pipeType
		 *  @param {TerrainLayer} terrainLayer
		 *  @param {number} buildingTime
		 *  @param {object} buildingCost
		 *  @param {object} parameters (requiredResource, consumption, production, productionWaste, capacity, eventBeginBuilding, eventEndBuilding, eventDestroy)
		 */
		let _addPipe = function(pipeType, terrainLayer, buildingTime, buildingCost, parameters)
		{
			let buildingType = "Pipe_" + pipeType + "_" + terrainLayer;
			let item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
			item.createItem = function(position)
			{
				return new Pipe(pipeType, terrainLayer, position, buildingTime);
			};
			list[buildingType] = item;
			priorityList.push(buildingType);
			return item;
		};

		/**
		 *  @param {string} buildingType
		 *  @param {TerrainLayer} terrainLayer
		 *  @param {number} buildingTime
		 *  @param {object} buildingCost
		 *  @param {object} parameters (requiredResource, consumption, production, productionWaste, capacity, eventBeginBuilding, eventEndBuilding, eventDestroy)
		 */
		let _add = function(buildingType, terrainLayer, buildingTime, buildingCost, parameters)
		{
			let item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
			list[buildingType] = item;
			priorityList.push(buildingType);
			return item;
		};

		/**
		 *  @param {string} resourceType
		 *  @param {TerrainLayer} terrainLayer
		 *  @param {string} color
		 */
		let _addResource = function(resourceType, terrainLayer, color)
		{
			let buildingType = "Resource_" + resourceType;
			let item = new BasePrototype(buildingType, terrainLayer, 0, {}, {});
			item.createItem = function(position)
			{
				return new Resource(resourceType, terrainLayer, color, position);
			};
			list[buildingType] = item;
			return item;
		};

		/**
		 *  @param {string} resourceType
		 *  @param {TerrainLayer} terrainLayer
		 *  @param {number} buildingTime
		 *  @param {object} buildingCost
		 *  @param {object} parameters (requiredResource, consumption, production, productionWaste, capacity, eventBeginBuilding, eventEndBuilding, eventDestroy)
		 */
		let _addMine = function(resourceType, terrainLayer, buildingTime, buildingCost, parameters)
		{
			let buildingType = "Mine" + resourceType;
			let item = new BasePrototype(buildingType, terrainLayer, buildingTime, buildingCost, parameters);
			item.createItem = function(position)
			{
				return new Building(buildingType, terrainLayer, position, buildingTime, "RoboMiner");
			};
			list[buildingType] = item;
			priorityList.push(buildingType);
			return item;
		};

		/**
		 *  @param {string} buildingType
		 */
		let _get = function(buildingType)
		{
			return list[buildingType];
		};

		/**
		 *  @param {string} buildingType
		 *  @param {object} position
		 *  @param {boolean} alreadyBuilt
		 */
		let _createBuilding = function(buildingType, position, alreadyBuilt)
		{
			let ret = list[buildingType].createItem(position);
			if(alreadyBuilt)
			{
				ret.setBuilded();
			}
			return ret;
		};

		/**
		 *  @param {PipeType} pipeType
		 *  @param {TerrainLayer} layer
		 *  @param {object} position
		 *  @param {boolean} alreadyBuilt
		 */
		let _createPipe = function(pipeType, layer, position, alreadyBuilt)
		{
			return _createBuilding("Pipe_" + pipeType + "_" + layer, position, alreadyBuilt);
		};

		/**
		 *  @param {string} resourceType
		 *  @param {object} position
		 */
		let _createResource = function(resourceType, position)
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

		let consumption = parameters.consumption || {};
		let production = parameters.production || {};
		let productionWaste = parameters.productionWaste || {};
		let capacity = parameters.capacity || {};
		let requiredResource = parameters.requiredResource;

		let _createItem = function(position)
		{
			return new Building(buildingType, terrainLayer, position, buildingTime);
		};

		let _getAreaType = function()
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
	let PrototypeLib = new PrototypeLibConstructor();