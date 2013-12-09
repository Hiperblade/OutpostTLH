    var Queue;

    function InitializeQueueView(divId, size)
    {
        Queue = new QueueViewConstructor(divId, size);
        return Queue;
    }

    function QueueViewConstructor(divId, size)
    {
        const COLUMN_SLIDER_WIDTH = 20;

        var queueData = null;
        var currentItem = null;
        var tagLastId = 0;
        var tags = {};
        var tagsNew = {};

        var divViewBase = $("#" + divId + "_wrapper");
        var divViewAreaContainer = $("#" + divId + "AreaContainer");
        var divViewBackground = $("#" + divId + "Background");
        var divViewContent = $("#" + divId + "_content");

        divViewBase.width(size.x);
        divViewBase.height(size.y);

        divViewAreaContainer.height(size.y - ($("#queueDivAreaTitle").height() + $("#queueDivAreaToolsBar").height())); //

        divViewBackground.width(size.x);
        divViewBackground.height(size.y);

        var _initialize = function()
        {
            // Slider queue
            var scrollPane = $('#' + divId);
            var scrollContent = $('#' + divId + "_content");
            var scrollCursor = $("#" + divId + "_sliderCursor");
            var scrollSlider = $('#' + divId + "_slider");
            scrollSlider.slider({
                orientation: "vertical",
                value: 100,
                slide: function (event, ui) {
                    var topMargin = 0;
                    var cursorPosition = Math.floor((100 - ui.value) * scrollSlider.height() / 100);
                    if(cursorPosition < topMargin)
                    {
                        cursorPosition = topMargin;
                    }
                    else if(cursorPosition > scrollSlider.height() - COLUMN_SLIDER_WIDTH - 3)
                    {
                        cursorPosition = scrollSlider.height() - COLUMN_SLIDER_WIDTH - 3;
                    }
                    scrollCursor.css('top', cursorPosition);

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

            // Slider area
            var scrollPaneArea = $('#' + divId + "Area");
            var scrollContentArea = $('#' + divId + "Area_content");
            var scrollCursorArea = $("#" + divId + "Area_sliderCursor");
            var scrollSliderArea = $('#' + divId + "Area_slider");
            scrollSliderArea.slider({
                orientation: "vertical",
                value: 100,
                slide: function (event, ui) {
                    var topMargin = 0;
                    var cursorPosition = Math.floor((100 - ui.value) * scrollSliderArea.height() / 100);
                    if(cursorPosition < topMargin)
                    {
                        cursorPosition = topMargin;
                    }
                    else if(cursorPosition > scrollSliderArea.height() - COLUMN_SLIDER_WIDTH)
                    {
                        cursorPosition = scrollSliderArea.height() - COLUMN_SLIDER_WIDTH;
                    }
                    scrollCursorArea.css('top', cursorPosition);

                    if (scrollContentArea.height() > scrollPaneArea.height())
                    {
                        scrollContentArea.css("margin-top", (-1 * (scrollPaneArea.height() - ((scrollPaneArea.height() * ui.value) / 100))) + "px");
                    }
                    else
                    {
                        scrollContentArea.css("margin-top", 0);
                    }
                }
            });

            _hide();
        };

        var _internalSetCurrent = function(current)
        {
            currentItem = current;

            $("#queueDivArea_content").html(queueData.getInfo(currentItem));
        };

        var _setCurrent = function(itemName)
        {
            _internalSetCurrent(tags["SortedItem_" + itemName]);
        };

        var _addItem = function(itemName)
        {
            queueData.appends(tags["SortedItem_" + itemName]);
            _inizializeQueue();
        };

        var _show = function(queueDataNew)
        {
            queueData = queueDataNew;
            _inizializeQueue();

            if(queueData.getQueue().length > 0)
            {
                _internalSetCurrent(queueData.getQueue()[0]);
            }
            else
            {
                _internalSetCurrent(null);
            }
            divViewBase.show();
        };

        var _hide = function()
        {
            divViewBase.hide();
        };

        var _inizializeQueue = function()
        {
            //Titolo
            $("#queueDivAreaTitle").html(TextRepository.get(queueData.getTitle()));

            tags = {};
            tagsNew = {};

            var text = "";
            text += '<ul id="sortableInternalList" class="queueList">';
            // Separatore
            text += '<li id="SortedItemSeparator" class="queueListSeparator"><div class="queueSeparator">' + TextRepository.get(queueData.getQueueTitle()) + '</div></li>';

            var haveBar = queueData.haveBar();
            var queue = queueData.getQueue();
            tagLastId = 0;
            for(var i = 0; i < queue.length; i++)
            {
                text += '<li id="SortedItem_' + tagLastId + '" class="queueListItem">' + _createCanvas(queue[i], false, haveBar, tagLastId) + '</li>';
                tags["SortedItem_" + tagLastId] = queue[i];
                tagLastId++;
            }
            text += '</ul>';
            var divUp = '<div>' + text + '</div>';

            //--- new
            text = "";
            text += '<ul class="queueList">';

            var newItems = queueData.getAvailable();
            if(newItems.length > 0)
            {
                // Separatore
                text += '<li id="SortedItemSeparator" class="queueListSeparator"><div class="queueSeparator">' + TextRepository.get(queueData.getAvailableTitle()) + '</div></li>';
            }

            var canAppends = queueData.canAppends();
            for(var ii = 0; ii < newItems.length; ii++)
            {
                var newItem = newItems[ii];

                text += '<li id="SortedItem_' + newItem.getName() + '" class="queueListItem">' + _createCanvas(newItem, canAppends, false, null) + '</li>';
                tags["SortedItem_" + newItem.getName()] = newItem;
                tagsNew["SortedItem_" + newItem.getName()] = newItem;
            }
            text += '</ul>';
            var divDown = '<div>' + text + '</div>';

            divViewContent.empty();
            divViewContent.append(divUp);
            divViewContent.append(divDown);

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
                        items: "li:not(.queueListSeparator)"
                    });
                list.disableSelection();
            }

            // Azzeramento barra di scorrimento
            $("#" + divId + "_sliderCursor").top = 3 + "px";

            // Slider
            $('#' + divId + "_content").css("margin-top", 0);
        };

        var _createCanvas = function(item, canAppends, haveBar, currentId)
        {
            if(currentId == null)
            {
                currentId = item.getName();
            }

            var tmp = '<div class="queueItem" onclick="Queue.setCurrent(\'' + currentId + '\');">';
            var imageId = item.getName();
            if(item.getImageId != undefined)
            {
                imageId = item.getImageId();
            }
            tmp += '<img class="queueItemImage" src="' + ImagesLib.getFileName(imageId) + '">';
            if(canAppends)
            {
                tmp += '<div class="queueItemButton" onclick="Queue.addItem(\'' + item.getName() + '\');"></div>';
            }
            tmp += '<div class="queueItemText"><div class="queueItemTitle">' + TextRepository.get(item.getName()) + '</div>';
            if(haveBar)
            {
                tmp += '<div class="queueItemBar"><div class="queueItemBar2" style="width: ' + (100 - Math.floor(100 * item.getRemainTime() / item.getTime()))+ '%;"></div></div>';
            }
            tmp += '</div></div>';
            return tmp;
        };

        //------------------------------------------

        this.show = _show;
        this.hide = _hide;

        this.setCurrent = _setCurrent;
        this.addItem = _addItem;

        _initialize();
    }

	function QueueData(queue, available)
	{
		//-----------------------------------------
		
		this.getQueue = function() { return queue; };
		this.getAvailable = function() { return available; };
		this.appends = undefined;
		this.canAppends = function() { return (this.appends != null); };
		this.haveBar = function() { return false; };
		this.isSortable = function() { return true; };
		
		this.getTitle = function() { return "???"; };
		this.getQueueTitle = function() { return "Working"; };
		this.getAvailableTitle = function() { return "Available"; };

        this.getInfo = undefined;

		//-----------------------------------------
	}
	
	function BaseQueueData(colonyState, queue, available)
	{
		QueueData.call(this, queue, available);

        this.getInfo = function(item)
        {
            var text = "";
            if(item != null)
            {
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

                text += '<div class="queueInfo">';
                text += '<div class="queueInfoTitle">';
                text += '<img class="queueInfoTitleImage" src="' + ImagesLib.getFileName(item.getName()) + '">';
                text += '<div class="queueInfoTitleData">';
                text += '<div class="queueInfoTitleName">' + TextRepository.get(item.getName()) + '</div>';
                text += '<div class="queueInfoTitleDescription">' + TextRepository.get(item.getName() + "Description") + '</div>';
                text += '<div class="queueInfoTitleBar"><div class="queueInfoTitleBar2" style="width: ' + (100 - Math.floor(100 * remainTime / time)) + '%"></div></div>';
                text += '</div>';
                text += '</div>';

                text += '<div class="queueInfoDetails">';
                text += '<table>';
                text += '<tr><td class="tableMainColumn">' + TextRepository.get("Progress") + ':</td><td class="tableDataRight">' + (time - remainTime) + ' / ' + time + '</td><td>' + TextRepository.get("TimeUnit") + '</td></tr>';

                for (var resource in cost)
                {
                    if(cost.hasOwnProperty(resource))
                    {
                        text += '<tr><td>' + TextRepository.get(resource) + '</td><td class="tableDataRight">' + cost[resource] + '</td>';
                        if(cost[resource] > colonyState.getProduced(resource))
                        {
                            text += '<td class="colorError">' + TextRepository.get("unavailable") + '</td>';
                        }
                        text += '</tr>';
                    }
                }

                text += '</table>';
                text += '</div>';
                text += '</div>';
            }
            return text;
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
