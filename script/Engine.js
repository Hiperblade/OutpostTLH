"use strict";

	function Engine()
	{
		let engines = [];
		engines.push(new WorkforceEngine());
		engines.push(new BaseProductionEngine());
		engines.push(new ProductionEngine());
		engines.push(new ResearchEngine());
		engines.push(new MaintenanceEngine());
		engines.push(new RobotEngine());
		engines.push(new EventEngine());
		engines.push(new AdvanceSystemEngine());
		engines.push(new PopulationEngine());

		//-------------------------------------

		// simulazione
		let _simulation = function(colonyState, graphs)
		{
			colonyState.resetAll();

			for(let i = 0; i < engines.length; i++)
			{
				engines[i].simulation(colonyState, graphs);
			}
		};

		let _computation = function(colonyState, graphs, map)
		{
			colonyState.resetGlobalEvent();
			_simulation(colonyState, graphs);

			for(let i = 0; i < engines.length; i++)
			{
				engines[i].computation(colonyState, graphs, map);
			}

			colonyState.updateAll();
		};

		//-------------------------------------

		this.simulation = _simulation;
		this.computation = _computation;

		//-------------------------------------
	}

	// calcolo manodopera umana e robotica)
	function WorkforceEngine()
	{
		// add to colonyState the simulation result
		let _simulation = function(colonyState, graphs)
		{
			let date = colonyState.getDate();
			let humanWorkUnit = 0;
			let generations = colonyState.getPopulation().registry;
			for(let i  = 0; i < generations.length; i++)
			{
				if(generations[i].getState(date) == GenerationState.Scientists)
				{
					humanWorkUnit += generations[i].getPopulation();
				}
			}
			colonyState.setMaterials( { humanWorkUnit: humanWorkUnit } );

			let roboticsWorkUnit = colonyState.getStored("roboticsWorker");
			colonyState.setMaterials( { roboticsWorkUnit: roboticsWorkUnit } );
		};

		// return global events
		let _computation = function(colonyState, graph, map)
		{
		};

		//-----------------------------------------

		this.simulation = _simulation;
		this.computation = _computation;

		//-----------------------------------------
	}

	// produzione di base
	function BaseProductionEngine()
	{
		// add to colonyState the simulation result
		let _simulation = function(colonyState, graphs)
		{
			for(let i = 0; i < graphs.length; i++)
			{
				_internalSimulation(colonyState, graphs[i]);
			}
		};

		let _internalSimulation = function(colonyState, graph)
		{
			PrototypeLib.getPriorityList().forEach(function(buildingType)
			{
				let buildingProtype = PrototypeLib.get(buildingType);
				if(graph[buildingType] != undefined)
				{
					graph[buildingType].forEach(function(tmp)
					{
						if(tmp.isOperative())
						{
							if((colonyState.haveMaterials(buildingProtype.getConsumption())) &&
								(colonyState.haveSpace(buildingProtype.getProductionWaste())))
							{
								colonyState.delMaterials(buildingProtype.getConsumption());
								colonyState.addMaterials(buildingProtype.getProduction());
								colonyState.addMaterials(buildingProtype.getProductionWaste());
								colonyState.addCapacity(buildingProtype.getCapacity());

								colonyState.addToActiveList(tmp);
							}
							else
							{
								// edificio inattivo per la mancanza di materie prime
								colonyState.addToInactiveList(tmp);
							}
						}
						else if(tmp.underConstruction())
						{
							// edificio in costruzione
							if(colonyState.haveMaterials(buildingProtype.getBuildingCost()))
							{
								colonyState.delMaterials(buildingProtype.getBuildingCost());
								colonyState.addToBuildList(tmp);
							}
						}
						else if(tmp.getIntegrity() == 0)
						{
							// edificio distrutto
							colonyState.addToDestroyedList(tmp);
						}
					});
				}
			});
		};

		// return global events
		let _computation = function(colonyState, graphs, map)
		{
		};

		//-----------------------------------------

		this.simulation = _simulation;
		this.computation = _computation;

		//-----------------------------------------
	}

	function ProductionEngine()
	{
		// add to colonyState the simulation result
		let _simulation = function(colonyState, graphs)
		{
			let queue = colonyState.getProductionQueue();
			let ret = [];
			for(let i = 0; i < queue.length; i++)
			{
				let item = queue[i];
				let value = 0;

				if(item.getRemainTime() > 0)
				{
					let baseItem = RecipeLib.get(item.getName());
					let cost = baseItem.getCost();

					while(colonyState.haveMaterials(cost) && value < item.getRemainTime())
					{
						colonyState.delMaterials(cost);
						value++;
					}
				}

				ret.push({ item: item, value: value });
			}

			colonyState.getSimulationData().productionProgress = ret;
		};

		let _computation = function(colonyState, graphs, map)
		{
			let progressList = colonyState.getSimulationData().productionProgress;
			let queue = colonyState.getProductionQueue();

			for(let i = 0; i < progressList.length; i++)
			{
				let item = progressList[i].item;

				for(let ii = 0; ii < progressList[i].value; ii++)
				{
					item.progress();
				}

				if(item.getRemainTime() == 0)
				{
					let baseItem = RecipeLib.get(item.getName());
					if(colonyState.haveSpace(baseItem.getResult()))
					{
						colonyState.addMaterials(baseItem.getResult());

						queue.splice(queue.indexOf(item), 1); // remove
Log.dialog("NEW_CREATION: " + item.getName());
					}
				}
			}
		};

		//-----------------------------------------

		this.simulation = _simulation;
		this.computation = _computation;

		//-----------------------------------------
	}

	// ricerca
	function ResearchEngine()
	{
		// add to colonyState the simulation result
		let _simulation = function(colonyState, graphs)
		{
			let queue = colonyState.getResearchQueue();
			let ret = [];
			for(let i = 0; i < queue.length; i++)
			{
				let item = queue[i];
				let baseItem = RecipeLib.get(item.getName());
				let cost = baseItem.getCost();

				let value = 0;
				while(colonyState.haveMaterials(cost) && value < item.getRemainTime())
				{
					colonyState.delMaterials(cost);
					value++;
				}
				ret.push({ item: item, value: value });
			}
			colonyState.getSimulationData().researchProgress = ret;
		};

		let _computation = function(colonyState, graphs, map)
		{
			let progressList = colonyState.getSimulationData().researchProgress;
			let queue = colonyState.getResearchQueue();

			for(let i = 0; i < progressList.length; i++)
			{
				let item = progressList[i].item;
				for(let ii = 0; ii < progressList[i].value; ii++)
				{
					let remainTime = item.progress();
					if(remainTime == 0)
					{
						let baseItem = RecipeLib.get(item.getName());
						colonyState.addKnowledge(baseItem.getResult());
						colonyState.addCompletedResearch(item.getName());

						queue.splice(queue.indexOf(item), 1); // remove
Log.dialog("NEW_DISCOVERY: " + item.getName());
						break;
					}
				}
			}
		};

		//-----------------------------------------

		this.simulation = _simulation;
		this.computation = _computation;

		//-----------------------------------------
	}

	// gestione RoboDozer, RoboDigger -- avanzamento e disponibilità per il turno successivo
	function RobotEngine()
	{
		let _simulation = function(colonyState, graphs)
		{
		};

		let _computation = function(colonyState, graphs, map)
		{
			let structure = map.getStructure();
			let dozerCount = 0;
			let diggerCount = 0;
			let removedRobot = [];

			for(let i = 0; i < structure.length; i++)
			{
				if(structure[i].getType() == StructureTypes.Robot)
				{
					let robotType = structure[i].getRobotType();
					if(robotType == RobotTypes.Dozer)
					{
						// Dozer
						let detritus = map.raze(structure[i].getPosition(), structure[i].getLayer());
						if(detritus == 0)
						{
							// remove
							removedRobot.push(i);
						}
						else
						{
							dozerCount++;
						}
					}
					else if(robotType == RobotTypes.Digger)
					{
						// Digger
						let finished = map.dig(structure[i].getPosition(), structure[i].getLayer());
						if(finished)
						{
							// remove
							removedRobot.push(i);
						}
						else
						{
							diggerCount++;
						}
					}
				}
			}

			for(let ii = removedRobot.length - 1; ii >= 0; ii--)
			{
				structure.splice(removedRobot[ii], 1); // remove
			}

			colonyState.setRobotsAvailable(
				{
				controllers: colonyState.getRemainder("controlUnit") - (dozerCount + diggerCount),
				dozer: colonyState.getRemainder("dozer") - dozerCount,
				digger: colonyState.getRemainder("digger") - diggerCount
				});
		};

		//-----------------------------------------

		this.simulation = _simulation;
		this.computation = _computation;

		//-----------------------------------------
	}