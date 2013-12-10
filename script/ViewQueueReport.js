	function ReportProductionMaterial(colonyState, material, image)
	{
		var productionBuildingList = [];
		PrototypeLib.getPriorityList().forEach(function(buildingType)
		{
			var buildingProtype = PrototypeLib.get(buildingType);
			var product = buildingProtype.getProduction();
			for (var listItem in product)
			{
				if(listItem == material)
				{
					productionBuildingList.push(buildingType);
				}
			}
		});
		var consumptionBuildingList = [];
		PrototypeLib.getPriorityList().forEach(function(buildingType)
		{
			var buildingProtype = PrototypeLib.get(buildingType);
			var product = buildingProtype.getConsumption();
			for (var listItem in product)
			{
				if(listItem == material)
				{
					consumptionBuildingList.push(buildingType);
				}
			}
		});

		this.getItemInfo = function()
		{
			var text = "";
			text += '<table>';
			text += '<tr><td class="tableMainColumn">' + TextRepository.get("Buildings") + '</td><td class="tableDataColumn">' + TextRepository.get("Active") + '</td><td class="tableDataColumn">' + TextRepository.get("Idle") + '</td><td class="tableDataColumn">' + TextRepository.get("Production") + '</td></tr>';

			var list;
			list = productionBuildingList;
			var totalProduction = 0;
			var i, active, idle;
			for(i = 0; i < list.length; i++)
			{
				active = (colonyState.getActiveList()[list[i]] || []).length;
				idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var production = PrototypeLib.get(list[i]).getProduction()[material] * active;
				totalProduction += production;
				if(active + idle > 0)
				{
					text += '<tr><td>' + TextRepository.get(list[i]) + '</td><td class="tableDataRight">' + active + '</td>';
					if(idle > 0)
					{
						text += '<td class="tableDataRight colorError">' + idle + '</td>';
					}
					else
					{
						text += '<td class="tableDataRight">' + idle + '</td>';
					}
					text += '<td class="tableDataRight">' + production + '</td></tr>';
				}
			}

			list = consumptionBuildingList;
			var totalConsumption = 0;
			var activePipe = 0;
			var idlePipe = 0;
			var consumptionPipe = 0;
			var haveConsumption = false;
			for(i = 0; i < list.length; i++)
			{
				active = (colonyState.getActiveList()[list[i]] || []).length;
				idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var consumption = PrototypeLib.get(list[i]).getConsumption()[material] * active;
				totalConsumption += consumption;

				if(PrototypeLib.get(list[i]).createItem({ x: 0, y: 0 }).isPipe())
				{
					activePipe += active;
					idlePipe += idle;
					consumptionPipe	+= consumption;
				}
				else
				{
					if(active + idle > 0)
					{
						if(!haveConsumption)
						{
							text += '<tr><td colspan="4" class="tableSeparator"></td></tr>';
						}

						text += '<tr><td>' + TextRepository.get(list[i]) + '</td><td class="tableDataRight">' + active + '</td>';
						if(idle > 0)
						{
							text += '<td class="tableDataRight colorError">' + idle + '</td>';
						}
						else
						{
							text += '<td class="tableDataRight">' + idle + '</td>';
						}
						text += '<td class="tableDataRight colorError">-' + consumption + '</td></tr>';

						haveConsumption = true;
					}
				}
			}
			if(activePipe + idlePipe > 0)
			{
				if(!haveConsumption)
				{
					text += '<tr><td></td><td>' + TextRepository.get("Active") + '</td><td>' + TextRepository.get("Idle") + '</td><td>' + TextRepository.get("Consumption") + '</td></tr>';
				}

				text += '<tr><td>' + TextRepository.get("Pipes") + '</td><td class="tableDataRight">' + activePipe + '</td>';
				if(idlePipe > 0)
				{
					text += '<td class="tableDataRight colorError">' + idlePipe + '</td>';
				}
				else
				{
					text += '<td class="tableDataRight">' + idlePipe + '</td>';
				}
				text += '<td class="tableDataRight colorError">-' + consumptionPipe + '</td></tr>';

				//haveConsumption = true;
			}

			text += '<tr><td colspan="4" class="tableSeparator"></td></tr>';

			text += '<tr><td>' + TextRepository.get("Surplus") + '</td><td></td><td></td>';
			if(totalProduction < totalConsumption)
			{
				text += '<td class="tableDataRight colorError">' + (totalProduction - totalConsumption) + '</td>';
			}
			else
			{
				text += '<td class="tableDataRight">' + (totalProduction - totalConsumption) + '</td>';	// total
			}
			text += '</tr>';

			text += '<tr><td>' + TextRepository.get("Stored") + '</td><td></td><td></td>';
			var capacity = colonyState.getCapacity(material);
			var stored = (colonyState.getStored(material) || colonyState.getFullCapacity(material));
			if(stored >= capacity)
			{
				text += '<td class="tableDataRight colorError">' + stored + '/';
			}
			else
			{
				text += '<td class="tableDataRight">' + stored + '/';
			}
			if(colonyState.isMetaMaterial(material))
			{
				text += '(' + capacity + ')</td>';
			}
			else
			{
				text += capacity + '</td>';
			}
			text += '</tr>';

			text += '</table>';
			return text;
		};

		this.getName = function(){ return material; };
		this.getImageId = function(){ return image || material; };
	}

	function ReportMetaMaterial(colonyState, metaMaterial, image)
	{
		this.getItemInfo = function()
		{
			var text = "";
			text += '<table>';
			text += '<tr><td class="tableMainColumn">' + TextRepository.get("Materials") + '</td><td class="tableDataColumn">' + TextRepository.get("Production") + '</td><td class="tableDataColumn">' + TextRepository.get("Consumption") + '</td><td class="tableDataColumn">' + TextRepository.get("Stored") + '</td></tr>';

			var surplus = 0;
			var list = colonyState.getMaterialFromMetaMaterial(metaMaterial);
			for(var i = 0; i < list.length; i++)
			{
				text += '<tr><td>' + TextRepository.get(list[i]) + '</td><td class="tableDataRight">' + colonyState.getProduced(list[i]) + '</td><td class="tableDataRight colorError">' + colonyState.getConsumed(list[i]) + '</td><td class="tableDataRight">' + (colonyState.getStored(list[i]) || 0) + '</td></tr>';
				surplus += (colonyState.getProduced(list[i]) - colonyState.getConsumed(list[i]));
			}

			text += '<tr><td colspan="4" class="tableSeparator"></td></tr>';

			text += '<tr><td>' + TextRepository.get("Surplus") + '</td><td></td><td></td>';
			if(surplus < 0)
			{
				text += '<td class="tableDataRight colorError">' + surplus + '</td>';
			}
			else
			{
				text += '<td class="tableDataRight">' + surplus + '</td>';	// total
			}
			text += '</tr>';

			text += '<tr><td>' + TextRepository.get("Stored") + '</td><td></td><td></td>';
			var capacity = colonyState.getCapacity(metaMaterial);
			var stored = (colonyState.getStored(metaMaterial) || colonyState.getFullCapacity(metaMaterial));
			if(stored >= capacity)
			{
				text += '<td class="tableDataRight colorError">' + stored + '/' + capacity + '</td>';
			}
			else
			{
				text += '<td class="tableDataRight">' + stored + '/' + capacity + '</td>';
			}
			text += '</tr>';

			text += '</table>';
			return text;
		};

		this.getName = function(){ return metaMaterial; };
		this.getImageId = function(){ return image || metaMaterial; };
	}

	function ReportMaintenance(colonyState, image)
	{
		var material = "repairUnit";

		var productionBuildingList = [];
		PrototypeLib.getPriorityList().forEach(function(buildingType)
		{
			var buildingPrototype = PrototypeLib.get(buildingType);
			var product = buildingPrototype.getProduction();
			for (var listItem in product)
			{
				if(listItem == material)
				{
					productionBuildingList.push(buildingType);
				}
			}
		});
		var consumptionBuildingList = [];
		PrototypeLib.getPriorityList().forEach(function(buildingType)
		{
			var buildingPrototype = PrototypeLib.get(buildingType);
			var product = buildingPrototype.getConsumption();
			for (var listItem in product)
			{
				if(listItem == material)
				{
					consumptionBuildingList.push(buildingType);
				}
			}
		});

		this.getItemInfo = function()
		{
			var text = "";
			text += '<table>';
			text += '<tr><td class="tableMainColumn">' + TextRepository.get("Buildings") + '</td><td class="tableDataColumn">' + TextRepository.get("Active") + '</td><td class="tableDataColumn">' + TextRepository.get("Idle") + '</td><td class="tableDataColumn">' + TextRepository.get("Production") + '</td></tr>';

			var list;
			list = productionBuildingList;
			var i, active, idle;
			var totalProduction = 0;
			for(i = 0; i < list.length; i++)
			{
				active = (colonyState.getActiveList()[list[i]] || []).length;
				idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var production = PrototypeLib.get(list[i]).getProduction()[material] * active;
				totalProduction += production;
				if(active + idle > 0)
				{
					text += '<tr><td>' + TextRepository.get(list[i]) + '</td><td class="tableDataRight">' + active + '</td>';
					if(idle > 0)
					{
						text += '<td class="tableDataRight colorError">' + idle + '</td>';
					}
					else
					{
						text += '<td class="tableDataRight">' + idle + '</td>';
					}
					text += '<td class="tableDataRight">' + production + '</td></tr>';
				}
			}

			text += '<tr><td colspan="4" class="tableSeparator"></td></tr>';

			list = consumptionBuildingList;
			var totalConsumption = 0;
			var activePipe = 0;
			var idlePipe = 0;
			var consumptionPipe = 0;
			for(i = 0; i < list.length; i++)
			{
				active = (colonyState.getActiveList()[list[i]] || []).length;
				idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var consumption = PrototypeLib.get(list[i]).getConsumption()[material] * active;
				totalConsumption += consumption;
				if(PrototypeLib.get(list[i]).createItem({ x: 0, y: 0 }).isPipe())
				{
					activePipe += active;
					idlePipe += idle;
					consumptionPipe	+= consumption;
				}
				else
				{
					if(active + idle > 0)
					{
						text += '<tr><td>' + TextRepository.get(list[i]) + '</td><td class="tableDataRight">' + active + '</td>';
						if(idle > 0)
						{
							text += '<td class="tableDataRight colorError">' + idle + '</td>';
						}
						else
						{
							text += '<td class="tableDataRight">' + idle + '</td>';
						}
						text += '<td class="tableDataRight colorError">-' + consumption + '</td></tr>';
					}
				}
			}
			if(activePipe + idlePipe > 0)
			{
				text += '<tr><td>' + TextRepository.get("Pipes") + '</td><td class="tableDataRight">' + activePipe + '</td>';
				if(idlePipe > 0)
				{
					text += '<td class="tableDataRight colorError">' + idlePipe + '</td>';
				}
				else
				{
					text += '<td class="tableDataRight">' + idlePipe + '</td>';
				}
				text += '<td class="tableDataRight colorError">-' + consumptionPipe + '</td></tr>';

				//haveConsumption = true;
			}

			var consumed = colonyState.getConsumed(material);
			totalConsumption += consumed;
			text += '<tr><td>' + TextRepository.get("Consumption") + '</td><td></td><td></td><td class="tableDataRight colorError">-' + consumed + '</td></tr>';

			text += '<tr><td colspan="4" class="tableSeparator"></td></tr>';

			text += '<tr><td>' + TextRepository.get("Surplus") + '</td><td></td><td></td>';
			if(totalProduction <= totalConsumption)
			{
				text += '<td class="tableDataRight colorError">' + (totalProduction - totalConsumption) + '</td>';
			}
			else
			{
				text += '<td class="tableDataRight">' + (totalProduction - totalConsumption) + '</td>';	// total
			}
			text += '</tr>';

			text += '</table>';
			return text;
		};

		this.getName = function(){ return material; };
		this.getImageId = function(){ return image || material; };
	}

	function ReportHumans(colonyState, image)
	{
		this.getItemInfo = function()
		{
			var text = "";
			text += '<table>';
			text += '<tr><td class="tableMainColumn">' + TextRepository.get("subsistence") + '</td><td class="tableDataColumn"></td><td class="tableDataColumn"></td><td class="tableDataRight">' + colonyState.getPopulation().subsistence + '</td></tr>';
			text += '<tr><td>' + TextRepository.get("wellness") + '</td><td></td><td></td><td class="tableDataRight">' + colonyState.getPopulation().wellness + '</td></tr>';
			text += '<tr><td>' + TextRepository.get("happiness") + '</td><td></td><td></td><td class="tableDataRight">' + colonyState.getPopulation().happiness + '</td></tr>';

			text += '<tr><td>' + TextRepository.get("Population") + ':</td></tr>';

			var date = colonyState.getDate();
			var generations = colonyState.getPopulation().registry;
			for(var i  = 0; i < generations.length; i++)
			{
				text += '<tr><td>' + TextRepository.get(generations[i].getState(date)) + '</td><td></td><td></td><td class="tableDataRight">' + generations[i].getPopulation() + '</td></tr>';
			}

			text += '<tr><td colspan="4" class="tableSeparator"></td></tr>';

			var surplus = 0;
			/*
			 getPopulation()
			 state.population = {
			 registry: [],
			 wellness: 0,
			 happiness: 0
			 };
			 var list = colonyState.getMaterialFromMetaMaterial(metaMaterial);
			 for(var i = 0; i < list.length; i++)
			 {
			 row++;
			 grid.setText(row, 1, TextRepository.get(list[i]));
			 grid.setText(row, 4, colonyState.getProduced(list[i]));
			 grid.setText(row, 5, colonyState.getConsumed(list[i]), Colors.Error);
			 grid.setValue(row, 7, (colonyState.getStored(list[i]) || 0));

			 surplus += (colonyState.getProduced(list[i]) - colonyState.getConsumed(list[i]));
			 }*/

			text += '<tr><td>' + TextRepository.get("Surplus") + '</td><td></td><td></td>';
			if(surplus < 0)
			{
				text += '<td class="tableDataRight colorError">' + surplus + '</td>';
			}
			else
			{
				text += '<td class="tableDataRight">' + surplus + '</td>';	// total
			}
			text += '</tr>';

			text += '<tr><td>' + TextRepository.get("Stored") + '</td><td></td><td></td>';
			var capacity = 0;//colonyState.getCapacity(metaMaterial);
			var stored = 0;//(colonyState.getStored(metaMaterial) || colonyState.getFullCapacity(metaMaterial));
			if(stored >= capacity)
			{
				text += '<td class="tableDataRight colorError">' + stored + '/' + capacity + '</td>';
			}
			else
			{
				text += '<td class="tableDataRight">' + stored + '/' + capacity + '</td>';
			}
			text += '</tr>';

			text += '</table>';
			return text;
		};

		this.getName = function(){ return "Humans"; };
		this.getImageId = function(){ return image || "Humans"; }
	}

	function ReportQueueData(colonyState)
	{
		var queue = [];
		var available = [];

		queue.push(new ReportMaintenance(colonyState, "Pipes"));
		queue.push(new ReportProductionMaterial(colonyState, "power", "Power" ));
		queue.push(new ReportHumans(colonyState, "Humans"));
		queue.push(new ReportProductionMaterial(colonyState, "foodUnit", "Hydroponics"));
		//queue.push(new ReportRobots(colonyState, "Pipes")); //TODO
		queue.push(new ReportMetaMaterial(colonyState, "roboticStorage", "Pipes"));
		queue.push(new ReportMetaMaterial(colonyState, "genericStorage", "Pipes"));
		queue.push(new ReportMetaMaterial(colonyState, "radioactiveStorage", "PipesWaste"));

		QueueData.call(this, queue, available);

		this.getInfo = function(item)
		{
			var text = "";
			text += '<div class="queueInfo">';
			text += '<div class="queueInfoTitle">';
			text += '<img class="queueInfoTitleImage" src="' + ImagesLib.getFileName(item.getImageId()) + '">';
			text += '<div class="queueInfoTitleData">';
			text += '<div class="queueInfoTitleName">' + TextRepository.get(item.getName()) + '</div>';
			text += '<div class="queueInfoTitleDescription">' + TextRepository.get(item.getName() + "Description") + '</div>';
			text += '</div>';
			text += '</div>';

			text += '<div class="queueInfoDetails">';

			text += item.getItemInfo();

			text += '</div>';
			text += '</div>';
			return text;
		};

		this.isSortable = function() { return false; };
		this.getTitle = function() { return "ReportTitle"; };
		this.getQueueTitle = function() { return "ReportBase"; };
		this.getAvailableTitle = function() { return "ReportEvents"; };
	}
	ReportQueueData.inherits(QueueData);