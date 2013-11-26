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
		//var size = size;
		var buttonBase = null;
		var currentItem = null;
		var tagLastId = 0;
		var tags = {};
		var tagsNew = {};
        var queueData;
        var hidden;
		
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
		};
		
		var _doMouseDown = function(e)
		{
			if((e.pageX >= canvasView.width - 40) && (e.pageX <= canvasView.width - 40 + buttonBase.width) &&
				(e.pageY >= canvasView.height - 10 - buttonBase.height) && (e.pageY <= canvasView.height - 10))
			{
				_hide();
			}
		};
			
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
		};
		
		var _hide = function()
		{
			hidden = true;
			_redraw();
		};
		
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
		};

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
			for(var ii = 0; ii < newItems.length; ii++)
			{
				var newItem = newItems[ii];
				li = document.createElement('li');
				li.style.margin = "0px";
				li.style.padding = "0px";
				li.style.lineHeight = "0px";
				li.appendChild(_createCanvas(newItem, canAppends, false));
				li.id = "SortedItem_" + newItem.getName();
				ul.appendChild(li);

				tags[li.id] = newItem;
				tagsNew[li.id] = newItems[ii];
			}
			divDown.appendChild(ul);

			divViewContent.appendChild(divUp);
			divViewContent.appendChild(divDown);

			if(queueData.isSortable())
			{
                var list = $("#sortableInternalList");

                list.sortable(
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
                list.disableSelection();
			}

			// Slider
			var scrollContent = $('#' + divId + "_content");

			// Azzeramento barra di scorrimento
			divViewSliderCursor.style.top = (parseInt(canvasView.style.top) + 3) + "px";
			scrollContent.css("margin-top", 0);
		};
		
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
		};
		
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
				
				ret.addEventListener("mousedown", function()
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
		};
		
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
		};
		
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

        this.printInfo = function(ctx, position, size, item)
		{
			if(item != null)
			{
				ctx.beginPath();
			
				var topInfo = position.y + 10;
				var leftInfo = position.x + 10;
				var img = ImagesLib.getImage(item.getName());
                var imgSize = GetImageSize(img);
                var barThickness = 10;
                var maxBar = size.x - imgSize.width - 30;

				ctx.drawImage(img, leftInfo, topInfo, imgSize.width, imgSize.height);
				ctx.lineWidth = "1px";
				ctx.strokeStyle = Colors.Standard;
				ctx.strokeRect(leftInfo, topInfo, imgSize.width, imgSize.height);
				
				ctx.font = 20 + "px Arial";
				ctx.fillText(TextRepository.get(item.getName()), leftInfo + imgSize.width + 10, topInfo + 20);
				
				ctx.font = 16 + "px Arial";
				ctx.mlFillText(TextRepository.get(item.getName() + "Description"), leftInfo + imgSize.width + 10, topInfo + 24, size.x - imgSize.width - 30, imgSize.height - 24 - barThickness - 2, 'top', 'left', 16);

				ctx.fillStyle = Colors.Dark;

				ctx.fillRect(leftInfo + imgSize.width + 10, topInfo + imgSize.height - barThickness, maxBar, barThickness);
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
				
				ctx.fillRect(leftInfo + imgSize.width + 10, topInfo + imgSize.height - barThickness, maxBar - Math.floor(maxBar * remainTime / time), barThickness);
				var grid = new CanvasGrid(ctx, {x: leftInfo, y: topInfo + imgSize.height + 10}, 16, [30, 30, 100, 50, 30, 20, 30]);
				var row = 0;
				grid.setText(row, 0, TextRepository.get("Progress") + ":");
				grid.setValue(row, 4, time - remainTime);
				grid.setValue(row, 5, "/");
				grid.setValue(row, 6, time);

				for (var resource in cost)
				{
                    if(cost.hasOwnProperty(resource))
                    {
                        row++;
                        grid.setText(row, 0, TextRepository.get(resource));
                        grid.setValue(row, 4, cost[resource]);
                        if(cost[resource] > colonyState.getProduced(resource))
                        {
                            grid.setText(row, 6, TextRepository.get("unavailable"), Colors.Error);
                        }
                    }
				}
				
				ctx.closePath();
				ctx.fill();
			}
		};

		this.haveBar = function() { return true; };
	}
	BaseQueueData.inherits(QueueData);
	
	function ResearchQueueData(colonyState)
	{
		var queue = colonyState.getResearchQueue();
		var newItems = RecipeLib.getAvailableResearch(colonyState);
		var available = [];

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
		};
		
		// solo quelli non presenti nella coda
		for(var i = 0; i < newItems.length; i++)
		{
			if(!_contains(queue, newItems[i].getName()))
			{
				available.push(newItems[i]);
			}
		}
		
		BaseQueueData.call(this, colonyState, queue, available);

        this.appends = function(item)
		{
			queue.push(item.create());
			available.splice(available.indexOf(item), 1);
		};

		this.getTitle = function() { return "ResearchTitle"; };
		this.getQueueTitle = function() { return "Researching"; };
	}
	ResearchQueueData.inherits(BaseQueueData);

	function ProductionQueueData(colonyState)
	{
		var queue = colonyState.getProductionQueue();
		var available = RecipeLib.getAvailableProduction(colonyState);

		BaseQueueData.call(this, colonyState, queue, available);

		var _appends = function(item)
		{
			queue.push(item.create());
		};
		
		this.getTitle = function() { return "ProductionTitle"; };
		this.appends = _appends;
	}
	ProductionQueueData.inherits(BaseQueueData);