	function ReportProductionMaterial(colonyState, material, image)
	{
		var productionBuildingList = new Array();
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
		var consumptionBuildingList = new Array();
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
		
		var _printInfo = function(ctx, position, size)
		{
			var grid = new CanvasGrid(ctx, position, Colors.Standard, 16, [10, 10, 140, 50, 90, 80, 20, 60]);
			var row = 0;
			grid.setText(row, 0, TextRepository.get("Buildings"));
			grid.setText(row, 4, TextRepository.get("Active"));
			grid.setText(row, 5, TextRepository.get("Idle"));
			grid.setText(row, 6, TextRepository.get("Production"));
			
			var list = productionBuildingList;
			var totalProduction = 0;
			for(var i = 0; i < list.length; i++)
			{
				var active = (colonyState.getActiveList()[list[i]] || []).length;
				var idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var production = PrototypeLib.get(list[i]).getProduction()[material] * active;
				totalProduction += production;
				if(active + idle > 0)
				{
					row++;
					grid.setText(row, 1, TextRepository.get(list[i]));
					grid.setText(row, 4, active);		// # active
					if(idle > 0)
					{
						grid.setText(row, 5, idle, Colors.Error);			// # idle
					}
					else
					{
						grid.setText(row, 5, idle);			// # idle
					}
					grid.setValue(row, 7, production);	// production
				}
			}
			
			var list = consumptionBuildingList;
			var totalConsumption = 0;
			var activePipe = 0;
			var idlePipe = 0;
			var consumptionPipe = 0;
			var haveConsumption = false;
			for(var i = 0; i < list.length; i++)
			{
				var active = (colonyState.getActiveList()[list[i]] || []).length;
				var idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var consumption = PrototypeLib.get(list[i]).getConsumption()[material] * active;
				totalConsumption += consumption;
				if(PrototypeLib.get(list[i]).create({ x: 0, y: 0 }).isPipe())
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
							row++;
							ctx.fillRect(grid.getStartColumn(4), grid.getStartRow(row) + 8, grid.getStartColumn(8) - grid.getStartColumn(4), 1);
						}
						row++;
						grid.setText(row, 1, TextRepository.get(list[i]));
						grid.setText(row, 4, active);		// # active
						if(idle > 0)
						{
							grid.setText(row, 5, idle, Colors.Error);			// # idle
						}
						else
						{
							grid.setText(row, 5, idle);			// # idle
						}
						grid.setValue(row, 7, "-" + consumption, Colors.Error);	// consumption
						
						haveConsumption = true;
					}
				}
			}
			if(activePipe + idlePipe > 0)
			{
				if(!haveConsumption)
				{
					row++;
					row++;
					grid.setText(row, 4, TextRepository.get("Active"));
					grid.setText(row, 5, TextRepository.get("Idle"));
					grid.setText(row, 6, TextRepository.get("Consumption"));
				}
				row++;
				grid.setText(row, 1, TextRepository.get("Pipes"));
				grid.setText(row, 4, activePipe);		// # active
				if(idlePipe > 0)
				{
					grid.setText(row, 5, idlePipe, Colors.Error);			// # idle
				}
				else
				{
					grid.setText(row, 5, idlePipe);			// # idle
				}
				grid.setValue(row, 7, "-" + consumptionPipe, Colors.Error);	// consumption
				
				haveConsumption = true;
			}

			row++;
			ctx.fillRect(grid.getStartColumn(1), grid.getStartRow(row) + 8, grid.getStartColumn(8) - grid.getStartColumn(1), 1);
			
			row++;
			grid.setText(row, 0, TextRepository.get("Surplus"));
			if(totalProduction < totalConsumption)
			{
				grid.setValue(row, 7, totalProduction - totalConsumption, Colors.Error);
			}
			else
			{
				grid.setValue(row, 7, totalProduction - totalConsumption);	// total
			}
			
			row++;
			grid.setText(row, 0, TextRepository.get("Stored"));
			var capacity = colonyState.getCapacity(material);
			if(colonyState.isMetaMaterial(material))
			{
				capacity = "(" + capacity + ")";
			}
			var stored = (colonyState.getStored(material) || colonyState.getFullCapacity(material));
			if(stored >= capacity)
			{
				grid.setValue(row, 5, stored, Colors.Error);
			}
			else
			{
				grid.setValue(row, 5, stored);
			}
			grid.setValue(row, 6, "/");
			grid.setValue(row, 7, capacity);
		}
	
		this.printInfo = _printInfo;
		this.getName = function(){ return material; }
		this.getImageId = function(){ return image || material; }
	}
	
	function ReportMetaMaterial(colonyState, metaMaterial, image)
	{
		var _printInfo = function(ctx, position, size)
		{
			var grid = new CanvasGrid(ctx, position, Colors.Standard, 16, [10, 10, 140, 50, 90, 80, 20, 60]);
			var row = 0;
			grid.setText(row, 0, TextRepository.get("Materials"));
			grid.setText(row, 4, TextRepository.get("Production"));
			grid.setText(row, 5, TextRepository.get("Consumption"));
			grid.setText(row, 7, TextRepository.get("Stored"));
			
			var surplus = 0;
			var list = colonyState.getMaterialFromMetaMatrial(metaMaterial);
			for(var i = 0; i < list.length; i++)
			{
				row++;
				grid.setText(row, 1, TextRepository.get(list[i]));
				grid.setText(row, 4, colonyState.getProduced(list[i]));
				grid.setText(row, 5, colonyState.getConsumed(list[i]), Colors.Error);
				grid.setValue(row, 7, (colonyState.getStored(list[i]) || 0));
				
				surplus += (colonyState.getProduced(list[i]) - colonyState.getConsumed(list[i]));
			}
			
			row++
			ctx.fillRect(grid.getStartColumn(1), grid.getStartRow(row) + 8, grid.getStartColumn(8) - grid.getStartColumn(1), 1);
			
			row++
			grid.setText(row, 0, TextRepository.get("Surplus"));
			if(surplus < 0)
			{
				grid.setValue(row, 7, surplus, Colors.Error);
			}
			else
			{
				grid.setValue(row, 7, surplus);
			}
			
			row++;
			grid.setText(row, 0, TextRepository.get("Stored"));
			var capacity = colonyState.getCapacity(metaMaterial);
			var stored = colonyState.getFullCapacity(metaMaterial);
			if(stored >= capacity)
			{
				grid.setValue(row, 5, stored, Colors.Error);
			}
			else
			{
				grid.setValue(row, 5, stored);
			}
			grid.setValue(row, 6, "/");
			grid.setValue(row, 7, capacity);
		}
		
		this.printInfo = _printInfo;
		this.getName = function(){ return metaMaterial; }
		this.getImageId = function(){ return image || metaMaterial; }
	}
	
	function ReportMaintenance(colonyState, image)
	{
		var material = "repairUnit";
		
		var productionBuildingList = new Array();
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
		var consumptionBuildingList = new Array();
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
		
		var _printInfo = function(ctx, position, size)
		{
			var grid = new CanvasGrid(ctx, position, Colors.Standard, 16, [10, 10, 140, 50, 90, 80, 20, 60]);
			var row = 0;
			grid.setText(row, 0, TextRepository.get("Buildings"));
			grid.setText(row, 4, TextRepository.get("Active"));
			grid.setText(row, 5, TextRepository.get("Idle"));
			grid.setText(row, 6, TextRepository.get("Production"));
			
			var list = productionBuildingList;
			var totalProduction = 0;
			for(var i = 0; i < list.length; i++)
			{
				var active = (colonyState.getActiveList()[list[i]] || []).length;
				var idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var production = PrototypeLib.get(list[i]).getProduction()[material] * active;
				totalProduction += production;
				if(active + idle > 0)
				{
					row++;
					grid.setText(row, 1, TextRepository.get(list[i]));
					grid.setText(row, 4, active);		// # active
					if(idle > 0)
					{
						grid.setText(row, 5, idle, Colors.Error);			// # idle
					}
					else
					{
						grid.setText(row, 5, idle);			// # idle
					}
					grid.setValue(row, 7, production);	// production
				}
			}
			
			var list = consumptionBuildingList;
			var totalConsumption = 0;
			var activePipe = 0;
			var idlePipe = 0;
			var consumptionPipe = 0;
			row++;
			ctx.fillRect(grid.getStartColumn(4), grid.getStartRow(row) + 8, grid.getStartColumn(8) - grid.getStartColumn(4), 1);
			for(var i = 0; i < list.length; i++)
			{
				var active = (colonyState.getActiveList()[list[i]] || []).length;
				var idle = (colonyState.getInactiveList()[list[i]] || []).length;
				var consumption = PrototypeLib.get(list[i]).getConsumption()[material] * active;
				totalConsumption += consumption;
				if(PrototypeLib.get(list[i]).create({ x: 0, y: 0 }).isPipe())
				{
					activePipe += active;
					idlePipe += idle;
					consumptionPipe	+= consumption;
				}
				else
				{
					if(active + idle > 0)
					{
						row++;
						grid.setText(row, 1, TextRepository.get(list[i]));
						grid.setText(row, 4, active);		// # active
						if(idle > 0)
						{
							grid.setText(row, 5, idle, Colors.Error);			// # idle
						}
						else
						{
							grid.setText(row, 5, idle);			// # idle
						}
						grid.setValue(row, 7, "-" + consumption, Colors.Error);	// consumption
					}
				}
			}
			if(activePipe + idlePipe > 0)
			{
				row++;
				grid.setText(row, 1, TextRepository.get("Pipes"));
				grid.setText(row, 4, activePipe);		// # active
				if(idlePipe > 0)
				{
					grid.setText(row, 5, idlePipe, Colors.Error);			// # idle
				}
				else
				{
					grid.setText(row, 5, idlePipe);			// # idle
				}
				grid.setValue(row, 7, "-" + consumptionPipe, Colors.Error);	// consumption
				
				haveConsumption = true;
			}
			
			row++;
			var consumed = colonyState.getConsumed(material);
			totalConsumption += consumed;
			grid.setText(row, 1, TextRepository.get("Consumption"));
			grid.setValue(row, 7, "-" + consumed, Colors.Error);	// consumption
			
			row++;
			ctx.fillRect(grid.getStartColumn(1), grid.getStartRow(row) + 8, grid.getStartColumn(8) - grid.getStartColumn(1), 1);
			
			row++;
			grid.setText(row, 0, TextRepository.get("Surplus"));
			if(totalProduction <= totalConsumption)
			{
				grid.setValue(row, 7, totalProduction - totalConsumption, Colors.Error);
			}
			else
			{
				grid.setValue(row, 7, totalProduction - totalConsumption);	// total
			}
		}
	
		this.printInfo = _printInfo;
		this.getName = function(){ return material; }
		this.getImageId = function(){ return image || material; }
	}
	
	function ReportHumans(colonyState, image)
	{
		var _printInfo = function(ctx, position, size)
		{
			var grid = new CanvasGrid(ctx, position, Colors.Standard, 16, [10, 10, 140, 50, 90, 80, 20, 60]);
			var row = 0;
			
			grid.setText(row, 0, TextRepository.get("wellness"));
			grid.setValue(row, 7, colonyState.getPopulation().wellness);
			
			row++;
			grid.setText(row, 0, TextRepository.get("happiness"));
			grid.setValue(row, 7, colonyState.getPopulation().happiness);
			
			row++;
			row++;
			grid.setText(row, 0, TextRepository.get("Population"));
			
			//grid.setText(row, 4, TextRepository.get("Production"));
			//grid.setText(row, 5, TextRepository.get("Consumption"));
			//grid.setText(row, 7, TextRepository.get("Stored"));
			
			var date = colonyState.getDate();
			var generations = colonyState.getPopulation().registry;
			for(var i  = 0; i < generations.length; i++)
			{
				row++;
				grid.setText(row, 1, TextRepository.get(generations[i].getState(date)));
				//grid.setText(row, 4, );
				//grid.setText(row, 5, );
				grid.setText(row, 7, generations[i].getPopulation());
			}
			
			var surplus = 0;
			/*
			getPopulation()
			state.population = {
				registry: new Array(),
				wellness: 0,
				happiness: 0
				};
			var list = colonyState.getMaterialFromMetaMatrial(metaMaterial);
			for(var i = 0; i < list.length; i++)
			{
				row++;
				grid.setText(row, 1, TextRepository.get(list[i]));
				grid.setText(row, 4, colonyState.getProduced(list[i]));
				grid.setText(row, 5, colonyState.getConsumed(list[i]), Colors.Error);
				grid.setValue(row, 7, (colonyState.getStored(list[i]) || 0));
				
				surplus += (colonyState.getProduced(list[i]) - colonyState.getConsumed(list[i]));
			}*/
			
			row++
			ctx.fillRect(grid.getStartColumn(1), grid.getStartRow(row) + 8, grid.getStartColumn(8) - grid.getStartColumn(1), 1);
			
			row++
			grid.setText(row, 0, TextRepository.get("Surplus"));
			if(surplus < 0)
			{
				grid.setValue(row, 7, surplus, Colors.Error);
			}
			else
			{
				grid.setValue(row, 7, surplus);
			}
			
			row++;
			grid.setText(row, 0, TextRepository.get("Stored"));
			var capacity = 0;//colonyState.getCapacity(metaMaterial);
			var stored = 0;//colonyState.getFullCapacity(metaMaterial);
			if(stored >= capacity)
			{
				grid.setValue(row, 5, stored, Colors.Error);
			}
			else
			{
				grid.setValue(row, 5, stored);
			}
			grid.setValue(row, 6, "/");
			grid.setValue(row, 7, capacity);
		}
		
		this.printInfo = _printInfo;
		this.getName = function(){ return "Humans"; }
		this.getImageId = function(){ return image || "Humans"; }
	}
	
	function ReportQueueData(colonyState)
	{
		var queue = new Array();
		var available = new Array();
//TODO
		queue.push(new ReportMaintenance(colonyState, "Pipes"));
		queue.push(new ReportProductionMaterial(colonyState, "power", "Power" ));
		queue.push(new ReportHumans(colonyState, "Humans"));
		queue.push(new ReportProductionMaterial(colonyState, "foodUnit", "Hydroponics"));
		//queue.push(new ReportRobots(colonyState, "Pipes")); //TODO
		queue.push(new ReportMetaMaterial(colonyState, "roboticStorage", "Pipes"));
		queue.push(new ReportMetaMaterial(colonyState, "genericStorage", "Pipes"));
		queue.push(new ReportMetaMaterial(colonyState, "radioactiveStorage", "PipesWaste"));
		
		//available.push(???);
		
		QueueData.call(this, queue, available);
		
		var _printInfo = function(ctx, position, size, item)
		{
			if(item != null)
			{
				ctx.beginPath();

				var topInfo = position.y + 10;
				var leftInfo = position.x + 10;
				
				//-------
				
				var img = ImagesLib.getImage(item.getImageId());
				ctx.drawImage(img, leftInfo, topInfo, img.width, img.height);
				ctx.lineWidth = "1px";
				ctx.strokeStyle = Colors.Standard;
				ctx.strokeRect(leftInfo, topInfo, img.width, img.height);
				
				ctx.font = 20 + "px Arial";
				ctx.fillText(TextRepository.get(item.getName()), leftInfo + img.width + 10, topInfo + 20);
				ctx.font = 16 + "px Arial";
				ctx.mlFillText(TextRepository.get(item.getName() + "Description"), leftInfo + img.width + 10, topInfo + 24, size.x - img.width - 30, img.height - 24 - 2, 'top', 'left', 16);

				item.printInfo(ctx, {x: leftInfo, y: topInfo + img.height + 10}, { x: size.x - 20, y: size.y - (topInfo + img.height + 10) });
				
				//-------
			
				ctx.closePath();
				ctx.fill();
			}
		}
	
		this.printInfo = _printInfo;
		this.isSortable = function() { return false; };
		this.getTitle = function() { return "ReportTitle"; };
		this.getQueueTitle = function() { return "ReportBase"; };
		this.getAvailableTitle = function() { return "ReportEvents"; };
	}
	ReportQueueData.inherits(QueueData);