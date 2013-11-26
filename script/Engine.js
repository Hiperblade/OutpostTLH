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
			var roboticsWorkUnit = colonyState.getStored("roboticsWorker");
			colonyState.setMaterials( { humanWorkUnit: humanWorkUnit, roboticsWorkUnit: roboticsWorkUnit } );
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
					var remainTime = item.progress();
					if(remainTime == 0)
					{
						var baseItem = RecipeLib.get(item.getName());
						colonyState.addMaterials(baseItem.getResult());
						
						queue.splice(queue.indexOf(item), 1); // remove
//Log.dialog("NEW_CREATION");
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
Log.dialog("NEW_DISCOVERY");
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
	
	// calcolo manutenzione
	function MaintenanceEngine()
	{
		var _hasHeadquarter = function(graph)
		{
			for(var buildingType in graph)
			{
                if(graph.hasOwnProperty(buildingType))
                {
                    if(graph[buildingType][0].isHeadquarter)
                    {
                        return true;
                    }
                }
			}
			return false;
		};
	
		var _simulation = function(colonyState, graphs)
		{
			// costo manutenzione
			var repairCost = 10;
			
			var buildingAmount = 0;
			for(var i = 0; i < graphs.length; i++)
			{
				if(_hasHeadquarter(graphs[i]))
				{
					for(var buildingType in graphs[i])
					{
                        if(graphs[i].hasOwnProperty(buildingType))
                        {
						    buildingAmount += graphs[i][buildingType].length;
                        }
					}	
				}
			}
			
			var neglectPercentage;
			var costAmount = buildingAmount * repairCost;
			if(colonyState.haveMaterials({ repairUnit: costAmount }))
			{
				colonyState.delMaterials({ repairUnit: costAmount });
				neglectPercentage = 0;
			}
			else
			{
				var tmp = colonyState.getRemainder("repairUnit");
				colonyState.delMaterials({ repairUnit: tmp });
				neglectPercentage = ((costAmount - tmp) * 100) / costAmount;
			}
			
			colonyState.getSimulationData().neglectPercentage = neglectPercentage;
		};
		
		var _computation = function(colonyState, graphs, map)
		{
			var neglectPercentage = colonyState.getSimulationData().neglectPercentage;
			var reapairAmount = 20;
			var damageVariance = 6;
			var damageAmount = 0;
				 if(neglectPercentage < 20) { damageAmount = 0;   }
			else if(neglectPercentage < 40) { damageAmount = 10;  }
			else if(neglectPercentage < 80) { damageAmount = 50;  }
			else							{ damageAmount = 100; }

            var integrity;
            var buildingType;
			for(var i = 0; i < graphs.length; i++)
			{
				if(_hasHeadquarter(graphs[i]))
				{
					if(damageAmount > 0)
					{
						// danneggiamento
						for(buildingType in graphs[i])
						{
                            if(graphs[i].hasOwnProperty(buildingType))
                            {
                                graphs[i][buildingType].forEach(function(tmp)
                                {
                                    if(!tmp.isDestroyed())
                                    {
                                        integrity = tmp.damage(damageAmount + Math.floor(Math.random() * damageVariance));
                                        if(integrity == 0)
                                        {
                                            colonyState.addToDestroyedList(tmp);

                                            var eventDestroy = PrototypeLib.get(tmp.getBuildingType()).eventDestroy;
                                            if(eventDestroy != undefined)
                                            {
                                                eventDestroy(tmp, map);
                                            }
                                        }
                                    }
                                    else
                                    {
                                        colonyState.addToDestroyedList(tmp);
                                    }
                                });
                            }
						}
					}
					else
					{
						// riparazione
						for(buildingType in graphs[i])
						{
                            if(graphs[i].hasOwnProperty(buildingType))
                            {
                                graphs[i][buildingType].forEach(function(tmp)
                                {
                                    tmp.reapair(reapairAmount);
                                });
                            }
						}
					}
					
					for(var ii = 0; ii < graphs[i].length; ii++)
					{
						graphs[i][ii].progress();
					}
					
					//costruzione edifici
					var buildList = colonyState.getBuildList();
					for(var iii = 0; iii < buildList.length; iii++)
					{
						if(buildList[iii].progressBuild())
						{
							var eventEndBuilding = PrototypeLib.get(buildList[iii].getBuildingType()).eventEndBuilding;
							if(eventEndBuilding != undefined)
							{
								eventEndBuilding(buildList[iii], map);
							}
						}
					}
				}
				else // edifici scollegati
				{
					// danneggiamento
					for(buildingType in graphs[i])
					{
                        if(graphs[i].hasOwnProperty(buildingType))
                        {
                            graphs[i][buildingType].forEach(function(tmp)
                            {
                                if(!tmp.isDestroyed())
                                {
                                    integrity = tmp.damage(100 + Math.floor(Math.random() * damageVariance));
                                    if(integrity == 0)
                                    {
                                        colonyState.addToDestroyedList(tmp);

                                        var eventDestroy = PrototypeLib.get(tmp.getBuildingType()).eventDestroy;
                                        if(eventDestroy != undefined)
                                        {
                                            eventDestroy(tmp, map);
                                        }
                                    }
                                }
                                else
                                {
                                    colonyState.addToDestroyedList(tmp);
                                }
                            });
                        }
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
				controllers: colonyState.getRemainder("controlUnit") - dozerCount + diggerCount,
				dozer: colonyState.getRemainder("dozer") - dozerCount,
				digger: colonyState.getRemainder("digger") - diggerCount
				});
		};
		
		//-----------------------------------------
		
		this.simulation = _simulation;
		this.computation = _computation;
		
		//-----------------------------------------
	}
	
	// generatore di eventi
	function EventEngine()
	{
		var _simulation = function(colonyState, graphs)
		{
		};
		
		var _computation = function(colonyState, graphs, map)
		{
//TODO
			//var neglectPercentage = colonyState.getSimulationData().neglectPercentage;
			//var date = colonyState.getDate();
			// incidenti, catastrofi (distruzione o danneggiamento edifici, morti o feriti)
			// scoperte (nuove risorse, rovine ecc.)
		};
				
		//-----------------------------------------
		
		this.simulation = _simulation;
		this.computation = _computation;
		
		//-----------------------------------------
	}
	
	// gestione sistemi avanzati (terraforming ecc.)
	function AdvanceSystemEngine()
	{
		var _simulation = function(colonyState, graphs)
		{
		};
		
		var _computation = function(colonyState, graphs, map)
		{
//TODO
		};
		
		//-----------------------------------------
		
		this.simulation = _simulation;
		this.computation = _computation;
		
		//-----------------------------------------
	}
	
	// calcolo popolazione (nascite, ecc)
	function PopulationEngine()
	{
		var _simulation = function(colonyState, graphs)
		{
		};
		
		var _computation = function(colonyState, graphs, map)
		{
			var date = colonyState.getDate();
//TODO: habitatUnit
			// totale popolazione
			var people = 0;
			var population = colonyState.getPopulation();
			var generations = population.registry;
			for(var g  = 0; g < generations.length; g++)
			{
				if(generations[g].getState(date) != GenerationState.Deads)
				{
					people += generations[g].getPopulation();
				}
			}
			
			// cibo (malnutrizione)
			var malnutrition = 0;
			var foodUnit = colonyState.getRemainder("foodUnit");
			if(people > foodUnit)
			{
				malnutrition = people - foodUnit;
				colonyState.delMaterials( { foodUnit: foodUnit } );
			}
			else
			{
				colonyState.delMaterials( { foodUnit: people } );
			}
			if(people > 0)
			{
				malnutrition = malnutrition / people;
			}
			
			// alloggi (sovraffollamento)
			var overcrowding = 0;
			var residentialUnit = colonyState.getRemainder("residentialUnit");
			if(people > residentialUnit)
			{
				overcrowding = people - residentialUnit;
				colonyState.delMaterials( { residentialUnit: residentialUnit } );
			}
			else
			{
				colonyState.delMaterials( { residentialUnit: people } );
			}
			if(people > 0)
			{
				overcrowding = overcrowding / people;
			}
			
			// medicinali (copertura sanitaria mancante)
			var missingHealthCover = 0;
			var medicalUnit = colonyState.getRemainder("medicalUnit");
			if(people > medicalUnit)
			{
				missingHealthCover = people - medicalUnit;
				colonyState.delMaterials( { medicalUnit: medicalUnit } );
			}
			else
			{
				colonyState.delMaterials( { medicalUnit: people } );
			}
			if(people > 0)
			{
				missingHealthCover = missingHealthCover / people;
			}

			// istruzione (mancanza di istruzione)
			var missingEducation = 0;
			var educationUnit = colonyState.getRemainder("educationUnit");
			var students = 0;
			var missingHigthEducation = 0;
			var higthEducationUnit = colonyState.getRemainder("higthEducationUnit");
			var researchers = 0;
			for(var i = 0; i < generations.length; i++)
			{
				var lots = generations[i].getLots();
				var minEducationLevel = lots[lots.length - 1].getEducationLevel();
				var ii;
				for(ii = 0; ii < lots.length; ii++)
				{
					if(lots[ii].getEducationLevel() == minEducationLevel)
					{
						break;
					}
				}
				for(var index = ii; index < ii + lots.length; index++)
				{
					if(generations[i].getState(date) == GenerationState.Students)
					{
						// Students
						students += lots[index % lots.length].getPopulation();
						// avanzamento istruzione
						if(students <= educationUnit)
						{
							lots[index % lots.length].teach();
						}
					}
					else if(generations[i].getState(date) == GenerationState.Researchers)
					{
						// Researchers
						researchers += lots[index % lots.length].getPopulation();
						// avanzamento istruzione
						if(researchers <= higthEducationUnit)
						{
							lots[index % lots.length].teach();
						}
					}
				}
			}
			// Students
			if(students > educationUnit)
			{
				missingEducation = students - educationUnit;
				colonyState.delMaterials( { educationUnit: educationUnit } );
			}
			else
			{
				colonyState.delMaterials( { educationUnit: students } );
			}
			if(students > 0)
			{
				missingEducation = missingEducation / students;
			}
			// Researchers
			if(researchers > higthEducationUnit)
			{
				missingHigthEducation = researchers - higthEducationUnit;
				colonyState.delMaterials( { higthEducationUnit: higthEducationUnit } );
			}
			else
			{
				colonyState.delMaterials( { higthEducationUnit: researchers } );
			}
			if(researchers > 0)
			{
				missingHigthEducation = missingHigthEducation / researchers;
			}
			
			// felicità (tristezza)
			var sadness = 0;
			var recreationalUnit = colonyState.getRemainder("recreationalUnit");
			if(people > recreationalUnit)
			{
				sadness = people - recreationalUnit;
				colonyState.delMaterials( { recreationalUnit: recreationalUnit } );
			}
			else
			{
				colonyState.delMaterials( { recreationalUnit: people } );
			}
			if(people > 0)
			{
				sadness = sadness / people;
			}
			
			//wellness
			//	malnutrition // malnutrizione
			//	overcrowding // sovraffollamento
			//	missingHealthCover // copertura sanitaria mancante		
			var wellness = 1 - (malnutrition + overcrowding + missingHealthCover);
			if(wellness < 0)
			{
				wellness = 0;
			}
			//happiness
			//	missingEducation // mancanza di istruzione
			//	missingHigthEducation // mancanza di alta formazione
			//	sadness // tristezza
			var happiness = 1 - (missingEducation + missingHigthEducation + sadness);
			if(happiness < 0)
			{
				happiness = 0;
			}
			
			var wellnessAverage = (population.wellness + wellness) / 2;
			
			if(wellnessAverage == 1)
			{
				//nascite (se le condizioni sanitarie sono favorevoli)
				var nurseryUnit = colonyState.getRemainder("nurseryUnit");
				if(nurseryUnit > 0)
				{
					generations.push(new Generation(date, nurseryUnit));
				}
			}
			else if(wellnessAverage < 0)
			{
				// morti
				var dead = Math.floor(people * (1 - wellnessAverage));
				for(var d = 0; d < dead; d++)
				{
                    generations[d % generations.length].kill();
				}
			}
			
			population.wellness = wellness;
			population.happiness = happiness;
		};
		
		//-----------------------------------------
		
		this.simulation = _simulation;
		this.computation = _computation;
		
		//-----------------------------------------
	}