	function Engine()
	{
		var engines = [];
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
		var _simulation = function(colonyState, graphs)
		{
			colonyState.resetAll();

			for(var i = 0; i < engines.length; i++)
			{
				engines[i].simulation(colonyState, graphs);
			}
		};

		var _computation = function(colonyState, graphs, map)
		{
			colonyState.resetGlobalEvent();
			_simulation(colonyState, graphs);

			for(var i = 0; i < engines.length; i++)
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
		var _simulation = function(colonyState, graphs)
		{
			var date = colonyState.getDate();
			var humanWorkUnit = 0;
			var generations = colonyState.getPopulation().registry;
			for(var i  = 0; i < generations.length; i++)
			{
				if(generations[i].getState(date) == GenerationState.Scientists)
				{
					humanWorkUnit += generations[i].getPopulation();
				}
			}
			colonyState.setMaterials( { humanWorkUnit: humanWorkUnit } );

			var roboticsWorkUnit = colonyState.getStored("roboticsWorker");
			colonyState.setMaterials( { roboticsWorkUnit: roboticsWorkUnit } );
		};

		// return global events
		var _computation = function(colonyState, graph, map)
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
		var _simulation = function(colonyState, graphs)
		{
			for(var i = 0; i < graphs.length; i++)
			{
				_internalSimulation(colonyState, graphs[i]);
			}
		};

		var _internalSimulation = function(colonyState, graph)
		{
			PrototypeLib.getPriorityList().forEach(function(buildingType)
			{
				var buildingProtype = PrototypeLib.get(buildingType);
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
		var _computation = function(colonyState, graphs, map)
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
		var _simulation = function(colonyState, graphs)
		{
			var queue = colonyState.getProductionQueue();
			var ret = [];
			for(var i = 0; i < queue.length; i++)
			{
				var item = queue[i];
				var value = 0;

				if(item.getRemainTime() > 0)
				{
					var baseItem = RecipeLib.get(item.getName());
					var cost = baseItem.getCost();

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

		var _computation = function(colonyState, graphs, map)
		{
			var progressList = colonyState.getSimulationData().productionProgress;
			var queue = colonyState.getProductionQueue();

			for(var i = 0; i < progressList.length; i++)
			{
				var item = progressList[i].item;

				for(var ii = 0; ii < progressList[i].value; ii++)
				{
					item.progress();
				}

				if(item.getRemainTime() == 0)
				{
					var baseItem = RecipeLib.get(item.getName());
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
		var _simulation = function(colonyState, graphs)
		{
			var queue = colonyState.getResearchQueue();
			var ret = [];
			for(var i = 0; i < queue.length; i++)
			{
				var item = queue[i];
				var baseItem = RecipeLib.get(item.getName());
				var cost = baseItem.getCost();

				var value = 0;
				while(colonyState.haveMaterials(cost) && value < item.getRemainTime())
				{
					colonyState.delMaterials(cost);
					value++;
				}
				ret.push({ item: item, value: value });
			}
			colonyState.getSimulationData().researchProgress = ret;
		};

		var _computation = function(colonyState, graphs, map)
		{
			var progressList = colonyState.getSimulationData().researchProgress;
			var queue = colonyState.getResearchQueue();

			for(var i = 0; i < progressList.length; i++)
			{
				var item = progressList[i].item;
				for(var ii = 0; ii < progressList[i].value; ii++)
				{
					var remainTime = item.progress();
					if(remainTime == 0)
					{
						var baseItem = RecipeLib.get(item.getName());
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
		var _simulation = function(colonyState, graphs)
		{
		};

		var _computation = function(colonyState, graphs, map)
		{
			var structure = map.getStructure();
			var dozerCount = 0;
			var diggerCount = 0;
			var removedRobot = [];

			for(var i = 0; i < structure.length; i++)
			{
				if(structure[i].getType() == StructureTypes.Robot)
				{
					var robotType = structure[i].getRobotType();
					if(robotType == RobotTypes.Dozer)
					{
						// Dozer
						var detritus = map.raze(structure[i].getPosition(), structure[i].getLayer());
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
						var finished = map.dig(structure[i].getPosition(), structure[i].getLayer());
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

			for(var ii = removedRobot.length - 1; ii >= 0; ii--)
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