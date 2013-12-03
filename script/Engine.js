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
	
	// calcolo manutenzione
	function MaintenanceEngine()
	{
		var _simulation = function(colonyState, graphs)
		{
			// costo manutenzione
			var repairCost = 10;
			
			var buildingAmount = 0;
			for(var i = 0; i < graphs.length; i++)
			{
				if(BuildingGraph.hasHeadquarter(graphs[i]))
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
				if(BuildingGraph.hasHeadquarter(graphs[i]))
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
	
	// generatore di eventi
	function EventEngine()
	{
		var _simulation = function(colonyState, graphs)
		{
		};
		
		var _computation = function(colonyState, graphs, map)
		{
//TODO:8
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
//TODO:21
		};
		
		//-----------------------------------------
		
		this.simulation = _simulation;
		this.computation = _computation;
		
		//-----------------------------------------
	}
	
	// calcolo popolazione (nascite, morti e stato)
	function PopulationEngine()
	{
		var _simulation = function(colonyState, graphs)
		{
		};
		
		var _computation = function(colonyState, graphs, map)
		{
			var date = colonyState.getDate();

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

            // totale tubi
            var countPipes = 0;
            for(var graph = 0; graph < graphs.length; graph++)
            {
                if(BuildingGraph.hasHeadquarter(graphs[graph]))
                {
                    countPipes += BuildingGraph.countPipes(graphs[graph]);
                }
            }

            var inhospitality = 1;
            var malnutrition = 1;
            var overcrowding = 1;
            var missingHealthCover = 1;
            var missingEducation = 1;
            var missingHighEducation = 1;
            var sadness = 1;

            // ambiente (aria - acqua - temperatura) (inhospitality)
            if(countPipes > 0)
            {
                var habitatUnit = colonyState.getRemainder("habitatUnit");
                colonyState.delMaterials( { habitatUnit: Math.min(habitatUnit, countPipes) } );
                inhospitality = 1 - (habitatUnit / countPipes);
                if(inhospitality < 0)
                {
                    inhospitality = 0;
                }
            }

            // se ci sono persone
            if(people > 0)
            {
                // cibo (malnutrizione)
                var foodUnit = colonyState.getRemainder("foodUnit");
                colonyState.delMaterials( { foodUnit: Math.min(foodUnit, people) } );
                malnutrition = 1 - (foodUnit / people);
                if(malnutrition < 0)
                {
                    malnutrition = 0;
                }

                // alloggi (sovraffollamento)
                var residentialUnit = colonyState.getRemainder("residentialUnit");
                colonyState.delMaterials( { foodUnit: Math.min(residentialUnit, people) } );
                overcrowding = 1 - (residentialUnit / people);
                if(overcrowding < 0)
                {
                    overcrowding = 0;
                }

                // medicinali (copertura sanitaria mancante)
                var medicalUnit = colonyState.getRemainder("medicalUnit");
                colonyState.delMaterials( { medicalUnit: Math.min(medicalUnit, people) } );
                missingHealthCover = 1 - (medicalUnit / people);
                if(missingHealthCover < 0)
                {
                    missingHealthCover = 0;
                }

                // istruzione (mancanza di istruzione)
                var educationUnit = colonyState.getRemainder("educationUnit");
                var students = 0;
                var highEducationUnit = colonyState.getRemainder("highEducationUnit");
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
                            if(researchers <= highEducationUnit)
                            {
                                lots[index % lots.length].teach();
                            }
                        }
                    }
                }

                // Students
                colonyState.delMaterials( { educationUnit: Math.min(educationUnit, students) } );
                if(students > 0)
                {
                    missingEducation = 1 - (educationUnit / students);
                    if(missingEducation < 0)
                    {
                        missingEducation = 0;
                    }
                }
                else
                {
                    missingEducation = 0;
                }

                // Researchers
                colonyState.delMaterials( { highEducationUnit: Math.min(highEducationUnit, researchers) } );
                if(researchers > 0)
                {
                    missingHighEducation = 1 - (highEducationUnit / researchers);
                    if(missingHighEducation < 0)
                    {
                        missingHighEducation = 0;
                    }
                }
                else
                {
                    missingHighEducation = 0;
                }

                // felicità (tristezza)
                var recreationalUnit = colonyState.getRemainder("recreationalUnit");
                colonyState.delMaterials( { recreationalUnit: Math.min(recreationalUnit, people) } );
                sadness = 1 - (recreationalUnit / people);
                if(sadness < 0)
                {
                    sadness = 0;
                }
            }
            else // non ci sono persone
            {
                if(colonyState.getRemainder("foodUnit") > 0)
                {
                    malnutrition = 0;
                }

                if(colonyState.getRemainder("residentialUnit") > 0)
                {
                    overcrowding = 0;
                }

                if(colonyState.getRemainder("medicalUnit") > 0)
                {
                    missingHealthCover = 0;
                }
            }

            //subsistence
            //  inhospitality // inospitabilità dell'ambiente
            //	malnutrition // malnutrizione
            var subsistence = 1 - Math.max(inhospitality, malnutrition);

            //wellness
			//	overcrowding // sovraffollamento
			//	missingHealthCover // copertura sanitaria mancante		
			var wellness = 1 - Math.max(overcrowding, missingHealthCover);

			//happiness
			//	missingEducation // mancanza di istruzione
			//	missingHighEducation // mancanza di alta formazione
			//	sadness // tristezza
			var happiness = 1 - Math.max(missingEducation, missingHighEducation, sadness);

            var subsistenceAverage = (population.subsistence + subsistence) / 2;
			var wellnessAverage = (population.wellness + wellness) / 2;
			if(subsistenceAverage == 1 && wellnessAverage == 1)
			{
				// nascite (se le condizioni sono favorevoli)
				var nurseryUnit = colonyState.getRemainder("nurseryUnit");
				if(nurseryUnit > 0)
				{
					generations.push(new Generation(date, nurseryUnit));
				}
			}
			else if(subsistenceAverage < 1)
			{
				// morti
				var dead = Math.floor(people * (1 - subsistenceAverage));
				for(var d = 0; d < dead; d++)
				{
                    generations[d % generations.length].kill();
				}
			}

            population.subsistence = subsistence;
			population.wellness = wellness;
			population.happiness = happiness;
		};
		
		//-----------------------------------------
		
		this.simulation = _simulation;
		this.computation = _computation;
		
		//-----------------------------------------
	}