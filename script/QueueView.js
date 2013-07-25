	function QueueView(divId, canvasId, size)
	{
		const COLUMN_WIDTH = 300;
		const COLUMN_SLIDER_WIDTH = 20;
		var divViewBase = document.getElementById(divId + "_wrapper");
		var divView = document.getElementById(divId);
		var divViewContent = document.getElementById(divId + "_content");
		var divViewSlider = document.getElementById(divId + "_slider");
		var divViewSliderCursor = document.getElementById(divId + "_sliderCursor");
		var canvasView = document.getElementById(canvasId);
		var ctx = canvasView.getContext("2d");
		var size = size;
		var buttonBase = null;
		var currentItem = null;
		var tagLastId = 0;
		var tags = {};
		var tagsNew = {};
		
		var _initialize = function()
		{
			canvasView.width = size.x; //senza "px"
			canvasView.height = size.y; //senza "px"
			
			divView.style.width = (COLUMN_WIDTH - COLUMN_SLIDER_WIDTH) + "px";
			divView.style.height = size.y + "px";
		
			divViewSlider.style.width = COLUMN_SLIDER_WIDTH + "px";
			divViewSlider.style.height = size.y + "px";
			
			buttonBase = ImagesLib.getImage("button_base");
			canvasView.addEventListener("mousedown", _doMouseDown, false);
			
			divViewSliderCursor.style.width = COLUMN_SLIDER_WIDTH - 8 + "px";
			divViewSliderCursor.style.height = COLUMN_SLIDER_WIDTH - 8 + "px";
			
			_hide();
			
			// Slider
			var scrollPane = $('#' + divId);
			var scrollContent = $('#' + divId + "_content");
			
			$('#' + divId + "_slider").slider({
				orientation: "vertical",
				value: 100,
				slide: function (event, ui) {
					var topMargin = parseInt(canvasView.style.top) + 3;
					var cursorPosition = Math.floor((100 - ui.value) * scrollPane.height() / 100);
					if(cursorPosition < topMargin)
					{
						cursorPosition = topMargin;
					}
					else if(cursorPosition > scrollPane.height() - (COLUMN_SLIDER_WIDTH - 13) - 3)
					{
						cursorPosition = scrollPane.height() - (COLUMN_SLIDER_WIDTH - 13) - 3;
					}
					divViewSliderCursor.style.top = cursorPosition + "px";

					if (scrollContent.height() > scrollPane.height())
					{
						scrollContent.css("margin-top", (-1 * (scrollPane.height() - ((scrollPane.height() * ui.value) / 100))) + "px");
					}
					else
					{
						scrollContent.css("margin-top", 0);
					}
				}
			});
		}
		
		var _doMouseDown = function(e)
		{
			if((e.pageX >= canvasView.width - 40) && (e.pageX <= canvasView.width - 40 + buttonBase.width) &&
				(e.pageY >= canvasView.height - 10 - buttonBase.height) && (e.pageY <= canvasView.height - 10))
			{
				_hide();
			}
		}
			
		var _setAbsolutePosition = function(point)
		{
			canvasView.style.left = point.x + "px";
			canvasView.style.top = point.y + "px";
			
			divView.style.left = point.x + "px";
			divView.style.top = point.y + "px";
			
			divViewSlider.style.left = (point.x + COLUMN_WIDTH - COLUMN_SLIDER_WIDTH) + "px";
			divViewSlider.style.top = point.y + "px";
			
			divViewSliderCursor.style.left = (point.x + COLUMN_WIDTH - COLUMN_SLIDER_WIDTH + 4) + "px";
			divViewSliderCursor.style.top = point.y + 3 + "px";
		}
		
		var _hide = function()
		{
			hidden = true;
			_redraw();
		}
		
		var _show = function(queueDataNew)
		{
			queueData = queueDataNew;
			_inizializeQueue();
			
			hidden = false;
			if(queueData.getQueue().length > 0)
			{
				currentItem = queueData.getQueue()[0];
			}
			else
			{
				currentItem = null;
			}
			_redraw();
		}
		
		var _inizializeQueue = function()
		{
			divViewContent.innerHTML = "";
				
			var divUp = document.createElement('div');
			var divDown = document.createElement('div');
			
			var li;
			var ul = document.createElement('ul');
			ul.id = "sortableInternalList";
			ul.style.listStyleType = "none";
			ul.style.margin = "0px";
			ul.style.padding = "0px";
			
			tagLastId = 0;
			tags = {};
			tagsNew = {};
			
			// Separatore
			li = document.createElement('li');
			li.style.margin = "0px";
			li.style.padding = "0px";
			li.style.lineHeight = "0px";
			li.className = "listSeparator";
			li.appendChild(_createSeparatorCanvas(queueData.getQueueTitle()));
			li.id = "SortedItemSeparator";
			ul.appendChild(li);
			
			var haveBar = queueData.haveBar();
			var queue = queueData.getQueue();
			for(var i = 0; i < queue.length; i++)
			{
				li = document.createElement('li');
				li.style.margin = "0px";
				li.style.padding = "0px";
				li.style.lineHeight = "0px";
				li.appendChild(_createCanvas(queue[i], false, haveBar));
				li.id = "SortedItem_" + tagLastId++;
				ul.appendChild(li);
				
				tags[li.id] = queue[i];
			}
			divUp.appendChild(ul);

			//--- new
			ul = document.createElement('ul');
			ul.id = "sortableInternalList";
			ul.style.listStyleType = "none";
			ul.style.margin = "0px";
			ul.style.padding = "0px";
			
			var newItems = queueData.getAvailable();
			if(newItems.length > 0)
			{
				needSeparator = false;
			
				// Separatore
				li = document.createElement('li');
				li.style.margin = "0px";
				li.style.padding = "0px";
				li.style.lineHeight = "0px";
				li.className = "listSeparator";
				li.appendChild(_createSeparatorCanvas(queueData.getAvailableTitle()));
				li.id = "SortedItemSeparator";
				ul.appendChild(li);
			}
			var canAppends = queueData.canAppends();
			for(var i = 0; i < newItems.length; i++)
			{		
				var newItem = newItems[i];
				li = document.createElement('li');
				li.style.margin = "0px";
				li.style.padding = "0px";
				li.style.lineHeight = "0px";
				li.appendChild(_createCanvas(newItem, canAppends, false));
				li.id = "SortedItem_" + newItem.getName();
				ul.appendChild(li);
				
				tags[li.id] = newItem;
				tagsNew[li.id] = newItems[i];
			}
			divDown.appendChild(ul);

			divViewContent.appendChild(divUp);
			divViewContent.appendChild(divDown);
			
			if(queueData.isSortable())
			{
				$("#sortableInternalList").sortable(
					{
					update : function ()
						{
							queue.length = 0;
							var order = $("#sortableInternalList").sortable("toArray");
							for(var i = 0; i < order.length; i++)
							{
								var tag = tags[order[i]];
								if(tag == null)
								{
									return;
								}
								queue.push(tag);
							}
						},
					items: "li:not(.listSeparator)"
					});
				$("#sortableInternalList").disableSelection();
			}
			
			// Slider
			var scrollContent = $('#' + divId + "_content");
			
			// Azzeramento barra di scorrimento
			divViewSliderCursor.style.top = (parseInt(canvasView.style.top) + 3) + "px";
			scrollContent.css("margin-top", 0);
		}
		
		var _redraw = function()
		{
			if(hidden)
			{
				divViewBase.style.display = 'none';
			}
			else
			{
				divViewBase.style.display = 'block';
				
				ctx.globalAlpha = 0.8;
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.fillStyle = "black";
				ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.globalAlpha = 1;
				
				ctx.fillStyle = Colors.Standard;
				ctx.font = 22 + "px Arial";
				ctx.textAlign = "left";
				ctx.fillText(TextRepository.get(queueData.getTitle()), COLUMN_WIDTH + 10, 26);
				ctx.fillRect(COLUMN_WIDTH, 38, size.x, 1);
	
				queueData.printInfo(ctx, {x: COLUMN_WIDTH, y: 40}, {x: ctx.canvas.width - COLUMN_WIDTH, y: ctx.canvas.height - 50}, currentItem);
				
				ctx.drawImage(buttonBase, canvasView.width - 40, canvasView.height - 10 - buttonBase.height);
				ctx.drawImage(ImagesLib.getImage("button_back"), canvasView.width - 40, canvasView.height - 10 - buttonBase.height);
			}
		}
		
		var _createCanvas = function(item, canAppends, haveBar)
		{
			var ret = document.createElement('canvas');
			ret.style.border = "1px";
			ret.style.borderStyle = "solid";
			ret.style.borderColor = "#77cf3c";
			ret.style.margin = "2px";
			ret.style.marginBottom = "0px";
			ret.width = (COLUMN_WIDTH - COLUMN_SLIDER_WIDTH - 6); //senza "px"
			ret.height = "30"; //senza "px"
			
			var ctx = ret.getContext("2d");
			var imageId = item.getName();
			if(item.getImageId != undefined)
			{
				imageId = item.getImageId();
			}
			var imgWidth = -5;
			var img = ImagesLib.getImage(imageId);
			if(img != null)
			{
				imgWidth = 28 * img.width / img.height;
				ctx.beginPath();
				ctx.drawImage(img, 1, 1, imgWidth, 28);
			}
						
			if(canAppends)
			{
				// pulsante add
				ctx.drawImage(buttonBase, ret.width - 28, ret.height + 2 - buttonBase.height, 26, 26);
				
				ret.addEventListener("mousedown", function(e)
					{
						if(e.pageX >= ret.width - 28)
						{
							// add
							queueData.appends(tagsNew["SortedItem_" + item.getName()]);
							_inizializeQueue();
						}
						else
						{
							currentItem = item;
						}
						_redraw();
					}, false);
			}
			else
			{
				if(haveBar)
				{
					var maxBar = ret.width - 2 - imgWidth - 5;
					ctx.fillStyle = Colors.Dark;
					ctx.fillRect(imgWidth + 5, 23, maxBar, 5);
					ctx.fillStyle = Colors.Standard;
					ctx.fillRect(imgWidth + 5, 23, maxBar - Math.floor(maxBar * item.getRemainTime() / item.getTime()), 5);
				}
				
				ret.addEventListener("mousedown", function(e)
					{
						currentItem = item;
						_redraw();
					}, false);
			}
			
			ctx.fillStyle = Colors.Standard;
			ctx.font = 16 + "px Arial";
			var text = TextRepository.get(item.getName());
			ctx.fillText(text, imgWidth + 5, 18);
			ctx.closePath();
			ctx.fill();
			
			return ret;
		}
		
		var _createSeparatorCanvas = function(textId)
		{
			var ret = document.createElement('canvas');
			ret.style.border = "1px";
			ret.style.borderStyle = "solid";
			ret.style.borderColor = "#77cf3c";
			ret.style.margin = "2px";
			ret.style.marginBottom = "0px";
			ret.width = (COLUMN_WIDTH - COLUMN_SLIDER_WIDTH - 6); //senza "px"
			ret.height = "30"; //senza "px"
			
			var ctx = ret.getContext("2d");
		
			ret.height = "20"; //senza "px"
			
			ctx.beginPath();
			ctx.fillStyle = Colors.Dark;
			ctx.fillRect(0, 0, ret.width, ret.height);
			
			ctx.fillStyle = Colors.Standard;
			ctx.font = 14 + "px Arial";
			ctx.mlFillText(TextRepository.get(textId), 0, 0, ret.width, ret.height, 'center', 'center', 12);
			ctx.closePath();
			ctx.fill();
			
			return ret;
		}
		
		_initialize();
		
		//-----------------------------------------
		
		this.setAbsolutePosition = _setAbsolutePosition;
		this.show = _show;
		this.hide = _hide;
		this.redraw = _redraw;
		
		//-----------------------------------------
	}
	
	function QueueData(queue, available)
	{
		//-----------------------------------------
		
		this.getQueue = function() { return queue; };
		this.getAvailable = function() { return available; };
		this.printInfo = undefined;
		this.appends = undefined;
		this.canAppends = function() { return (this.appends != null); };
		this.haveBar = function() { return false; };
		this.isSortable = function() { return true; };
		
		this.getTitle = function() { return "???"; };
		this.getQueueTitle = function() { return "Working"; };
		this.getAvailableTitle = function() { return "Available"; };

		//-----------------------------------------
	}
	
	function BaseQueueData(colonyState, queue, available)
	{
		QueueData.call(this, queue, available);
		
		var _printInfo = function(ctx, position, size, item)
		{
			if(item != null)
			{
				ctx.beginPath();
			
				var topInfo = position.y + 10;
				var leftInfo = position.x + 10;
				var img = ImagesLib.getImage(item.getName());
				ctx.drawImage(img, leftInfo, topInfo, img.width, img.height);
				ctx.lineWidth = "1px";
				ctx.strokeStyle = Colors.Standard;
				ctx.strokeRect(leftInfo, topInfo, img.width, img.height);
				
				ctx.font = 20 + "px Arial";
				ctx.fillText(TextRepository.get(item.getName()), leftInfo + img.width + 10, topInfo + 20);
				
				ctx.font = 16 + "px Arial";
				ctx.mlFillText(TextRepository.get(item.getName() + "Description"), leftInfo + img.width + 10, topInfo + 24, size.x - img.width - 30, img.height - 24 - barThickness - 2, 'top', 'left', 16);
			
				var barThickness = 10;
				var maxBar = size.x - img.width - 30;
				ctx.fillStyle = Colors.Dark;
				ctx.fillRect(leftInfo + img.width + 10, topInfo + img.height - barThickness, maxBar, barThickness);
				ctx.fillStyle = Colors.Standard;
				
				var cost;
				var time;
				var remainTime;
				if(item.getBase != undefined)
				{
					time = item.getTime();
					remainTime = item.getRemainTime();
					cost = item.getBase().getCost();
				}
				else
				{
					time = item.getTime();
					remainTime = item.getTime();
					cost = item.getCost();
				}
				
				ctx.fillRect(leftInfo + img.width + 10, topInfo + img.height - barThickness, maxBar - Math.floor(maxBar * remainTime / time), barThickness);
				var grid = new CanvasGrid(ctx, {x: leftInfo, y: topInfo + img.height + 10}, Colors.Standard, 16, [30, 30, 100, 50, 30, 20, 30]);
				var row = 0;
				grid.setText(row, 0, TextRepository.get("Progress") + ":");
				grid.setValue(row, 4, time - remainTime);
				grid.setValue(row, 5, "/");
				grid.setValue(row, 6, time);
							
				var resource;
				
				for (var resource in cost)
				{
					row++;
					grid.setText(row, 0, TextRepository.get(resource));
					grid.setValue(row, 4, cost[resource]);
					if(cost[resource] > colonyState.getProduced(resource))
					{
						grid.setText(row, 6, TextRepository.get("unavailable"), Colors.Error);
					}
				}
				
				ctx.closePath();
				ctx.fill();
			}
		}
		
		this.printInfo = _printInfo;
		this.haveBar = function() { return true; };
	}
	BaseQueueData.inherits(QueueData);
	
	function ResearchQueueData(colonyState)
	{
		var queue = colonyState.getResearchQueue();
		var newItems = ResearchLib.getAvailableResearch(colonyState);
		var available = new Array();

		var _contains = function(queue, name)
		{
			for(var i = 0; i < queue.length; i++)
			{
				if(queue[i].getName() == name)
				{
					return true;
				}
			}
			return false;
		}
		
		// solo quelli non presenti nella coda
		for(var i = 0; i < newItems.length; i++)
		{
			if(!_contains(queue, newItems[i].getName()))
			{
				available.push(newItems[i]);
			}
		}
		
		BaseQueueData.call(this, colonyState, queue, available);
		
		var _appends = function(item)
		{
			queue.push(item.create());
			available.splice(available.indexOf(item), 1);
		}
		
		this.appends = _appends;
		this.getTitle = function() { return "ResearchTitle"; };
		this.getQueueTitle = function() { return "Researching"; };
	}
	ResearchQueueData.inherits(BaseQueueData);

	function ProductionQueueData(colonyState)
	{
		var queue = colonyState.getProductionQueue()
		var available = ProductionLib.getAvailableRecipe(colonyState);

		BaseQueueData.call(this, colonyState, queue, available);

		var _appends = function(item)
		{
			queue.push(item.create());
		}
		
		this.getTitle = function() { return "ProductionTitle"; };
		this.appends = _appends;
	}
	ProductionQueueData.inherits(BaseQueueData);
	
	function ReportProductionMaterial(colonyState, material, image)
	{
		var productionBuildingList = new Array();
		PrototypeLib.priorityList.forEach(function(buildingType)
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
		PrototypeLib.priorityList.forEach(function(buildingType)
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
		PrototypeLib.priorityList.forEach(function(buildingType)
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
		PrototypeLib.priorityList.forEach(function(buildingType)
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
		queue.push(new ReportHumans(colonyState, "Pipes")); //TODO
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
	
	function HelpTutorial()
	{
		var _getText = function()
		{
			return "HelpTutorial_Base";
		}
	
		this.getName = function(){ return "HelpTutorial_Base"; }
		this.getImageId = function(){ return "button_help"; }
		this.getText = _getText;
	}
	
	function HelpTutorialBuilding(name, image)
	{
		this.getName = function(){ return name; }
		this.getImageId = function(){ return image; }
	}
	
	function HelpQueueData(colonyState)
	{
		var queue = [new HelpTutorial()];
		var available = new Array();
	
		var technology = colonyState.getTechnology();
		for(var i = 0; i < technology.length; i++)
		{
			var item = PrototypeLib.get(technology[i]);
			available.push(new HelpTutorialBuilding(technology[i], item.getBuildingImageId()));
		}
	
		QueueData.call(this, queue, available);
		
		var _printInfo = function(ctx, position, size, item)
		{
			if(item != null)
			{
				ctx.beginPath();

				var topInfo = position.y + 10;
				var leftInfo = position.x + 10;
			
				if(item.getText != undefined)
				{
					var img = ImagesLib.getImage(item.getImageId());
					ctx.drawImage(img, leftInfo, topInfo, img.width, img.height);
					ctx.lineWidth = "1px";
					ctx.strokeStyle = Colors.Standard;
					ctx.strokeRect(leftInfo, topInfo, img.width, img.height);
				
					ctx.font = 20 + "px Arial";
					ctx.fillText(TextRepository.get(item.getName()), leftInfo + img.width + 10, topInfo + 28);
				
					ctx.font = 16 + "px Arial";

					ctx.mlFillText(TextRepository.get(item.getName() + "Description"), leftInfo, topInfo + img.height + 10, size.x - 20, size.y - (img.height * 2) - 40, 'top', 'left', 16);
				}
				else
				{
					var baseTile = ImagesLib.getImage("baseTile");
					var img = ImagesLib.getImage(item.getImageId());
					ctx.drawImage(baseTile, leftInfo, topInfo - baseTile.height + img.height, baseTile.width, baseTile.height);
					ctx.drawImage(img, leftInfo, topInfo, img.width, img.height);
					
					ctx.font = 20 + "px Arial";
					ctx.fillText(TextRepository.get(item.getName()), leftInfo + img.width + 10, topInfo + 20);
						
					ctx.font = 16 + "px Arial";

					ctx.mlFillText(TextRepository.get(item.getName() + "Description"), leftInfo + img.width + 10, topInfo + 24, size.x - img.width - 30, img.height - 24 - 2, 'top', 'left', 16);
					
					//-------
					
					var proto = PrototypeLib.get(item.getName());
					
					var grid = new CanvasGrid(ctx, {x: leftInfo, y: topInfo + img.height + 10}, Colors.Standard, 16, [10, 10, 140, 50, 30, 20, 30]);
					var row = 0;
					grid.setText(row, 0, TextRepository.get("TerrainLayer") + ":");
					grid.setText(row, 4, TextRepository.get(proto.getTerrainLayer()));
					
					if(proto.getBuildingTime() > 0 || Object.keys(proto.getBuildingCost()).length > 0)
					{
						row++;
						grid.setText(row, 0, TextRepository.get("BuildingTitle"));
						
						row++;
						grid.setText(row, 1, TextRepository.get("BuildingTime") + ":");
						grid.setValue(row, 4, proto.getBuildingTime());
					
						var listItem;
						var list = proto.getBuildingCost();
						if(Object.keys(list).length > 0)
						{
							row++;
							grid.setText(row, 1, TextRepository.get("BuildingCost") + ":");
							for (var listItem in list)
							{
								row++;
								grid.setText(row, 2, TextRepository.get(listItem));
								grid.setValue(row, 4, list[listItem]);
							}
						}
					}
					
					list = proto.getCapacity();
					if(Object.keys(list).length > 0)
					{
						row++;
						grid.setText(row, 0, TextRepository.get("BuildingCapacity"));
						for (var listItem in list)
						{
							row++;
							grid.setText(row, 1, TextRepository.get(listItem));
							grid.setValue(row, 4, list[listItem]);
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
							for (var listItem in list)
							{
								row++;
								grid.setText(row, 2, TextRepository.get(listItem));
								grid.setValue(row, 4, list[listItem]);
							}
						}
						
						list = proto.getProduction();
						if(Object.keys(list).length > 0)
						{
							row++;
							grid.setText(row, 1, TextRepository.get("BuildingProduction") + ":");
							for (var listItem in list)
							{
								row++;
								grid.setText(row, 2, TextRepository.get(listItem));
								grid.setValue(row, 4, list[listItem]);
							}
						}
						
						list = proto.getProductionWaste();
						if(Object.keys(list).length > 0)
						{
							row++;
							grid.setText(row, 1, TextRepository.get("BuildingWaste") + ":");
							for (var listItem in list)
							{
								row++;
								grid.setText(row, 2, TextRepository.get(listItem));
								grid.setValue(row, 4, list[listItem]);
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
		}
	
		this.printInfo = _printInfo;
		this.isSortable = function() { return false; };
		this.getTitle = function() { return "HelpTitle"; };
		this.getQueueTitle = function() { return "HelpBase"; };
		this.getAvailableTitle = function() { return "Buildings"; };
	}
	HelpQueueData.inherits(QueueData);
	