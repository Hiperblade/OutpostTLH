    var BuildingInfoView;

    function InitializeBuildingInfoView(onChangePosition, onClearCurrentItem)
    {
        BuildingInfoView = new BuildingInfoViewConstructor(onChangePosition, onClearCurrentItem);
        return BuildingInfoView;
    }

    function BuildingInfoViewConstructor(onChangePosition, onClearCurrentItem)
	{
        var currentItem;

		var _initialize = function()
		{
			_hide();
		};

        var _refresh = function()
        {
            var buildingInfoImage = $("#buildingInfoImage");
            if(currentItem == null)
            {
                $("#buildingInfoDataTitle").html("");
                buildingInfoImage.hide();
                $("#buildingInfoDataBar").hide();
                $("#buildingInfoMicroTail").attr("src", ImagesLib.getFileName("microTile"));
                return;
            }

            var protoType;
            if(currentItem.getBuildingType)
            {
                protoType = PrototypeLib.get(currentItem.getBuildingType());

                $("#buildingInfoDataTitle").html(TextRepository.get(currentItem.getBuildingType()));

                //TODO gestire gli edifici estesi
                //buildingInfoImage.attr("src", ImagesLib.getFileName(currentItem.getImageId())); // immagine corrente
                buildingInfoImage.attr("src", ImagesLib.getFileName(protoType.getBuildingImageId()));
                buildingInfoImage.show();

                var barValue;
                if(currentItem.underConstruction())
                {
                    barValue = (Math.floor(100 * (protoType.getBuildingTime() + currentItem.getProgressState()) / protoType.getBuildingTime()));
                }
                else
                {
                    barValue = (Math.floor(100 * currentItem.getIntegrity() / 1000));
                }
                $("#buildingInfoDataBarValue").css("width", barValue + "%");
                $("#buildingInfoDataBar").show();

                $("#buildingInfoMicroTail").attr("src", ImagesLib.getFileName("microTile_" + protoType.getAreaType()));
            }
            else
            {
                $("#buildingInfoDataBar").hide();

                if(currentItem.image != undefined)
                {
                    buildingInfoImage.attr("src", ImagesLib.getFileName(currentItem.image));
                    buildingInfoImage.show();

                    $("#buildingInfoDataTitle").html(TextRepository.get(currentItem.buildingType));
                    $("#buildingInfoMicroTail").attr("src", ImagesLib.getFileName("microTile_" + AreaTypes.One));
                }
                else
                {
                    protoType = PrototypeLib.get(currentItem.buildingType);
                    buildingInfoImage.attr("src", ImagesLib.getFileName(protoType.getBuildingImageId()));
                    buildingInfoImage.show();
                    $("#buildingInfoDataTitle").html(TextRepository.get(currentItem.buildingType));
                    $("#buildingInfoMicroTail").attr("src", ImagesLib.getFileName("microTile_" + protoType.getAreaType()));
                }
            }
        };

        var _goto = function()
        {
            if(currentItem != null)
            {
                if(onChangePosition && currentItem.getPosition)
                {
                    var tmp = currentItem.getPosition();
                    onChangePosition({ x: tmp.x, y: tmp.y });
                }
                if(onClearCurrentItem && !currentItem.getPosition)
                {
                    onClearCurrentItem();
                }
            }
        };

		var _hide = function()
		{
            currentItem = null;
            _refresh();
		};
		
		var _show = function(item)
		{
            currentItem = item;
            // se si tratta di un edificio esteso seleziono il modulo principale
            if(currentItem && currentItem.getMainBuilding)
            {
                currentItem = currentItem.getMainBuilding();
            }
            _refresh();
		};

		_initialize();
		
		//-----------------------------------------

        this.goto = _goto;
		this.show = _show;
		this.hide = _hide;
        this.refresh = _refresh;

		//-----------------------------------------
	}