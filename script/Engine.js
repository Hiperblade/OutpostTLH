	function Engine()
	{
		// calcolo manodopera umana e robotica)
		var _workforceSimulation = function(colonyState, date)
		{
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
		}
			
		// ricerca
		var _researchSimulation = function(colonyState)
		{
			var queue = colonyState.getResearchQueue();
			var ret = new Array();
			for(var i = 0; i < queue.length; i++)
			{
				var item = queue[i];
				var baseItem = RecipeLib.get(item.getName());
				var cost = baseItem.getCost();
				
				var value = 0;
				while(colonyState.haveMaterials(cost) && value < item.getRemainTime())
				{
					colonyState.delMaterials(cost)
					value++;
				}
				ret.push({ item: item, value: value });
			}
			return ret;
		}
		
		var _researchComputation = function(colonyState, progressList)
		{
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
		}
		
		// produzione
		var _productionSimulation = function(colonyState)
		{
			var queue = colonyState.getProductionQueue();
			var ret = new Array();
			for(var i = 0; i < queue.length; i++)
			{
				var item = queue[i];
				var baseItem = RecipeLib.get(item.getName());
				var cost = baseItem.getCost(); 
				
				var value = 0;
				
				while(colonyState.haveMaterials(cost) && value < item.getRemainTime())
				{
					colonyState.delMaterials(cost)
					value++;
				}
				
				ret.push({ item: item, value: value });
			}
			return ret;
		}
		
		var _productionComputation = function(colonyState, progressList)
		{
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
		}
		
		// calcolo manutenzione
		var _maintenanceSimulation = function(colonyState, graph)
		{
			// costo manutenzione
			var repairCost = 10;
				
			var neglectPercentage = 100;
			if((graph["CommandCenter"] != undefined) ||
				(graph["LandingModule"] != undefined))
			{
				var buildingAmount = 0;
				for(var buildingType in graph)
				{
					buildingAmount += graph[buildingType].length;
				}
				
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
			}
			return neglectPercentage;
		}
		
		var _maintenanceComputation = function(colonyState, graph, map, neglectPercentage)
		{
			var reapairAmount = 20;
			var damageVariance = 6;
			var damageAmount = 0;
				 if(neglectPercentage < 20) { damageAmount = 0;   }
			else if(neglectPercentage < 40) { damageAmount = 10;  }
			else if(neglectPercentage < 80) { damageAmount = 50;  }
			else							{ damageAmount = 100; }

			if(damageAmount > 0)
			{
				var integrity;
				// danneggiamento
				for(var buildingType in graph)
				{
					graph[buildingType].forEach(function(tmp)
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
			else
			{
				// riparazione
				for(var buildingType in graph)
				{
					graph[buildingType].forEach(function(tmp)
					{
						tmp.reapair(reapairAmount);
					});
				}
			}
			
			for(var i = 0; i < graph.length; i++)
			{
				graph[i].progress();
			}
			
			//costruzione edifici
			var buildList = colonyState.getBuildList();
			for(var i = 0; i < buildList.length; i++)
			{
				if(buildList[i].progressBuild())
				{
					var eventEndBuilding = PrototypeLib.get(buildList[i].getBuildingType()).eventEndBuilding;
					if(eventEndBuilding != undefined)
					{
						eventEndBuilding(buildList[i], map);
					}
				}
			}
		}
		
		// gestione RoboDozer, RoboDigger -- avanzamento e disponibilità per il turno successivo
		var _robotComputation = function(colonyState, graph, map)
		{
			var structure = map.getStructure();
			var dozerCount = 0;
			var diggerCount = 0;
			var removedRobot = new Array();
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
			
			for(var i = removedRobot.length - 1; i >= 0; i--)
			{
				structure.splice(removedRobot[i], 1); // remove
			}
			
			colonyState.setRobotsAvailable(
				{
				controllers: colonyState.getRemainder("controlUnit") - dozerCount + diggerCount,
				dozer: colonyState.getRemainder("dozer") - dozerCount,
				digger: colonyState.getRemainder("digger") - diggerCount
				});
		}
		
		// produzione di base
		var _baseProductionSimulation = function(colonyState, graph)
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
		}
		
		// generatore di eventi (neglectPercentage)
		var _globalEventGeneration = function(colonyState, neglectPercentage, date)
		{
//TODO
			var ret = {};
			ret.date = date;
			// incidenti, catastrofi (distruzione o danneggiamento edifici, morti o feriti)
			// scoperte (nuove risorse, rovine ecc.)
			return ret;
		}
		
		// calcolo popolazione (nascite, ecc)
		var _populationComputation = function(colonyState, globalEventList, date)
		{	
//TODO: habitatUnit
			// totale popolazione
			var people = 0;
			var population = colonyState.getPopulation();
			var generations = population.registry;
			for(var i  = 0; i < generations.length; i++)
			{
				if(generations[i].getState(date) != GenerationState.Deads)
				{
					people += generations[i].getPopulation();
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
			
			wellnessAverage = (population.wellness + wellness) / 2;
			
			if(wellnessAverage == 1)
			{
				//nascite (se le condizioni sanitarie sono favorevoli)
				var nurseryUnit = colonyState.getRemainder("nurseryUnit");
				if(nurseryUnit > 0)
				{
					generations.push(new Generation(globalEventList.date, nurseryUnit));
				}
			}
			else if(wellnessAverage < 0)
			{
				// morti
				var dead = Math.floor(people * (1 - wellnessAverage));
				for(var i = 0; i < dead; i++)
				{
					registry[i % registry.length].kill();
				}
			}
			
			population.wellness = wellness;
			population.happiness = happiness;
			return globalEventList;
		}

		// gestione sistemi avanzati (terraforming ecc.)
		var _advanceSystemComputation = function(colonyState, globalEventList)
		{
//TODO
			return globalEventList;
		}

		// generazione log
		var _logEventGeneration = function(colonyState, globalEventList)
		{
			var log = {};
//TODO
			return log;
		}
		
		// simulazione
		var _simulation = function(colonyState, graph)
		{
			var date = colonyState.getDate();
			
			var result = {};
		
			colonyState.resetAll();
			_workforceSimulation(colonyState, date);
			_baseProductionSimulation(colonyState, graph);
			result["productionProgress"] = _productionSimulation(colonyState);
			result["researchProgress"] = _researchSimulation(colonyState);
			result["neglectPercentage"] = _maintenanceSimulation(colonyState, graph);
			
			return result;
		}
		
		var _computation = function(colonyState, graph, map)
		{
			var date = colonyState.getDate();
			
			var result = _simulation(colonyState, graph, date);
			var productionProgress = result["productionProgress"];
			var researchProgress = result["researchProgress"];
			var neglectPercentage = result["neglectPercentage"];
			//---
			_productionComputation(colonyState, productionProgress);
			_researchComputation(colonyState, researchProgress);
			_maintenanceComputation(colonyState, graph, map, neglectPercentage);
			_robotComputation(colonyState, graph, map);

			var globalEventList = _globalEventGeneration(colonyState, neglectPercentage, date);
			globalEventList = _advanceSystemComputation(colonyState, globalEventList);
			globalEventList = _populationComputation(colonyState, globalEventList, date);
			
			colonyState.updateAll();
			return _logEventGeneration(colonyState, globalEventList);
		}
		
		//-------------------------------------
		
		this.simulation = _simulation;
		this.computation = _computation;
	}
			
			// macro sistemi:
			//0) manutenzione
			//1) energia
			//		la potenza massima generabile (edifici generatori)
			//		la potenza richiesta (dagli edifici)
			//		la potenza da generare (utente)
			//2) supporto vitale
			//*		Aria, Acqua
			//		Edifici residenziali
			//3) produzione cibo
			//		Agridome
			//		Magazzini
			//4) produzione industriale
			//		Miniere
			//		Fonderie
			//		Sistemi di reciclo
			//*		Fabbriche
			//5) sociale
			//		scuole
			//		università
			//		centri commerciali
			//		strutture ricreative
			//6) edifici avanzati
			//*		laboratori
			//		terraforming
			//		missilistica