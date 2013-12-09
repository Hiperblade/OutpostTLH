    var BuildingInfoView;

    function InitializeBuildingInfoView(divId, onChangePosition)
    {
        BuildingInfoView = new BuildingInfoViewConstructor(divId, onChangePosition);
        return BuildingInfoView;
    }

    function BuildingInfoViewConstructor(divId, onChangePosition)
	{
		var divView = $("#" + divId);
        var baseImgSize = GetImageSize(ImagesLib.getImage("baseTile"));
        var currentItem;

		var _initialize = function()
		{
            divView.width(300);
            divView.height(150);
            divView.css('top', 0);
            divView.css('left', 0);
			_hide();
		};

        var _redraw = function()
        {
            var imgSize = GetImageSize(ImagesLib.getImage(currentItem.getImageId()));
            var protoType = PrototypeLib.get(currentItem.getBuildingType());

            var text = "";

            text += '<div class="buildingInfo">';

            text += '<div class="buildingInfoBackground" style="height: ' + imgSize.height + 'px; background: url(\'' + ImagesLib.getFileName("baseTile") + '\') no-repeat; background-position: 0 ' + (imgSize.height - baseImgSize.height) + 'px;">';
            text += '<img style="height: ' + imgSize.height + 'px; border-size: 0;" src="' + ImagesLib.getFileName(currentItem.getImageId()) + '">';
            text += '<div class="buildingInfoButton" onclick="BuildingInfoView.goto()"></div>';
            text += '</div>';

            text += '<div class="buildingInfoData">';
            text += '<div class="buildingInfoDataTitle">' + TextRepository.get(currentItem.getBuildingType()) + '</div>';
            if(currentItem.underConstruction())
            {
                text += '<div class="queueItemBar"><div class="queueItemBar2" style="width: ' + (Math.floor(100 * (protoType.getBuildingTime() + currentItem.getProgressState()) / protoType.getBuildingTime()))+ '%;"></div></div>';
            }
            else
            {
                text += '<div class="queueItemBar"><div class="queueItemBar2" style="width: ' + (Math.floor(100 * currentItem.getIntegrity() / 1000))+ '%;"></div></div>';
            }
            text += '</div>';

            text += '</div>';

            divView.html(text);
        };

        var _goto = function()
        {
            if(currentItem != null)
            {
                if(onChangePosition)
                {
                    var tmp = currentItem.getPosition();
                    onChangePosition({ x: tmp.x, y: tmp.y });
                }
            }
        };

		var _hide = function()
		{
            divView.hide();
		};
		
		var _show = function(item)
		{
            currentItem = item;
            if(item != null)
            {
                _redraw();
                divView.show();
            }
		};

		_initialize();
		
		//-----------------------------------------

        this.goto = _goto;
		this.show = _show;
		this.hide = _hide;
        this.redraw = _redraw;

		//-----------------------------------------
	}