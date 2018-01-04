"use strict";

	let Main;

	function InitializeMainSystem(mapCanvas, miniMapCanvas, selectorCanvas, siteType)
	{
		Main = new MainSystemConstructor(mapCanvas, miniMapCanvas, selectorCanvas, siteType);
		return Main;
	}

	let MainCommand =
	{
		GoNorth: "GoNorth",
		GoEast: "GoEast",
		GoSouth: "GoSouth",
		GoWest: "GoWest",
		GoUp: "GoUp",
		GoDown: "GoDown",
		Dozer: "Dozer",
		Digger: "Digger",
		Miner: "Miner",
		PipeNorthEastSouthWest: "PipeNorthEastSouthWest",
		PipeEastWest: "PipeEastWest",
		PipeNorthSouth: "PipeNorthSouth",
		PipeDown: "PipeDown",
		SelectBuilding: "Building",
		ShowHelp: "ShowHelp",
		ShowReport: "ShowReport",
		ShowProduction: "ShowProduction",
		ShowResearch: "ShowResearch",
		DoNext: "DoNext",
		ClearSelection: "ClearSelection"
	};

	function MainSystemConstructor(mapCanvas, miniMapCanvas, selectorCanvas, siteType)
	{
		const MAP_SIZE = { x: 150, y: 300 };
		const TILE_DIMENSION = { x: 106, y: 46 };

		let site = siteType;
		let areaSize = { x: 9, y: 9 };
		let terrainMap;
		let view;
		let mapView;
		let selectorView;
		let queueView;
		let buildingInfo;
		let position = { x: 0, y: 0 };
		let state = null;

		let currentTile = null;

		let _initialize = function()
		{
			document.onkeydown = function(event)
			{
				event = event || window.event;
				let e = event.keyCode;
				switch(e)
				{
					case 38: // up
					case 87: // w
						_executeCommand(MainCommand.GoNorth);
						break;
					case 39: // right
					case 68: // d
						_executeCommand(MainCommand.GoEast);
						break;
					case 40: // down
					case 83: // s
						_executeCommand(MainCommand.GoSouth);
						break;
					case 37: // left
					case 65: // a
						_executeCommand(MainCommand.GoWest);
						break;

					case 33: // pageUp
						_executeCommand(MainCommand.GoUp);
						break;
					case 34: // pageDown
						_executeCommand(MainCommand.GoDown);
						break;

					case 60: // < (it)
					case 220: // \ (en)
						_executeCommand(MainCommand.Dozer);
						break;
					case 90: // z
						_executeCommand(MainCommand.Digger);
						break;
					case 88: // x
						_executeCommand(MainCommand.Miner);
						break;
					case 67: // c
						_executeCommand(MainCommand.PipeNorthEastSouthWest);
						break;
					case 86: // v
						_executeCommand(MainCommand.PipeEastWest);
						break;
					case 66: // b
						_executeCommand(MainCommand.PipeNorthSouth);
						break;
					case 78: // n
						_executeCommand(MainCommand.PipeDown);
						break;
					case 77: // m
						_executeCommand(MainCommand.SelectBuilding);
						break;

					case 72: // h
						_executeCommand(MainCommand.ShowHelp);
						break;
					case 74: // j
						_executeCommand(MainCommand.ShowReport);
						break;
					case 75: // k
						_executeCommand(MainCommand.ShowProduction);
						break;
					case 76: // l
						_executeCommand(MainCommand.ShowResearch);
						break;

					case 13: // enter
						_executeCommand(MainCommand.DoNext);
						break;
				}
			};

			let _onChangePosition = function(newPosition)
			{
				newPosition.x -= Math.floor(areaSize.x / 2);
				newPosition.y -= Math.floor(areaSize.y / 2);
				if(newPosition.x < 0) newPosition.x = 0;
				if(newPosition.y < 0) newPosition.y = 0;

				_setPosition(newPosition);
			};

			let _onClearCurrentItem = function()
			{
				_executeCommand(MainCommand.ClearSelection);
			};

			let _onSelected = function(item)
			{
				if(item != null)
				{
					_setCurrentTile({ buildingType: item });
				}
				else
				{
					_setCurrentTile(null);
				}
			};

			terrainMap = new TerrainMap(site.getTypology(), MAP_SIZE);
			state = terrainMap.getState();
			view = new IsometricView (terrainMap, mapCanvas, areaSize, TILE_DIMENSION);
			let canvasSize = view.getCanvasSize();

			let mainArea = $("#mainScreen");
			mainArea.css("width", canvasSize.x);
			mainArea.css("height", canvasSize.y);

			mapView = new MapView(terrainMap, miniMapCanvas, site.getImageName(), areaSize, _onChangePosition);
			selectorView = new BuildingSelectorView(selectorCanvas, canvasSize.x, state, _onSelected);

			buildingInfo = InitializeBuildingInfoView(_onChangePosition, _onClearCurrentItem);
			queueView = InitializeQueueView("queueDiv", canvasSize);

			// pulsanti spostamento
			view.addButtonGrid(10, { x: Math.floor(areaSize.x / 2), y: -1 }, "button_west", function (){ _goWest(); });
			view.addButtonGrid(11, { x: areaSize.x, y: Math.floor(areaSize.y / 2) }, "button_north", function() { _goNorth(); });
			view.addButtonGrid(12, { x: Math.floor(areaSize.x / 2), y: areaSize.y }, "button_east",  function() { _goEast(); });
			view.addButtonGrid(13, { x: -1, y: Math.floor(areaSize.y / 2) }, "button_south", function() { _goSouth(); });

			// bordo
			let index;
			for(index = 0; index < areaSize.y; index++)
			{
				view.addImageGrid(300 + index, { x: -1, y: index }, "tileBorder_left")
			}
			for(index = areaSize.x -1; index >= 0; index--)
			{
				view.addImageGrid(200 + index, { x: index, y: areaSize.y }, "tileBorder_right")
			}

			// pulsanti selezione livello
			view.addButton(30, { x: canvasSize.x - 40, y: view.getVerticalMiddle() - 50 }, "button_up", function() { _goUp(); });
			view.addButton(31, { x: canvasSize.x - 40, y: view.getVerticalMiddle() + 50 + 30 }, "button_down", function() { _goDown(); });

			view.setGridCallback(function(point)
				{
					let target = _findBuilding(point);
					if(!terrainMap.isVisible(point))
					{
						return;
					}

					if(currentTile != null)
					{
						let resource;

						if(currentTile.isRobot)
						{
							if(currentTile.robotType == RobotTypes.Dozer)
							{
								if(terrainMap.getRobot(point) == null)
								{
									if(target != null)
									{
										if(state.useRoboDozer())
										{
											//distruggi l'edificio
											if(!target.isDestroyed())
											{
												let eventDestroy = PrototypeLib.get(target.getBuildingType()).eventDestroy;
												if(eventDestroy != undefined)
												{
													eventDestroy(target, terrainMap);
												}
											}
											terrainMap.delBuilding(point);

											terrainMap.addRoboDozer(point);
											_setCurrentTile(null);
										}
										else
										{
Log.dialog("Non \u00E8 disponibile nessuna " + TextRepository.get(RobotTypes.Dozer) + "!");
										}
									}
									else if(terrainMap.isRazable(point))
									{
										if(state.useRoboDozer())
										{
											terrainMap.addRoboDozer(point);
											_setCurrentTile(null);
										}
										else
										{
Log.dialog("Non \u00E8 disponibile nessuna " + TextRepository.get(RobotTypes.Dozer) + "!");
										}
									}
								}
							}
							else if(currentTile.robotType == RobotTypes.Digger)
							{
								if(target == null)
								{
									if(terrainMap.getRobot(point) == null)
									{
										if(terrainMap.isDiggable(point))
										{
											if(state.useRoboDigger())
											{
												terrainMap.addRoboDigger(point);
												_setCurrentTile(null);
											}
											else
											{
Log.dialog("Non \u00E8 disponibile nessuna " + TextRepository.get(RobotTypes.Digger) + "!");
											}
										}
									}
								}
							}
							else if(currentTile.robotType == RobotTypes.Miner)
							{
								resource = terrainMap.findResource(point);
								if(resource != null)
								{
									let material = resource.getResourceType();
									let theory = "Extraction_" + material;
									let mineType = "Mine" + material;

									if(state.checkKnowledge({theory: [theory]})) // controlo se hai la tecnologia richiesta
									{
										if(!terrainMap.isRazable(point))
										{
											terrainMap.addBuilding(mineType, point);
											_setCurrentTile(null);
										}
										else
										{
Log.dialog("Il terreno non \u00E8 spianato!");
										}
									}
									else
									{
Log.dialog("Non hai la tecnologia per estrarre questa risorsa!");
									}
								}
							}

							_redraw();
						}
						else
						{
							if(target == null)
							{
								if(!terrainMap.isRazable(point))
								{
									resource = terrainMap.findResource(point);
									let p = PrototypeLib.get(currentTile.buildingType);
									if(p.getRequiredResource() == undefined && resource == null)
									{
										if(_addBuilding(currentTile.buildingType, point))
										{
											_setCurrentTile(null);
										}
									}
									else
									{
										if(resource != null)
										{
											if(p.getRequiredResource() == null)
											{
Log.dialog("Questo edificio non richiede la presenza di risorse!");
											}
											else if(resource.getResourceType() == p.getRequiredResource())
											{
												if(_addBuilding(currentTile.buildingType, point))
												{
													_setCurrentTile(null);
												}
											}
											else
											{
Log.dialog("Questo edificio richiede la presenza della risorsa " + p.getRequiredResource() + "!");
											}
										}
										else
										{
Log.dialog("Questo edificio richiede la presenza della risorsa " + p.getRequiredResource() + "!");
										}
									}
								}
								else if(currentTile.buildingType == "LandingModule")
								{
									if(_addBuilding(currentTile.buildingType, point))
									{
										_setCurrentTile(null);
									}
								}
							}
						}
					}
					else
					{
						if(target != null)
						{
							buildingInfo.show(target);

							if(target.isPipe() && !target.underConstruction() && !target.isDestroyed())
							{
								if(target.haveUp())
								{
									_goUp();
								}
								else if(target.haveDown())
								{
									_goDown();
								}
							}
						}
						else
						{
							buildingInfo.hide();
						}
					}
				});

			view.setButtonsCallback(function(id)
				{
				});

			terrainMap.simulation();		
			_setAbsolutePosition({x: 0, y: 0});
			_setLayer(TerrainLayer.Surface);
		};

		let _addBuilding = function(buildingType, point)
		{
			let newBuilding = terrainMap.addBuilding(buildingType, point);
			return (newBuilding != null);
		};

		let _createCurrentTilePipe = function(pipeType, layer)
		{
			return { buildingType: "Pipe_" + pipeType + "_" + layer, image: "Pipe_" + pipeType + "_" + layer};
		};

		let _setPosition = function(point)
		{
			position = point;
			view.setPosition(position);
			mapView.setPosition(position);
		};

		let _redraw = function()
		{
			_updateRoboAvailable();
			view.redraw();
			mapView.redraw();
		};

		let _fromScreenPosition = function(point)
		{
			return view.fromScreenPosition(point);
		};

		let _findBuilding = function(point)
		{
			return terrainMap.findBuilding(point);
		};

		let disableCommand = {};

		let _setAbilitationButton = function(name, enable)
		{
			disableCommand[name] = !enable;

			let button = $(".button" + name);
			if(enable)
			{
				button.addClass("buttonEnable");
				button.removeClass("buttonDisable");
			}
			else
			{
				button.addClass("buttonDisable");
				button.removeClass("buttonEnable");
			}
		};

		let _updateRoboAvailable = function()
		{
			if(state.getRoboDozerAvailable() <= 0)
			{
				_setAbilitationButton(MainCommand.Dozer, false);

			}
			else
			{
				_setAbilitationButton(MainCommand.Dozer, true);
			}

			if((state.getRoboDiggerAvailable() <= 0) || (terrainMap.getLayer() == TerrainLayer.Surface))
			{
				_setAbilitationButton(MainCommand.Digger, false);
			}
			else
			{
				_setAbilitationButton(MainCommand.Digger, true);
			}
		};

		let _setLayer = function(layer)
		{
			_setCurrentTile(null);

			terrainMap.setLayer(layer);

			_setAbilitationButton(MainCommand.PipeDown, true);

			view.setButton(26, true); // elevator
			view.setButton(30, true); // up
			view.setButton(31, true); // down

			if(layer == TerrainLayer.Surface)
			{
				view.setButton(30, false); // up
			}
			else if(layer == TerrainLayer.Deep)
			{
				_setAbilitationButton(MainCommand.PipeDown, false);
				view.setButton(31, false); // down
			}

			selectorView.setLayer(layer);

			_redraw();
		};

		let _goUp = function()
		{
			if(terrainMap.getLayer() == TerrainLayer.Underground)
			{
				_setLayer(TerrainLayer.Surface);
			}
			else if(terrainMap.getLayer() == TerrainLayer.Deep)
			{
				_setLayer(TerrainLayer.Underground);
			}
			_redraw();
		};

		let _goDown = function()
		{
			if(terrainMap.getLayer() == TerrainLayer.Surface)
			{
				_setLayer(TerrainLayer.Underground);
			}
			else if(terrainMap.getLayer() == TerrainLayer.Underground)
			{
				_setLayer(TerrainLayer.Deep);
			}
			_redraw();
		};

		let _goNorth = function()
		{
			if(position.x < terrainMap.getSize().x - view.getSize().x - 1)
			{
				position = { x: position.x + 1, y: position.y };
				_setPosition(position);
			}
		};

		let _goSouth = function()
		{
			if(position.x > 0)
			{
				position = { x: position.x - 1, y: position.y };
				_setPosition(position);
			}
		};

		let _goEast = function()
		{
			if(position.y < terrainMap.getSize().y - view.getSize().y - 1)
			{
				position = { x: position.x, y: position.y + 1 };
				_setPosition(position);
			}
		};

		let _goWest = function()
		{
			if(position.y > 0)
			{
				position = { x: position.x, y: position.y - 1 };
				_setPosition(position);
			}
		};

		let _doNext = function()
		{
			terrainMap.computation();
			terrainMap.simulation();
			_redraw();
			buildingInfo.refresh();
		};

		let _setAbsolutePosition = function(point)
		{
//TODO
			let canvasSize = view.getCanvasSize();
			view.setAbsolutePosition(point);

			selectorView.setAbsolutePosition({x: point.x, y: point.y + canvasSize.y});
		};

		let _setCurrentTile = function(item)
		{
			currentTile = item;
			buildingInfo.show(currentTile);
			_redraw();
		};

		let _executeCommand = function(cmd)
		{
			if(disableCommand[cmd])
			{
				return;
			}

			switch(cmd)
			{
				case MainCommand.GoNorth:
					_goNorth();
					break;
				case MainCommand.GoEast:
					_goEast();
					break;
				case MainCommand.GoSouth:
					_goSouth();
					break;
				case MainCommand.GoWest:
					_goWest();
					break;

				case MainCommand.GoUp:
					_goUp();
					break;
				case MainCommand.GoDown:
					_goDown();
					break;

				case MainCommand.Dozer:
					_setCurrentTile({ isRobot: true, robotType: RobotTypes.Dozer, buildingType: "RoboDozer", image: "RoboDozer" });
					break;
				case MainCommand.Digger:
					_setCurrentTile({ isRobot: true, robotType: RobotTypes.Digger, buildingType: "RoboDigger", image: "RoboDigger" } );
					break;
				case MainCommand.Miner:
					_setCurrentTile({ isRobot: true, robotType: RobotTypes.Miner, buildingType: "RoboMiner", image: "RoboMiner" });
					break;
				case MainCommand.PipeNorthEastSouthWest:
					_setCurrentTile(_createCurrentTilePipe(PipeType.NorthEastSouthWest, terrainMap.getLayer()));
					break;
				case MainCommand.PipeEastWest:
					_setCurrentTile(_createCurrentTilePipe(PipeType.EastWest, terrainMap.getLayer()));
					break;
				case MainCommand.PipeNorthSouth:
					_setCurrentTile(_createCurrentTilePipe(PipeType.NorthSouth, terrainMap.getLayer()));
					break;
				case MainCommand.PipeDown:
					_setCurrentTile(_createCurrentTilePipe(PipeType.Down, terrainMap.getLayer()));
					break;
				case MainCommand.SelectBuilding:
					selectorView.show();
					break;

				case MainCommand.ShowHelp:
					queueView.show(new HelpQueueData(state));
					break;
				case MainCommand.ShowReport:
					queueView.show(new ReportQueueData(state));
					break;
				case MainCommand.ShowProduction:
					queueView.show(new ProductionQueueData(state));
					break;
				case MainCommand.ShowResearch:
					queueView.show(new ResearchQueueData(state));
					break;

				case MainCommand.DoNext:
					_doNext();
					break;

				case MainCommand.ClearSelection:
					_setCurrentTile(null);
					break;
			}
		};

		_initialize();

		//-----------------------------------------

		this.getTerrainMap = function() { return terrainMap; };
		this.getState = function() { return state; };

		this.getLayer = function() { return terrainMap.getLayer(); };
		this.setLayer = _setLayer;

		this.setPosition = _setPosition;
		this.redraw = _redraw;
		this.fromScreenPosition = _fromScreenPosition;
		this.findBuilding = _findBuilding;
		this.goUp = _goUp;
		this.goDown = _goDown;
		this.goNorth = _goNorth;
		this.goSouth = _goSouth;
		this.goEast = _goEast;
		this.goWest = _goWest;
		this.doNext = _doNext;
		this.setAbsolutePosition = _setAbsolutePosition;

		this.executeCommand = _executeCommand;

		//----------------------------------------- */
	}

	function Site(typology, imageName)
	{
		//-----------------------------------------

		this.getTypology = function() { return typology; };
		this.getImageName = function() { return imageName; };

		//-----------------------------------------
	}