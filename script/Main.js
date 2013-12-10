	function MainSystem(mapCanvas, miniMapCanvas, selectorCanvas, siteType)
	{
		const MAP_SIZE = { x: 150, y: 300 };
		const TILE_DIMENSION = { x: 106, y: 46 };
	
		var site = siteType;
		var areaSize = { x: 9, y: 9 };
		var terrainMap;
		var view;
		var mapView;
		var selectorView;
		var queueView;
        var buildingInfo;
		var position = { x: 0, y: 0 };
		var state = null;
		
		var currentTile = null;

		var _initialize = function()
		{
			document.onkeydown = function(event)
			{
				event = event || window.event;
				var e = event.keyCode;
                switch(e)
                {
                    case 38: // up
                    case 87: // w
					    _goNorth();
                        break;
                    case 39: // right
                    case 68: // d
    					_goEast();
                        break;
                    case 40: // down
                    case 83: // s
	    				_goSouth();
                        break;
                    case 37: // left
                    case 65: // a
    					_goWest();
                        break;

                    case 33: // pageUp
                        _goUp();
                        break;
                    case 34: // pageDown
                        _goDown();
                        break;

                    case 60: // < (it)
                    case 220: // \ (en)
                        _setCurrentTile({ isRobot: true, robotType: RobotTypes.Dozer, buildingType: "RoboDozer", image: "RoboDozer" });
                        break;
                    case 90: // z
                        _setCurrentTile({ isRobot: true, robotType: RobotTypes.Digger, buildingType: "RoboDigger", image: "RoboDigger" } );
                        break;
                    case 88: // x
                        _setCurrentTile({ isRobot: true, robotType: RobotTypes.Miner, buildingType: "RoboMiner", image: "RoboMiner" });
                        break;
                    case 67: // c
                        _setCurrentTile(_createCurrentTilePipe(PipeType.NorthEastSouthWest, terrainMap.getLayer()));
                        break;
                    case 86: // v
                        _setCurrentTile(_createCurrentTilePipe(PipeType.EastWest, terrainMap.getLayer()));
                        break;
                    case 66: // b
                        _setCurrentTile(_createCurrentTilePipe(PipeType.NorthSouth, terrainMap.getLayer()));
                        break;
                    case 78: // n
                        _setCurrentTile(_createCurrentTilePipe(PipeType.Down, terrainMap.getLayer()));
                        break;
                    case 77: // m
                        selectorView.show();
                        break;

                    case 72: // h
                        _showHelp();
                        break;
                    case 74: // j
                        _showReport();
                        break;
                    case 75: // k
                        _showProduction();
                        break;
                    case 76: // l
                        _showResearch();
                        break;

                    case 13: // enter
                        _doNext();
                        break;
                }
			};
			
			var _onChangePosition = function(newPosition)
			{
				newPosition.x -= Math.floor(areaSize.x / 2);
				newPosition.y -= Math.floor(areaSize.y / 2);
				if(newPosition.x < 0) newPosition.x = 0;
				if(newPosition.y < 0) newPosition.y = 0;
				
				_setPosition(newPosition);
			};
			
			var _onSelected = function(item)
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
            var canvasSize = view.getCanvasSize();

            var mainArea = $("#mainScreen");
            mainArea.css("width", canvasSize.x);
            mainArea.css("height", canvasSize.y);

			mapView = new MapView(terrainMap, miniMapCanvas, site.getImageName(), areaSize, _onChangePosition);
			selectorView = new BuildingSelectorView(selectorCanvas, canvasSize.x, state, _onSelected);

            buildingInfo = InitializeBuildingInfoView(_onChangePosition);
			queueView = InitializeQueueView("queueDiv", canvasSize);
					
			// pulsanti spostamento
			view.addButtonGrid(10, { x: Math.floor(areaSize.x / 2), y: -1 }, "button_west", function (){ _goWest(); });
			view.addButtonGrid(11, { x: areaSize.x, y: Math.floor(areaSize.y / 2) }, "button_north", function() { _goNorth(); });
			view.addButtonGrid(12, { x: Math.floor(areaSize.x / 2), y: areaSize.y }, "button_east",  function() { _goEast(); });
			view.addButtonGrid(13, { x: -1, y: Math.floor(areaSize.y / 2) }, "button_south", function() { _goSouth(); });

			// bordo
            var index;
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





	//TODO
			view.addImageButton(20, { x: 10, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile({ isRobot: true, robotType: RobotTypes.Dozer, buildingType: "RoboDozer", image: "RoboDozer" }); }, "button_roboDozer");
			view.addImageButton(21, { x: 50, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile({ isRobot: true, robotType: RobotTypes.Digger, buildingType: "RoboDigger", image: "RoboDigger" } ); }, "button_roboDigger");
			view.addImageButton(22, { x: 90, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile({ isRobot: true, robotType: RobotTypes.Miner, buildingType: "RoboMiner", image: "RoboMiner" }); }, "button_roboMiner");
			
			view.addImageButton(23, { x: 140, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.NorthEastSouthWest, terrainMap.getLayer())); }, "button_pipeNorthEastSouthWest");
			view.addImageButton(24, { x: 180, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.EastWest, terrainMap.getLayer())); }, "button_pipeEastWest");
			view.addImageButton(25, { x: 220, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.NorthSouth, terrainMap.getLayer())); }, "button_pipeNorthSouth");
			view.addImageButton(26, { x: 260, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.Down, terrainMap.getLayer())); }, "button_pipeDown");
			
			view.addImageButton(27, { x: 310, y: canvasSize.y - 10 }, "button_base", function() { selectorView.show(); }, "button_building");
			
			view.addImageButton(40, { x: canvasSize.x - 220, y: canvasSize.y - 10 }, "button_base", function() { _showHelp(); }, "button_help");
			
			view.addImageButton(50, { x: canvasSize.x - 170, y: canvasSize.y - 10 }, "button_base", function() { _showReport(); }, "button_report");
			view.addImageButton(51, { x: canvasSize.x - 130, y: canvasSize.y - 10 }, "button_base", function() { _showProduction(); }, "button_production");
			view.addImageButton(52, { x: canvasSize.x - 90, y: canvasSize.y - 10 }, "button_base", function() { _showResearch(); }, "button_research");
			
			view.addImageButton(60, { x: canvasSize.x - 40, y: canvasSize.y - 10 }, "button_base", function() { _doNext(); }, "button_time");


			view.setGridCallback(function(point)
				{
					var target = _findBuilding(point);
					if(!terrainMap.isVisible(point))
					{
						return;
					}
					
					if(currentTile != null)
					{
                        var resource;

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
												var eventDestroy = PrototypeLib.get(target.getBuildingType()).eventDestroy;
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
									var material = resource.getResourceType();
									var theory = "Extraction_" + material;
									var mineType = "Mine" + material;
									
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
									var p = PrototypeLib.get(currentTile.buildingType);
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
		
		var _addBuilding = function(buildingType, point)
		{
			var newBuilding = terrainMap.addBuilding(buildingType, point);
			return (newBuilding != null);
		};
		
		var _createCurrentTilePipe = function(pipeType, layer)
		{
			return { buildingType: "Pipe_" + pipeType + "_" + layer, image: "Pipe_" + pipeType + "_" + layer};
		};
		
		var _setPosition = function(point)
		{
			position = point;
			view.setPosition(position);
			mapView.setPosition(position);
		};
		
		var _redraw = function()
		{
            _updateRoboAvailable();
			view.redraw();
			mapView.redraw();
		};
		
		var _fromScreenPosition = function(point)
		{
			return view.fromScreenPosition(point);
		};
		
		var _findBuilding = function(point)
		{
			return terrainMap.findBuilding(point);
		};

        var _updateRoboAvailable = function()
        {
            view.setButton(20, true);
            if(state.getRoboDozerAvailable() <= 0)
            {
                view.setButton(20, false);
            }

            view.setButton(21, true);
            if((state.getRoboDiggerAvailable() <= 0) || (terrainMap.getLayer() == TerrainLayer.Surface))
            {
                view.setButton(21, false);
            }
        };

		var _setLayer = function(layer)
		{
            _setCurrentTile(null);

			terrainMap.setLayer(layer);

            view.setButton(26, true); // elevator
            view.setButton(30, true); // up
            view.setButton(31, true); // down

			if(layer == TerrainLayer.Surface)
			{
				view.setButton(30, false); // up
			}
			else if(layer == TerrainLayer.Deep)
			{
				view.setButton(26, false); // elevator
				view.setButton(31, false); // down
			}

			selectorView.setLayer(layer);

            _redraw();
		};
		
		var _goUp = function()
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
		
		var _goDown = function()
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

		var _goNorth = function()
		{
			if(position.x < terrainMap.getSize().x - view.getSize().x - 1)
			{
				position = { x: position.x + 1, y: position.y };
				_setPosition(position);
			}
		};
		
		var _goSouth = function()
		{
			if(position.x > 0)
			{
				position = { x: position.x - 1, y: position.y };
				_setPosition(position);
			}
		};
		
		var _goEast = function()
		{
			if(position.y < terrainMap.getSize().y - view.getSize().y - 1)
			{
				position = { x: position.x, y: position.y + 1 };
				_setPosition(position);
			}
		};
		
		var _goWest = function()
		{
			if(position.y > 0)
			{
				position = { x: position.x, y: position.y - 1 };
				_setPosition(position);
			}
		};
		
		var _doNext = function()
		{
			terrainMap.computation();
			terrainMap.simulation();
			_redraw();
            buildingInfo.refresh();
		};
		
		var _setAbsolutePosition = function(point)
		{
//TODO
			var canvasSize = view.getCanvasSize();
			view.setAbsolutePosition(point);

			selectorView.setAbsolutePosition({x: point.x, y: point.y + canvasSize.y});
		};
		
		var _setCurrentTile = function(item)
		{
			currentTile = item;
            buildingInfo.show(currentTile);
            _redraw();
		};
		
		var _showReport = function()
		{
			queueView.show(new ReportQueueData(state));
		};
		
		var _showProduction = function()
		{
			queueView.show(new ProductionQueueData(state));
		};
		
		var _showResearch = function()
		{
			queueView.show(new ResearchQueueData(state));
		};

		var _showHelp = function()
		{
			queueView.show(new HelpQueueData(state));
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
		
		//----------------------------------------- */
	}

	function Site(typology, imageName)
	{
		//-----------------------------------------
		
		this.getTypology = function() { return typology; };
		this.getImageName = function() { return imageName; };
		
		//-----------------------------------------
	}