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

        this.getInfo = function(item)
        {
            var text = "";
            if(item != null)
            {
                var imgSize = GetImageSize(ImagesLib.getImage(item.getImageId()));

                text += '<div class="queueInfo">';
                if(item.getText != undefined)
                {
                    text += '<div class="queueInfoTitle" style="height: ' + (imgSize.height + 5) + 'px;">';
                    text += '<img class="queueInfoTitleImage" style="height: ' + imgSize.height + 'px;" src="' + ImagesLib.getFileName(item.getImageId()) + '">';
                    text += '<div class="queueInfoTitleData queueInfoTitleName">' + TextRepository.get(item.getName()) + '</div>';
                    text += '</div>';

                    text += '<div class="queueInfoDetails">' + TextRepository.get(item.getName() + "Description") + '</div>';
                }
                else
                {
                    var baseImgSize = GetImageSize(ImagesLib.getImage("baseTile"));

                    text += '<div class="queueInfoTitle" style="height: ' + (imgSize.height + 5) + 'px;">';
                    text += '<div style="float: left; height: ' + imgSize.height + 'px; background: url(\'' + ImagesLib.getFileName("baseTile") + '\') no-repeat; background-position: 0 ' + (imgSize.height - baseImgSize.height) + 'px;">';
                    text += '<img style="height: ' + imgSize.height + 'px; border-size: 0;" src="' + ImagesLib.getFileName(item.getImageId()) + '">';
                    text += '</div>';
                    text += '<div class="queueInfoTitleData">';
                    text += '<div class="queueInfoTitleName">' + TextRepository.get(item.getName()) + '</div>';
                    text += '<div class="queueInfoTitleDescription">' + TextRepository.get(item.getName() + "Description") + '</div>';
                    text += '</div>';
                    text += '</div>';

                    text += '<div class="queueInfoDetails">';

                    var proto = PrototypeLib.get(item.getName());

                    text += '<table>';
                    text += '<tr><td class="tableMainColumn">' + TextRepository.get("TerrainLayer") + ':</td><td></td><td>' + TextRepository.get(proto.getTerrainLayer()) + '</td></tr>';

                    var list;
                    var listItem;
                    if(proto.getBuildingTime() > 0 || Object.keys(proto.getBuildingCost()).length > 0)
                    {
                        //text += '<tr><td>' + TextRepository.get("BuildingTitle") + '</td></tr>';

                        text += '<tr><td>' + TextRepository.get("BuildingTime") + ':</td><td class="tableDataRight">' + proto.getBuildingTime() + '</td><td>' + TextRepository.get("TimeUnit") + '</td></tr>';

                        list = proto.getBuildingCost();
                        if(Object.keys(list).length > 0)
                        {
                            text += '<tr><td>' + TextRepository.get("BuildingCost") + ':</td></tr>';
                            for (listItem in list)
                            {
                                if(list.hasOwnProperty(listItem))
                                {
                                    text += '<tr><td class="tableIndentation">' + TextRepository.get(listItem) + '</td><td class="tableDataRight">' + list[listItem] + '</td>';
                                    if(list[listItem] > colonyState.getProduced(listItem))
                                    {
                                        text += '<td class="colorError">' + TextRepository.get("unavailable") + '</td>';
                                    }
                                    text += '</tr>';
                                }
                            }
                        }
                    }

                    if(proto.getRequiredResource() != null)
                    {
                        text += '<tr><td>' + TextRepository.get("Requirements") + ':</td><td>' + TextRepository.get(proto.getRequiredResource()) + '</td></tr>';
                    }

                    list = proto.getCapacity();
                    if(Object.keys(list).length > 0)
                    {
                        text += '<tr><td>' + TextRepository.get("BuildingCapacity") + ':</td></tr>';
                        for (listItem in list)
                        {
                            if(list.hasOwnProperty(listItem))
                            {
                                text += '<tr><td class="tableIndentation">' + TextRepository.get(listItem) + '</td><td class="tableDataRight">' + list[listItem] + '</td></tr>';
                            }
                        }
                    }

                    if((Object.keys(proto.getConsumption()).length +
                        Object.keys(proto.getProduction()).length +
                        Object.keys(proto.getProductionWaste()).length) > 0)
                    {
                        //text += '<tr><td>' + TextRepository.get("ProductionTitle") + '</td></tr>';

                        list = proto.getConsumption();
                        if(Object.keys(list).length > 0)
                        {
                            text += '<tr><td>' + TextRepository.get("BuildingConsumption") + ':</td></tr>';
                            for (listItem in list)
                            {
                                if(list.hasOwnProperty(listItem))
                                {
                                    text += '<tr><td class="tableIndentation">' + TextRepository.get(listItem) + '</td><td class="tableDataRight">' + list[listItem] + '</td></tr>';
                                }
                            }
                        }

                        list = proto.getProduction();
                        if(Object.keys(list).length > 0)
                        {
                            text += '<tr><td>' + TextRepository.get("BuildingProduction") + ':</td></tr>';
                            for (listItem in list)
                            {
                                if(list.hasOwnProperty(listItem))
                                {
                                    text += '<tr><td class="tableIndentation">' + TextRepository.get(listItem) + '</td><td class="tableDataRight">' + list[listItem] + '</td></tr>';
                                }
                            }
                        }

                        list = proto.getProductionWaste();
                        if(Object.keys(list).length > 0)
                        {
                            text += '<tr><td>' + TextRepository.get("BuildingWaste") + ':</td></tr>';
                            for (listItem in list)
                            {
                                if(list.hasOwnProperty(listItem))
                                {
                                    text += '<tr><td class="tableIndentation">' + TextRepository.get(listItem) + '</td><td class="tableDataRight">' + list[listItem] + '</td></tr>';
                                }
                            }
                        }
                    }

                    text += '</table>';
                    text += '</div>';
                }

                text += '</div>';
            }
            return text;
        };

		this.isSortable = function() { return false; };
		this.getTitle = function() { return "HelpTitle"; };
		this.getQueueTitle = function() { return "HelpBase"; };
		this.getAvailableTitle = function() { return "Buildings"; };
	}
	HelpQueueData.inherits(QueueData);
	