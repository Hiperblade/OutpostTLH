 "use strict";
 
	function ColonyState()
	{
		let state = {};
		state.materials = [];
		state.metaMaterials = [];
		state.buildList = [];
		state.destroyedList = [];
		state.activeList = {};
		state.inactiveList = {};
		state.knowledge = {
			discovery: [],
			theory: [],
			technology: [],
			completed: [],
			researchQueue: [],
			productionQueue: []
			};
		state.population = {
			registry: [],
			subsistence: 0,
			wellness: 0,
			happiness: 0
			};
		state.robotsAvailable = {
			controllers: 0,
			dozer: 0,
			digger: 0
			};
		state.date = 0;
		state.simulationData = {};
		state.globalEventList = [];

		let _checkMaterial = function(name)
		{
			if(!_contains(state.materials, name))
			{
				state[name + "Produced"] = 0;
				state[name + "Consumed"] = 0;
				state[name + "Stored"] = 0;
				state[name + "Capacity"] = 0;
				state.materials.push(name);
			}
		};

		let _resetMaterial = function(name)
		{
			if(state[name + "Produced"] != undefined)
			{
				state[name + "Produced"] = 0;
			}
			if(state[name + "Consumed"] != undefined)
			{
				state[name + "Consumed"] = 0;
			}
			if(state[name + "Capacity"] != undefined)
			{
				state[name + "Capacity"] = 0;
			}
		};

		let _updateMaterial = function(name)
		{
			let sulplus = state[name + "Produced"] - state[name + "Consumed"];
			let stored = state[name + "Stored"];
			if(sulplus > 0)
			{
				let capacity = _getFreeCapacity(name);
				if(capacity > 0)
				{
					if(sulplus > capacity)
					{
						stored += capacity;
					}
					else
					{
						stored += sulplus;
					}
				}
			}
			else
			{
				stored += sulplus;
				if(stored < 0)
				{
					stored = 0;
				}
			}
			state[name + "Stored"] = stored;
		};

		let _isMetaMaterial = function(name)
		{
			return (state[name + "MetaMaterial"] != undefined);
		};

		let _getCapacity = function(name)
		{
			_checkMaterial(name);
			if(_isMetaMaterial(name))
			{
				return state[state[name + "MetaMaterial"] + "Capacity"];
			}
			else
			{
				return state[name + "Capacity"];
			}
		};

		let _getFreeCapacity = function(name)
		{
			_checkMaterial(name);
			if(_isMetaMaterial(name))
			{
				return _getCapacity(name) - _getFullCapacity(state[name + "MetaMaterial"]);
			}
			else
			{
				return _getCapacity(name) - state[name + "Stored"];
			}
		};

		let _getFullCapacity = function(metaName)
		{
			let ret = 0;
			let subMaterials = state[metaName + "List"];
			if(subMaterials != undefined)
			{
				for(let i = 0; i < subMaterials.length; i++)
				{
					_checkMaterial(subMaterials[i]);
					ret += state[subMaterials[i] + "Stored"];
				}
			}
			return ret;
		};

		let _configureMaterial = function(name, metaName)
		{		
			_checkMaterial(name);

			if(metaName != null)
			{
				state[name + "MetaMaterial"] = metaName;
				if(!_contains(state.materials, metaName))
				{
					state[metaName + "Capacity"] = 0;
					state.materials.push(metaName);
					state.metaMaterials.push(metaName);
					state[metaName + "List"] = [];
				}
				state[metaName + "List"].push(name);
				state[metaName + "Capacity"] += state[name + "Capacity"];
				state[name + "Capacity"] = undefined;
			}
		};

		let _getMaterialFromMetaMaterial = function(metaName)
		{
			return state[metaName + "List"];
		};

		let _resetAll = function()
		{
			for(let i = 0; i < state.materials.length; i++)
			{
				_resetMaterial(state.materials[i]);
			}

			state.buildList = [];
			state.destroyedList = [];
			state.activeList = {};
			state.inactiveList = {};
			state.simulationData = {};
		};

		let _updateAll = function()
		{
			for(let i = 0; i < state.materials.length; i++)
			{
				_updateMaterial(state.materials[i]);
			}
		};

		let _addCapacity = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					state[mat + "Capacity"] += materials[mat];
				}
			}
			//Object.keys(materials).forEach(function (mat) {
			//	_checkMaterial(mat);
			//	state[mat + "Capacity"] += materials[mat];
			//});
		};

		let _haveMaterials = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					if(state[mat + "Produced"] - state[mat + "Consumed"] + state[mat + "Stored"] < materials[mat])
					{
						return false;
					}
				}
			}
			return true;
		};

		let _haveSpace = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					if(state[mat + "Produced"] - state[mat + "Consumed"] + materials[mat] > _getFreeCapacity(mat))
					{
						return false;
					}
				}
			}
			return true;
		};

		let _delMaterials = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					state[mat + "Consumed"] += materials[mat];
				}
			}
		};

		let _addMaterials = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					state[mat + "Produced"] += materials[mat];
				}
			}
		};

		let _getRemainder = function(name)
		{
			_checkMaterial(name);

			return state[name + "Stored"] + state[name + "Produced"] - state[name + "Consumed"];
		};

		let _destroyMaterials = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					state[mat + "Stored"] -= materials[mat];
					if(state[mat + "Stored"] < 0)
					{
						state[mat + "Stored"] = 0;
					}
				}
			}
		};

		let _createMaterials = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					state[mat + "Stored"] += materials[mat];
				}
			}
		};

		let _setMaterials = function(materials)
		{
			for(let mat in materials)
			{
				if(materials.hasOwnProperty(mat))
				{
					_checkMaterial(mat);

					state[mat + "Stored"] = materials[mat];
				}
			}
		};

		let _addToBuildList = function(building)
		{
			state.buildList.push(building);
		};

		let _addToDestroyedList = function(building)
		{
			state.destroyedList.push(building);
		};

		let _addToActiveList = function(building)
		{
			if(state.activeList[building.getBuildingType()] == undefined)
			{
				state.activeList[building.getBuildingType()] = [];
			}
			state.activeList[building.getBuildingType()].push(building);
		};

		let _addToInactiveList = function(building)
		{
			if(state.inactiveList[building.getBuildingType()] == undefined)
			{
				state.inactiveList[building.getBuildingType()] = [];
			}
			state.inactiveList[building.getBuildingType()].push(building);
		};

		// Knowledge
		let _isCompletedKnowledge = function(name)
		{
			return _contains(state.knowledge.completed, name);
		};

		let _addCompletedResearch = function(research)
		{
			state.knowledge.completed.push(research);
		};

		let _checkKnowledge = function(knowledge)
		{
			let ret = true;
			for(let type in knowledge)
			{
				if(knowledge.hasOwnProperty(type))
				{
					for(let ii = 0; ii < knowledge[type].length; ii++)
					{
						if(!_contains(state.knowledge[type], knowledge[type][ii]))
						{
							ret = false;
						}
					}
				}
			}
			return ret;
		};

		let _addKnowledge = function(knowledge)
		{
			let ret = true;
			for(let type in knowledge)
			{
				if(knowledge.hasOwnProperty(type))
				{
					for(let ii = 0; ii < knowledge[type].length; ii++)
					{
						if(!_contains(state.knowledge[type], knowledge[type][ii]))
						{
							state.knowledge[type].push(knowledge[type][ii]);
						}
					}
				}
			}
			return ret;
		};

		let _delKnowledge = function(knowledge)
		{
			let ret = true;
			for(let type in knowledge)
			{
				if(knowledge.hasOwnProperty(type))
				{
					for(let ii = 0; ii < knowledge[type].length; ii++)
					{
						if(_contains(state.knowledge[type], knowledge[type][ii]))
						{
							state.knowledge[type].splice(state.knowledge[type].indexOf(knowledge[type][ii]), 1); // remove
						}
					}
				}
			}
			return ret;
		};

		let _contains = function(array, obj)
		{
			for(let i = 0; i < array.length; i++)
			{
				if (array[i] === obj)
				{
					return true;
				}
			}
			return false;
		};

		let _getRoboDozerAvailable = function()
		{
			return Math.min(state.robotsAvailable.dozer, state.robotsAvailable.controllers);
		};

		let _useRoboDozer = function()
		{
			if(_getRoboDozerAvailable() > 0)
			{
				state.robotsAvailable.dozer--;
				state.robotsAvailable.controllers--;
				return true;
			}
			return false;
		};

		let _getRoboDiggerAvailable = function()
		{
			return Math.min(state.robotsAvailable.digger, state.robotsAvailable.controllers);
		};

		let _useRoboDigger = function()
		{
			if(_getRoboDiggerAvailable() > 0)
			{
				state.robotsAvailable.digger--;
				state.robotsAvailable.controllers--;
				return true;
			}
			return false;
		};

		let _setRobotsAvailable = function(data)
		{
			state.robotsAvailable.controllers = data.controllers;
			state.robotsAvailable.dozer = data.dozer;
			state.robotsAvailable.digger = data.digger;
		};

		//-----------------------------------------

		this.getDate = function() { return state.date; };
		this.setDate = function(date) { state.date = date; };

		this.getConsumed = function(name) { _checkMaterial(name); return state[name + "Consumed"]; };
		this.getProduced = function(name) { _checkMaterial(name); return state[name + "Produced"]; };
		this.getStored = function(name) { _checkMaterial(name); return state[name + "Stored"]; };
		this.getMaterials = function() { return state.materials; };
		this.getMetaMaterials = function() { return state.metaMaterials; };
		this.getKnowledge = function() { return state.knowledge; };
		this.getTechnology = function() { return state.knowledge.technology; };
		this.getTheory = function() { return state.knowledge.theory; };
		this.getDiscovery = function() { return state.knowledge.discovery; };
		this.getResearchQueue = function() { return state.knowledge.researchQueue; };
		this.getProductionQueue = function() { return state.knowledge.productionQueue; };
		this.getRoboticsWorkforce = function() { return state.roboticsWorkforce; };
		this.getPopulation = function() { return state.population; };

		this.getRoboDozerAvailable = _getRoboDozerAvailable;
		this.useRoboDozer = _useRoboDozer;
		this.getRoboDiggerAvailable = _getRoboDiggerAvailable;
		this.useRoboDigger = _useRoboDigger;
		this.setRobotsAvailable = _setRobotsAvailable;

		this.isMetaMaterial = _isMetaMaterial;
		this.getMaterialFromMetaMaterial = _getMaterialFromMetaMaterial;
		this.getCapacity = _getCapacity;
		this.getFreeCapacity = _getFreeCapacity;
		this.getFullCapacity = _getFullCapacity;
		this.configureMaterial = _configureMaterial;
		this.resetAll = _resetAll;
		this.updateAll = _updateAll;
		this.addCapacity = _addCapacity;
		this.haveMaterials = _haveMaterials;
		this.haveSpace = _haveSpace;
		this.delMaterials = _delMaterials;
		this.addMaterials = _addMaterials;
		this.getRemainder = _getRemainder;
		this.destroyMaterials = _destroyMaterials;
		this.createMaterials = _createMaterials;
		this.setMaterials = _setMaterials;

		this.addToBuildList = _addToBuildList;
		this.getBuildList = function() { return state.buildList; };
		this.addToDestroyedList = _addToDestroyedList;
		this.getDestroyedList = function() { return state.destroyedList; };
		this.addToActiveList = _addToActiveList;
		this.getActiveList = function() { return state.activeList; };
		this.addToInactiveList = _addToInactiveList;
		this.getInactiveList = function() { return state.inactiveList; };

		this.getSimulationData = function() { return state.simulationData; };
		this.getGlobalEventList = function() { return state.globalEventList; };
		this.resetGlobalEvent = function() { state.globalEventList = []; return state.globalEventList; };

		this.isCompletedKnowledge = _isCompletedKnowledge;
		this.addCompletedResearch = _addCompletedResearch;
		this.checkKnowledge = _checkKnowledge;
		this.addKnowledge = _addKnowledge;
		this.delKnowledge = _delKnowledge;

		//-----------------------------------------
	}