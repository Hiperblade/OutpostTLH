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