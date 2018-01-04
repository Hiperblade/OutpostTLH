"use strict";

	// calcolo manutenzione
	function MaintenanceEngine()
	{
		let _simulation = function(colonyState, graphs)
		{
			// costo manutenzione
			let repairCost = 10;

			let buildingAmount = 0;
			for(let i = 0; i < graphs.length; i++)
			{
				if(BuildingGraph.hasHeadquarter(graphs[i]))
				{
					for(let buildingType in graphs[i])
					{
						if(graphs[i].hasOwnProperty(buildingType))
						{
							buildingAmount += graphs[i][buildingType].length;
						}
					}	
				}
			}

			let neglectPercentage;
			let costAmount = buildingAmount * repairCost;
			if(colonyState.haveMaterials({ repairUnit: costAmount }))
			{
				colonyState.delMaterials({ repairUnit: costAmount });
				neglectPercentage = 0;
			}
			else
			{
				let tmp = colonyState.getRemainder("repairUnit");
				colonyState.delMaterials({ repairUnit: tmp });
				neglectPercentage = ((costAmount - tmp) * 100) / costAmount;
			}

			colonyState.getSimulationData().neglectPercentage = neglectPercentage;
		};

		let _computation = function(colonyState, graphs, map)
		{
			let neglectPercentage = colonyState.getSimulationData().neglectPercentage;
			let reapairAmount = 20;
			let damageVariance = 6;
			let damageAmount = 0;
				 if(neglectPercentage < 20) { damageAmount = 0;   }
			else if(neglectPercentage < 40) { damageAmount = 10;  }
			else if(neglectPercentage < 80) { damageAmount = 50;  }
			else							{ damageAmount = 100; }

			let integrity;
			let buildingType;
			for(let i = 0; i < graphs.length; i++)
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

											let eventDestroy = PrototypeLib.get(tmp.getBuildingType()).eventDestroy;
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

					for(let ii = 0; ii < graphs[i].length; ii++)
					{
						graphs[i][ii].progress();
					}

					//costruzione edifici
					let buildList = colonyState.getBuildList();
					for(let iii = 0; iii < buildList.length; iii++)
					{
						if(buildList[iii].progressBuild())
						{
							let eventEndBuilding = PrototypeLib.get(buildList[iii].getBuildingType()).eventEndBuilding;
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

										let eventDestroy = PrototypeLib.get(tmp.getBuildingType()).eventDestroy;
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