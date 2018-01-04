"use strict";

let BuildingInfoView;

function InitializeBuildingInfoView(onChangePosition, onClearCurrentItem)
{
	BuildingInfoView = new BuildingInfoViewConstructor(onChangePosition, onClearCurrentItem);
	return BuildingInfoView;
}

function BuildingInfoViewConstructor(onChangePosition, onClearCurrentItem)
{
	let currentItem;

	let _initialize = function()
	{
		_hide();
	};

	let _refresh = function()
	{
		let buildingInfoImage = $("#buildingInfoImage");
		if(currentItem == null)
		{
			$("#buildingInfoDataTitle").html("");
			buildingInfoImage.hide();
			$("#buildingInfoDataBar").hide();
			$("#buildingInfoMicroTail").attr("src", ImagesLib.getFileName("microTile"));
			return;
		}

		let protoType;
		if(currentItem.getBuildingType)
		{
			protoType = PrototypeLib.get(currentItem.getBuildingType());

			$("#buildingInfoDataTitle").html(TextRepository.get(currentItem.getBuildingType()));

			buildingInfoImage.attr("src", ImagesLib.getFileName(protoType.getBuildingImageId()));
			buildingInfoImage.show();

			let barValue;
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

	let _goto = function()
	{
		if(currentItem != null)
		{
			if(onChangePosition && currentItem.getPosition)
			{
				let tmp = currentItem.getPosition();
				onChangePosition({ x: tmp.x, y: tmp.y });
			}
			if(onClearCurrentItem && !currentItem.getPosition)
			{
				onClearCurrentItem();
			}
		}
	};

	let _hide = function()
	{
		currentItem = null;
		_refresh();
	};

	let _show = function(item)
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