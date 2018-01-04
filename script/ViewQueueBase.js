"use strict";

let Queue;

function InitializeQueueView(divId, size)
{
	Queue = new QueueViewConstructor(divId, size);
	return Queue;
}

function QueueViewConstructor(divId, size)
{
	const COLUMN_SLIDER_WIDTH = 20;

	let queueData = null;
	let currentItem = null;
	let tagLastId = 0;
	let tags = {};
	let tagsNew = {};

	let divViewBase = $("#" + divId + "_wrapper");
	let divViewAreaContainer = $("#" + divId + "AreaContainer");
	let divViewBackground = $("#" + divId + "Background");
	let divViewContent = $("#" + divId + "_content");

	divViewBase.width(size.x);
	divViewBase.height(size.y);

	divViewAreaContainer.height(size.y - ($("#queueDivAreaTitle").height() + $("#queueDivAreaToolsBar").height())); //

	divViewBackground.width(size.x);
	divViewBackground.height(size.y);

	let _initialize = function()
	{
		// Slider queue
		let scrollPane = $('#' + divId);
		let scrollContent = $('#' + divId + "_content");
		let scrollCursor = $("#" + divId + "_sliderCursor");
		let scrollSlider = $('#' + divId + "_slider");
		scrollSlider.slider({
			orientation: "vertical",
			value: 100,
			slide: function (event, ui) {
				let topMargin = 0;
				let cursorPosition = Math.floor((100 - ui.value) * scrollSlider.height() / 100);
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
		let scrollPaneArea = $('#' + divId + "Area");
		let scrollContentArea = $('#' + divId + "Area_content");
		let scrollCursorArea = $("#" + divId + "Area_sliderCursor");
		let scrollSliderArea = $('#' + divId + "Area_slider");
		scrollSliderArea.slider({
			orientation: "vertical",
			value: 100,
			slide: function (event, ui) {
				let topMargin = 0;
				let cursorPosition = Math.floor((100 - ui.value) * scrollSliderArea.height() / 100);
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

	let _internalSetCurrent = function(current)
	{
		currentItem = current;

		$("#queueDivArea_content").html(queueData.getInfo(currentItem));
	};

	let _setCurrent = function(itemName)
	{
		_internalSetCurrent(tags["SortedItem_" + itemName]);
	};

	let _addItem = function(itemName)
	{
		queueData.appends(tags["SortedItem_" + itemName]);
		_inizializeQueue();
	};

	let _show = function(queueDataNew)
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

	let _hide = function()
	{
		divViewBase.hide();
	};

	let _inizializeQueue = function()
	{
		//Titolo
		$("#queueDivAreaTitle").html(TextRepository.get(queueData.getTitle()));

		tags = {};
		tagsNew = {};

		let text = "";
		text += '<ul id="sortableInternalList" class="queueList">';
		// Separatore
		text += '<li id="SortedItemSeparator" class="queueListSeparator"><div class="queueSeparator">' + TextRepository.get(queueData.getQueueTitle()) + '</div></li>';

		let haveBar = queueData.haveBar();
		let queue = queueData.getQueue();
		tagLastId = 0;
		for(let i = 0; i < queue.length; i++)
		{
			text += '<li id="SortedItem_' + tagLastId + '" class="queueListItem">' + _createCanvas(queue[i], false, haveBar, tagLastId) + '</li>';
			tags["SortedItem_" + tagLastId] = queue[i];
			tagLastId++;
		}
		text += '</ul>';
		let divUp = '<div>' + text + '</div>';

		//--- new
		text = "";
		text += '<ul class="queueList">';

		let newItems = queueData.getAvailable();
		if(newItems.length > 0)
		{
			// Separatore
			text += '<li id="SortedItemSeparator" class="queueListSeparator"><div class="queueSeparator">' + TextRepository.get(queueData.getAvailableTitle()) + '</div></li>';
		}

		let canAppends = queueData.canAppends();
		for(let ii = 0; ii < newItems.length; ii++)
		{
			let newItem = newItems[ii];

			text += '<li id="SortedItem_' + newItem.getName() + '" class="queueListItem">' + _createCanvas(newItem, canAppends, false, null) + '</li>';
			tags["SortedItem_" + newItem.getName()] = newItem;
			tagsNew["SortedItem_" + newItem.getName()] = newItem;
		}
		text += '</ul>';
		let divDown = '<div>' + text + '</div>';

		divViewContent.empty();
		divViewContent.append(divUp);
		divViewContent.append(divDown);

		if(queueData.isSortable())
		{
			let list = $("#sortableInternalList");

			list.sortable(
				{
					update : function ()
					{
						queue.length = 0;
						let order = $("#sortableInternalList").sortable("toArray");
						for(let i = 0; i < order.length; i++)
						{
							let tag = tags[order[i]];
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

	let _createCanvas = function(item, canAppends, haveBar, currentId)
	{
		if(currentId == null)
		{
			currentId = item.getName();
		}

		let tmp = '<div class="queueItem" onclick="Queue.setCurrent(\'' + currentId + '\');">';
		let imageId = item.getName();
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
		let text = "";
		if(item != null)
		{
			let cost;
			let time;
			let remainTime;
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

			for (let resource in cost)
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
	let queue = colonyState.getResearchQueue();
	let newItems = RecipeLib.getAvailableResearch(colonyState);
	let available = [];

	let _contains = function(queue, name)
	{
		for(let i = 0; i < queue.length; i++)
		{
			if(queue[i].getName() == name)
			{
				return true;
			}
		}
		return false;
	};

	// solo quelli non presenti nella coda
	for(let i = 0; i < newItems.length; i++)
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
	let queue = colonyState.getProductionQueue();
	let available = RecipeLib.getAvailableProduction(colonyState);

	BaseQueueData.call(this, colonyState, queue, available);

	let _appends = function(item)
	{
		queue.push(item.create());
	};

	this.getTitle = function() { return "ProductionTitle"; };
	this.appends = _appends;
}
ProductionQueueData.inherits(BaseQueueData);