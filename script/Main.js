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
		var position = { x: 0, y: 0 };
		var state = null;
		
		var currentTile = null;

		var _initialize = function()
		{
			document.onkeydown = function(event)
			{
				event = event || window.event;
				var e = event.keyCode;
				if(e == 38)
				{
					_goNorth();
				}
				else if(e == 39)
				{
					_goEast();
				}
				else if(e == 40)
				{
					_goSouth();
				}
				else if(e == 37)
				{
					_goWest();
				}
			}
			
			var _onChangePosition = function(newPosition)
			{
				newPosition.x -= Math.floor(areaSize.x / 2);
				newPosition.y -= Math.floor(areaSize.y / 2);
				if(newPosition.x < 0) newPosition.x = 0;
				if(newPosition.y < 0) newPosition.y = 0;
				
				_setPosition(newPosition);
			}
			
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
			}
			
			terrainMap = new TerrainMap(site.getTypology(), MAP_SIZE);
			state = terrainMap.getState();
			view = new IsometricView (terrainMap, mapCanvas, areaSize, TILE_DIMENSION);
			mapView = new MapView(terrainMap, miniMapCanvas, site.getImageName(), areaSize, _onChangePosition);
			var canvasSize = view.getCanvasSize();
			selectorView = new BuildingSelectorView(selectorCanvas, canvasSize.x, state, _onSelected);
			queueView = new QueueView("queueDiv", "queueCanvas", canvasSize);
					
			// pulsanti spostamento
			view.addButtonGrid(10, { x: Math.floor(areaSize.x / 2), y: -1 }, "button_west", function (){ _goWest(); });
			view.addButtonGrid(11, { x: areaSize.x, y: Math.floor(areaSize.y / 2) }, "button_north", function() { _goNorth(); });
			view.addButtonGrid(12, { x: Math.floor(areaSize.x / 2), y: areaSize.y }, "button_east",  function() { _goEast(); });
			view.addButtonGrid(13, { x: -1, y: Math.floor(areaSize.y / 2) }, "button_south", function() { _goSouth(); });

			// bordo
			for(var index = 0; index < areaSize.y; index++)
			{
				view.addImageGrid(300 + index, { x: -1, y: index }, "tileBorder_left")
			}
			for(var index = 0; index < areaSize.x; index++)
			{
				// alto sinistra
			//	view.addImageGrid(200 + index, { x: index, y: -1 }, "tileBorder_right")
			}
			for(var index = areaSize.x -1; index >= 0; index--)
			{
				view.addImageGrid(200 + index, { x: index, y: areaSize.y }, "tileBorder_right")
			}
	
			view.addImageButton(20, { x: 10, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile({ isRobot: true, robotType: RobotTypes.Dozer, buildingType: "RoboDozer", image: "RoboDozer" }); }, "button_roboDozer");
			view.addImageButton(21, { x: 50, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile({ isRobot: true, robotType: RobotTypes.Digger, buildingType: "RoboDigger", image: "RoboDigger" } ); }, "button_roboDigger");
			view.addImageButton(22, { x: 90, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile({ isRobot: true, robotType: RobotTypes.Miner, buildingType: "RoboMiner", image: "RoboMiner" }); }, "button_roboMiner");
			
			view.addImageButton(23, { x: 140, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.NorthEastSouthWest, terrainMap.getLayer())); }, "button_pipeNorthEastSouthWest");
			view.addImageButton(24, { x: 180, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.EastWest, terrainMap.getLayer())); }, "button_pipeEastWest");
			view.addImageButton(25, { x: 220, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.NorthSouth, terrainMap.getLayer())); }, "button_pipeNorthSouth");
			view.addImageButton(26, { x: 260, y: canvasSize.y - 10 }, "button_base", function() { _setCurrentTile(_createCurrentTilePipe(PipeType.Down, terrainMap.getLayer())); }, "button_pipeDown");
			
			view.addImageButton(27, { x: 310, y: canvasSize.y - 10 }, "button_base", function() { selectorView.show(); }, "button_building");
			
			view.addButton(30, { x: canvasSize.x - 40, y: view.getVerticalMiddle() - 50 }, "button_up", function() { _goUp(); });
			view.addButton(31, { x: canvasSize.x - 40, y: view.getVerticalMiddle() + 50 + 30 }, "button_down", function() { _goDown(); });
			
			view.addImageButton(40, { x: canvasSize.x - 220, y: canvasSize.y - 10 }, "button_base", function() { _showHelp(); }, "button_help");
			
			view.addImageButton(50, { x: canvasSize.x - 170, y: canvasSize.y - 10 }, "button_base", function() { _showReport(); }, "button_report");
			view.addImageButton(51, { x: canvasSize.x - 130, y: canvasSize.y - 10 }, "button_base", function() { _showProduction(); }, "button_production");
			view.addImageButton(52, { x: canvasSize.x - 90, y: canvasSize.y - 10 }, "button_base", function() { _showResearch(); }, "button_research");
			
			view.addImageButton(60, { x: canvasSize.x - 40, y: canvasSize.y - 10 }, "button_base", function() { _doNext(); }, "button_time");
			
			view.addImage(102, { x: 10, y: canvasSize.y - 60 }, "baseTile");
			view.addImage(100, { x: 10, y: canvasSize.y - 60 }, null);
			view.addText(100, { x: 10 + TILE_DIMENSION.x, y: canvasSize.y - 60 }, 20, null);
			view.addImage(101, { x: 13, y: canvasSize.y - 58 }, "microTile");
			
			view.setGridCallback(function(point)
				{
					var target = _findBuilding(point);
					if(!terrainMap.isVisible(point))
					{
						return;
					}
					
					if(currentTile != null)
					{
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
Log.dialog("Non è disponibile nessuna " + TextRepository.get(RobotTypes.Dozer) + "!");
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
Log.dialog("Non è disponibile nessuna " + TextRepository.get(RobotTypes.Dozer) + "!");
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
Log.dialog("Non è disponibile nessuna " + TextRepository.get(RobotTypes.Digger) + "!");
											}
										}
									}
								}
							}
							else if(currentTile.robotType == RobotTypes.Miner)
							{
								var resource = terrainMap.findResource(point);
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
Log.dialog("Il terreno non è spianato!");
										}
									}
									else
									{
Log.dialog("Non hai la tecnologia per estrarre questa risorsa!");
									}
								}
							}
						}
						else
						{
							if(target == null)
							{
								if(!terrainMap.isRazable(point))
								{
									var resource = terrainMap.findResource(point);
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
						if(target != null && target.isPipe())
						{
							if(!target.underConstruction() && !target.isDestroyed())
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
					}
				});
			
			view.setButtonsCallback(function(id)
				{
				});
		
			terrainMap.simulation();		
			_setAbsolutePosition({x: 5, y: 5});
			_setLayer(TerrainLayer.Surface);
		}
		
		var _addBuilding = function(buildingType, point)
		{
			var newBuilding = terrainMap.addBuilding(buildingType, point);
			return (newBuilding != null);
		}
		
		var _createCurrentTilePipe = function(pipeType, layer)
		{
			return { buildingType: "Pipe_" + pipeType + "_" + layer, image: "Pipe_" + pipeType + "_" + layer};
		}
		
		var _setPosition = function(point)
		{
			position = point;
			view.setPosition(position);
			mapView.setPosition(position);
		}
		
		var _redraw = function()
		{
			view.redraw();
			mapView.redraw();
		}
		
		var _fromScreenPosition = function(point)
		{
			return view.fromScreenPosition(point);
		}
		
		var _findBuilding = function(point)
		{
			return terrainMap.findBuilding(point);
		}
		
		var _setLayer = function(layer)
		{
			terrainMap.setLayer(layer);
			
			if(layer == TerrainLayer.Surface)
			{
				view.setButton(21, false);
				view.setButton(26, true);
				view.setButton(30, false);
				view.setButton(31, true);
			}
			else if(layer == TerrainLayer.Underground)
			{
				view.setButton(21, true);
				view.setButton(26, true);
				view.setButton(30, true);
				view.setButton(31, true);
			}
			else if(layer == TerrainLayer.Deep)
			{
				view.setButton(21, true);
				view.setButton(26, false);
				view.setButton(30, true);
				view.setButton(31, false);
			}

			selectorView.setLayer(layer);
			_redraw(); 
		}
		
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
			_setCurrentTile(null);
			_redraw();
		}
		
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
			_setCurrentTile(null);
			_redraw();
		}

		var _goNorth = function()
		{
			if(position.x < terrainMap.getSize().x - view.getSize().x - 1)
			{
				position = { x: position.x + 1, y: position.y };
				_setPosition(position);
			}
		}
		
		var _goSouth = function()
		{
			if(position.x > 0)
			{
				position = { x: position.x - 1, y: position.y };
				_setPosition(position);
			}
		}
		
		var _goEast = function()
		{
			if(position.y < terrainMap.getSize().y - view.getSize().y - 1)
			{
				position = { x: position.x, y: position.y + 1 };
				_setPosition(position);
			}
		}
		
		var _goWest = function()
		{
			if(position.y > 0)
			{
				position = { x: position.x, y: position.y - 1 };
				_setPosition(position);
			}
		}
		
		var _doNext = function()
		{
			terrainMap.computation();
			terrainMap.simulation();
			_redraw();
		}
		
		var _setAbsolutePosition = function(point)
		{
			var canvasSize = view.getCanvasSize();
			view.setAbsolutePosition(point);
			mapView.setAbsolutePosition({x: canvasSize.x - MAP_SIZE.y + point.x, y: point.y});
			selectorView.setAbsolutePosition({x: point.x, y: point.y + canvasSize.y});
			queueView.setAbsolutePosition(point);
		}
		
		var _setCurrentTile = function(item)
		{
			currentTile = item;
			if(item == null)
			{
				view.setImage(100, null);
				view.setText(100, null);
				view.setImage(101, "microTile");
			}
			else if(item.image != undefined)
			{
				view.setImage(100, item.image);
				
				if(item.isRobot)
				{
					view.setText(100, item.buildingType);
				}
				else
				{
					view.setText(100, null);
				}
				
				view.setImage(101, "microTile_" + AreaTypes.One);
			}
			else
			{
				var protoType = PrototypeLib.get(item.buildingType);
				view.setImage(100, protoType.getBuildingImageId());
				view.setText(100, item.buildingType);
				view.setImage(101, "microTile_" + protoType.getAreaType());
			}
			_redraw();
		}
		
		var _showReport = function()
		{
			queueView.show(new ReportQueueData(state));
		}
		
		var _showProduction = function()
		{
			queueView.show(new ProductionQueueData(state));
		}
		
		var _showResearch = function()
		{
			queueView.show(new ResearchQueueData(state));
		}

		var _showHelp = function()
		{
			queueView.show(new HelpQueueData(state));
		}
		
		_initialize();

		//-----------------------------------------
		
		this.getTerrainMap = function() { return terrainMap; }
		this.getState = function() { return state; }

		this.getLayer = function() { return terrainMap.getLayer(); }
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
		var typology = typology;
		var imageName = imageName;
		
		//-----------------------------------------
		
		this.getTypology = function() { return typology; }
		this.getImageName = function() { return imageName; }
		
		//-----------------------------------------
	}