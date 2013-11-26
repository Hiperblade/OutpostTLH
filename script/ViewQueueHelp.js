	function HelpTutorial()
	{
		var _getText = function()
		{
			return "HelpTutorial_Base";
		};
	
		this.getName = function(){ return "HelpTutorial_Base"; };
		this.getImageId = function(){ return "button_help"; };
		this.getText = _getText;
	}
	
	function HelpTutorialBuilding(name, image)
	{
		this.getName = function(){ return name; };
		this.getImageId = function(){ return image; };
	}
	
	function HelpQueueData(colonyState)
	{
		var queue = [new HelpTutorial()];
		var available = [];
	
		var technology = colonyState.getTechnology();
		for(var i = 0; i < technology.length; i++)
		{
			var item = PrototypeLib.get(technology[i]);
			available.push(new HelpTutorialBuilding(technology[i], item.getBuildingImageId()));
		}
	
		QueueData.call(this, queue, available);
		
		this.printInfo = function(ctx, position, size, item)
		{
			if(item != null)
			{
				ctx.beginPath();

				var topInfo = position.y + 10;
				var leftInfo = position.x + 10;

                var img;
                var imgSize;
				if(item.getText != undefined)
				{
					img = ImagesLib.getImage(item.getImageId());
                    imgSize = GetImageSize(img);
					ctx.drawImage(img, leftInfo, topInfo, imgSize.width, imgSize.height);
					ctx.lineWidth = "1px";
					ctx.strokeStyle = Colors.Standard;
					ctx.strokeRect(leftInfo, topInfo, imgSize.width, imgSize.height);
				
					ctx.font = 20 + "px Arial";
					ctx.fillText(TextRepository.get(item.getName()), leftInfo + imgSize.width + 10, topInfo + 28);
				
					ctx.font = 16 + "px Arial";

					ctx.mlFillText(TextRepository.get(item.getName() + "Description"), leftInfo, topInfo + imgSize.height + 10, size.x - 20, size.y - (imgSize.height * 2) - 40, 'top', 'left', 16);
				}
				else
				{
					var baseTile = ImagesLib.getImage("baseTile");
					img = ImagesLib.getImage(item.getImageId());
                    imgSize = GetImageSize(img);
					ctx.drawImage(baseTile, leftInfo, topInfo - baseTile.height + imgSize.height, baseTile.width, baseTile.height);
					ctx.drawImage(img, leftInfo, topInfo, imgSize.width, imgSize.height);
					
					ctx.font = 20 + "px Arial";
					ctx.fillText(TextRepository.get(item.getName()), leftInfo + imgSize.width + 10, topInfo + 20);
						
					ctx.font = 16 + "px Arial";

					ctx.mlFillText(TextRepository.get(item.getName() + "Description"), leftInfo + imgSize.width + 10, topInfo + 24, size.x - imgSize.width - 30, imgSize.height - 24 - 2, 'top', 'left', 16);
					
					//-------
					
					var proto = PrototypeLib.get(item.getName());
					
					var grid = new CanvasGrid(ctx, {x: leftInfo, y: topInfo + imgSize.height + 10}, 16, [10, 10, 140, 50, 30, 20, 30]);
					var row = 0;
					grid.setText(row, 0, TextRepository.get("TerrainLayer") + ":");
					grid.setText(row, 4, TextRepository.get(proto.getTerrainLayer()));

                    var listItem;
					if(proto.getBuildingTime() > 0 || Object.keys(proto.getBuildingCost()).length > 0)
					{
						row++;
						grid.setText(row, 0, TextRepository.get("BuildingTitle"));
						
						row++;
						grid.setText(row, 1, TextRepository.get("BuildingTime") + ":");
						grid.setValue(row, 4, proto.getBuildingTime());
					
						var list = proto.getBuildingCost();
						if(Object.keys(list).length > 0)
						{
							row++;
							grid.setText(row, 1, TextRepository.get("BuildingCost") + ":");
							for (listItem in list)
							{
                                if(list.hasOwnProperty(listItem))
                                {
                                    row++;
                                    grid.setText(row, 2, TextRepository.get(listItem));
                                    grid.setValue(row, 4, list[listItem]);
                                }
							}
						}
					}
					
					list = proto.getCapacity();
					if(Object.keys(list).length > 0)
					{
						row++;
						grid.setText(row, 0, TextRepository.get("BuildingCapacity"));
						for (listItem in list)
						{
                            if(list.hasOwnProperty(listItem))
                            {
                                row++;
                                grid.setText(row, 1, TextRepository.get(listItem));
                                grid.setValue(row, 4, list[listItem]);
                            }
						}
					}
					
					if((Object.keys(proto.getConsumption()).length +
						Object.keys(proto.getProduction()).length +
						Object.keys(proto.getProductionWaste()).length) > 0)
					{
						row++;
						grid.setText(row, 0, TextRepository.get("ProductionTitle"));
					
						list = proto.getConsumption();
						if(Object.keys(list).length > 0)
						{
							row++;
							grid.setText(row, 1, TextRepository.get("BuildingConsumption") + ":");
							for (listItem in list)
							{
                                if(list.hasOwnProperty(listItem))
                                {
								    row++;
								    grid.setText(row, 2, TextRepository.get(listItem));
								    grid.setValue(row, 4, list[listItem]);
                                }
							}
						}
						
						list = proto.getProduction();
						if(Object.keys(list).length > 0)
						{
							row++;
							grid.setText(row, 1, TextRepository.get("BuildingProduction") + ":");
							for (listItem in list)
							{
                                if(list.hasOwnProperty(listItem))
                                {
                                    row++;
                                    grid.setText(row, 2, TextRepository.get(listItem));
                                    grid.setValue(row, 4, list[listItem]);
                                }
							}
						}
						
						list = proto.getProductionWaste();
						if(Object.keys(list).length > 0)
						{
							row++;
							grid.setText(row, 1, TextRepository.get("BuildingWaste") + ":");
							for (listItem in list)
							{
                                if(list.hasOwnProperty(listItem))
                                {
                                    row++;
                                    grid.setText(row, 2, TextRepository.get(listItem));
                                    grid.setValue(row, 4, list[listItem]);
                                }
							}
						}
					}
					
					if(proto.getRequiredResource() != null)
					{
						row++;
						grid.setText(row, 0, TextRepository.get("Requirements") + ":");
						grid.setText(row, 4, TextRepository.get(proto.getRequiredResource()));
					}

					//-------
				}
			
				ctx.closePath();
				ctx.fill();
			}
		};

		this.isSortable = function() { return false; };
		this.getTitle = function() { return "HelpTitle"; };
		this.getQueueTitle = function() { return "HelpBase"; };
		this.getAvailableTitle = function() { return "Buildings"; };
	}
	HelpQueueData.inherits(QueueData);
	