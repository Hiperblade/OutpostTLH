	//eventBeginBuilding
	//eventEndBuilding
	//eventDestroy
	
	//-------------------------------------------------------------
	// landing
	
	PrototypeLib.add("LandingModule", TerrainLayer.Surface, 1, {}, { production: { controlUnit: 4 },
		eventBeginBuilding: function(item, map)
			{
				item.isHeadquarter = true;
				
				item.isPipe    = function() { return true; };
				item.haveNorth = function() { return true; };
				item.haveSouth = function() { return true; };
				item.haveEast  = function() { return true; };
				item.haveWest  = function() { return true; };
				item.haveUp    = function() { return false; };
				item.haveDown  = function() { return false; };
				
				var position = item.getPosition();
				if((position.x > 1) && (position.y > 1) &&
					(position.x < map.getSize().x) && (position.y < map.getSize().y))
				{
					if( (map.findResource({ x: position.x - 1, y: position.y - 1 }) == null) &&
						(map.findResource({ x: position.x,     y: position.y - 1 }) == null) &&
						(map.findResource({ x: position.x + 1, y: position.y - 1 }) == null) &&
						(map.findResource({ x: position.x - 1, y: position.y }) == null) &&
						(map.findResource({ x: position.x    , y: position.y }) == null) &&
						(map.findResource({ x: position.x + 1, y: position.y }) == null) &&
						(map.findResource({ x: position.x - 1, y: position.y + 1 }) == null) &&
						(map.findResource({ x: position.x    , y: position.y + 1 }) == null) &&
						(map.findResource({ x: position.x + 1, y: position.y + 1 }) == null) )
					{
						map.getState().delKnowledge({ technology: [ "LandingModule" ] });
						map.getState().createMaterials({ MicrowaveSatellite: 1 });
						return true;
					}
				}
				return false;
			},
		eventEndBuilding: function(item, map)
			{
				var position = item.getPosition();
				map.addPipe(PipeType.NorthEastSouthWest, TerrainLayer.Surface, { x: position.x - 1, y: position.y } );
				map.addPipe(PipeType.NorthEastSouthWest, TerrainLayer.Surface, { x: position.x - 1, y: position.y + 1} );
				map.addPipe(PipeType.NorthEastSouthWest, TerrainLayer.Surface, { x: position.x, y: position.y - 1} );
				map.addPipe(PipeType.NorthEastSouthWest, TerrainLayer.Surface, { x: position.x + 1, y: position.y - 1} );
				
				map.addBuilding("CommandCenter", { x: position.x - 1, y: position.y - 1 } );
				map.addBuilding("SupportModule", { x: position.x + 1, y: position.y } );
				map.addBuilding("CargoModule", { x: position.x, y: position.y + 1 } ).setFrozen(true);
				map.addBuilding("LaunchModule", { x: position.x + 1, y: position.y + 1 } ).setFrozen(true);
								
				map.getState().addKnowledge({ technology: [
					"MicrowavePlant",
						//"ElectrostaticCoil",
						//"Geothermal",
						//"StorageArea",
						//"Tokamak",
						//"TokamakAdv",
					"Capacitor",			
						//"CommandCenter",
					"MaintenanceCenter",
					"RoboRemittance",
						//"RoboRemittanceAdv",
					"RoboCommander",
						//"RoboCommanderAdv",
					"EnvironmentalControl",
						//"EnvironmentalControlAdv",
					"Agridome",
						//"AgridomeAdv",
						//"AgridomeIntensive",
						//"VerticalFarm",
						//"VerticalFarmAdv",
					"Residential",
						//"ResidentialAdv",
						//"Nursery",
						//"MedicalStructure",
						//"MedicalStructureAdv",
					"School",
					"Univesity",
						//"UnivesityAdv",
						//"RecreationalFacility",
						//"Park",
					"Warehouse",
					"Smelter",
						//"SmelterAdv",
					"StorageArea",
						//"GoodsFactory",
					"IndustrialFactory",
						//"ChemicalFactory",
						//"PharmaceuticalIndustry",
					"HotLab",
						//"HotLabAdv",
					"Lab",
						//"LabAdv",
					"DeepLab"
					] });
				
				map.getState().createMaterials({ dozer: 3, digger: 1 });
			}
		}).create = function(position)
		{
			return new Building("LandingModule", TerrainLayer.Surface, position, 1, "LandingPoint");
		};
	
	PrototypeLib.add("SupportModule", TerrainLayer.Surface, 2, {}, { production: { power: 200 },
		eventBeginBuilding: function(item, map)
			{
				item.isPipe    = function() { return true; };
				item.haveNorth = function() { return false; };
				item.haveSouth = function() { return true; };
				item.haveEast  = function() { return true; };
				item.haveWest  = function() { return false; };
				item.haveUp    = function() { return false; };
				item.haveDown  = function() { return false; };
				return true;
			}
		});
		
	PrototypeLib.add("LaunchModule", TerrainLayer.Surface, 2, {}, {
		eventBeginBuilding: function(item, map)
			{
				item.isPipe    = function() { return true; };
				item.haveNorth = function() { return false; };
				item.haveSouth = function() { return true; };
				item.haveEast  = function() { return false; };
				item.haveWest  = function() { return true; };
				item.haveUp    = function() { return false; };
				item.haveDown  = function() { return false; };
				return true;
			}
		}).create = function(position)
		{
			return new Building("LaunchModule", TerrainLayer.Surface, position, 2, "LandingPoint");
		};
		
	PrototypeLib.add("CargoModule", TerrainLayer.Surface, 2, {}, { capacity: { genericStorage: 200 },
		eventBeginBuilding: function(item, map)
			{
				item.isPipe    = function() { return true; };
				item.haveNorth = function() { return true; };
				item.haveSouth = function() { return false; };
				item.haveEast  = function() { return false; };
				item.haveWest  = function() { return true; };
				item.haveUp    = function() { return false; };
				item.haveDown  = function() { return false; };
				return true;
			}
		}).create = function(position)
		{
			return new Building("CargoModule", TerrainLayer.Surface, position, 2, "LandingPoint");
		};
	
	//-------------------------------------------------------------
	// produzione elettrica
	
	PrototypeLib.add("MicrowavePlant", TerrainLayer.Surface, 1, { MicrowaveSatellite: 1 }, { production: { power: 500 } });
	PrototypeLib.add("ElectrostaticCoil", TerrainLayer.Surface, 3, {}, { production: { power: 100 } });
	PrototypeLib.add("Geothermal", TerrainLayer.Deep, 10, {}, { requiredResource: "Fumarole", production: { power: 2000 } });
	
	PrototypeLib.add("StorageArea", TerrainLayer.Deep, 2, {}, { consumption: { power: 10 }, capacity: { radioactiveStorage: 100 } });
	PrototypeLib.add("Tokamak", TerrainLayer.Surface, 4, {}, { consumption: { radioactiveBar: 1 }, production: { power: 1000 },
		eventBeginBuilding: function(item, map)
			{
				var position = item.getPosition();
				if((map.findBuilding(position, TerrainLayer.Underground) == null) &&
					(map.findResource(position, TerrainLayer.Underground) == null))
				{
					map.addBuilding("TokamakReactor", position).setFrozen(true);
					return true;
				}
				return false;
			},
		eventEndBuilding: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
				while(!building.progressBuild()){}
				map.discoveryNearTiles(item.getPosition(), TerrainLayer.Underground);
			},
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	PrototypeLib.add("TokamakReactor", TerrainLayer.Underground, 1000, {}, {
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Surface);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	
	PrototypeLib.add("TokamakAdv", TerrainLayer.Surface, 8, {}, { consumption: { radioactiveBar: 1 }, production: { power: 1500 },
		eventBeginBuilding: function(item, map)
			{
				var position = item.getPosition();
				if((map.findBuilding(position, TerrainLayer.Underground) == null) &&
					(map.findResource(position, TerrainLayer.Underground) == null))
				{
					map.addBuilding("TokamakReactorAdv", position).setFrozen(true);
					return true;
				}
				return false;
			},
		eventEndBuilding: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
				while(!building.progressBuild()){}
				map.discoveryNearTiles(item.getPosition(), TerrainLayer.Underground);
			},
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	PrototypeLib.add("TokamakReactorAdv", TerrainLayer.Underground, 1000, {}, {
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Surface);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
		
	PrototypeLib.add("Capacitor", TerrainLayer.Surface, 2, {}, { capacity: { power: 1000 } });
	
	//-------------------------------------------------------------
	// logistica
	
	PrototypeLib.addPipe(PipeType.NorthEastSouthWest, TerrainLayer.Surface, 1, {}, { consumption: { power: 1 } });
	PrototypeLib.addPipe(PipeType.NorthSouth, TerrainLayer.Surface, 1, {}, { consumption: { power: 1 } });
	PrototypeLib.addPipe(PipeType.EastWest, TerrainLayer.Surface, 1, {}, { consumption: { power: 1 } });
	PrototypeLib.addPipe(PipeType.Down, TerrainLayer.Surface, 3, {}, { consumption: { power: 1 },
		eventBeginBuilding: function(item, map)
			{
				var position = item.getPosition();
				if((map.findBuilding(position, TerrainLayer.Underground) == null) &&
					(map.findResource(position, TerrainLayer.Underground) == null))
				{
					map.addPipe(PipeType.Up, TerrainLayer.Underground, position);
					return true;
				}
				return false;
			},
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	
	PrototypeLib.addPipe(PipeType.NorthEastSouthWest, TerrainLayer.Underground, 1, {}, { consumption: { power: 1 } });
	PrototypeLib.addPipe(PipeType.NorthSouth, TerrainLayer.Underground, 1, {}, { consumption: { power: 1 } });
	PrototypeLib.addPipe(PipeType.EastWest, TerrainLayer.Underground, 1, {}, { consumption: { power: 1 } });
	PrototypeLib.addPipe(PipeType.Down, TerrainLayer.Underground, 6, {}, { consumption: { power: 1 },
		eventBeginBuilding: function(item, map)
			{
				var position = item.getPosition();
				if((map.findBuilding(position, TerrainLayer.Deep) == null) &&
					(map.findResource(position, TerrainLayer.Deep) == null))
				{
					map.addPipe(PipeType.Up, TerrainLayer.Deep, position);
					return true;
				}
				return false;
			},
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Deep);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	PrototypeLib.addPipe(PipeType.Up, TerrainLayer.Underground, 3, {}, { consumption: { power: 1 },
		eventEndBuilding: function(item, map)
			{
				map.discoveryNearTiles(item.getPosition(), item.getLayer());
			},
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Surface);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	
	PrototypeLib.addPipe(PipeType.NorthEastSouthWest, TerrainLayer.Deep, 2, {}, { consumption: { power: 2 } });
	PrototypeLib.addPipe(PipeType.NorthSouth, TerrainLayer.Deep, 2, {}, { consumption: { power: 2 } });
	PrototypeLib.addPipe(PipeType.EastWest, TerrainLayer.Deep, 2, {}, { consumption: { power: 2 } });
	PrototypeLib.addPipe(PipeType.Up, TerrainLayer.Deep, 6, {}, { consumption: { power: 2 },
		eventEndBuilding: function(item, map)
			{
				map.discoveryNearTiles(item.getPosition(), item.getLayer());
			},
		eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	
	//-------------------------------------------------------------
	// gestionali
	
	PrototypeLib.add("CommandCenter", TerrainLayer.Surface, 3, {}, { consumption: { power: 10 }, production: { repairUnit: 500, researchElaborationUnit: 1 },
		eventBeginBuilding: function(item, map)
			{
				item.isHeadquarter = true;
				
				item.isPipe    = function() { return true; };
				item.haveNorth = function() { return true; };
				item.haveSouth = function() { return true; };
				item.haveEast  = function() { return true; };
				item.haveWest  = function() { return true; };
				item.haveUp    = function() { return false; };
				item.haveDown  = function() { return false; };
				
				return true;
			}
		});
	PrototypeLib.add("MaintenanceCenter", TerrainLayer.Surface, 3, { metalOre: 5 }, { consumption: { power: 20 }, production: { repairUnit: 1000, emergencyTeamUnit: 1 } });
	
	//-------------------------------------------------------------
	// gestione robot

	PrototypeLib.add("RoboRemittance", TerrainLayer.Surface, 2, {}, { consumption: { power: 5 }, capacity: { roboticStorage: 10 } });
	PrototypeLib.add("RoboRemittanceAdv", TerrainLayer.Surface, 2, {}, { consumption: { power: 5 }, capacity: { roboticStorage: 20 } });
	
	PrototypeLib.add("RoboCommander", TerrainLayer.Surface, 0, {}, { consumption: { power: 25 }, production: { controlUnit: 8 } });
	PrototypeLib.add("RoboCommanderAdv", TerrainLayer.Surface, 0, {}, { consumption: { power: 30 }, production: { controlUnit: 16 } });

	//-------------------------------------------------------------
	// risorse

	PrototypeLib.addResource("Metal", TerrainLayer.Surface, "#22BBFF");
	PrototypeLib.addResource("Mineral", TerrainLayer.Underground, "#AAAAFF");
	PrototypeLib.addResource("Radioactive", TerrainLayer.Deep, "#77FF77");
	PrototypeLib.addResource("Fumarole", TerrainLayer.Deep, "#FF9900");
	
	var mine_eventBeginBuilding = function(item, map)
	{
		var position = item.getPosition();
		if((map.findBuilding(position, TerrainLayer.Underground) == null) &&
			(map.findResource(position, TerrainLayer.Underground) == null))
		{
			map.addBuilding("Mine", position).setFrozen(true);
			return true;
		}
		return false;
	};
	
	var mine_eventEndBuilding = function(item, map)
	{
		var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
		while(!building.progressBuild()){}
		map.discoveryNearTiles(item.getPosition(), TerrainLayer.Underground);
	};

	var mine_eventDestroy = function(item, map)
	{
		var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
		if(building != null)
		{
			building.destroy();
		}
	};
	
	var mineDeep_eventBeginBuilding = function(item, map)
	{
		var position = item.getPosition();
		if((map.findBuilding(position, TerrainLayer.Deep) == null) &&
			(map.findResource(position, TerrainLayer.Deep) == null))
		{
			map.addBuilding("MineDeep", position).setFrozen(true);
			return true;
		}
		return false;
	};
	
	var mineDeep_eventEndBuilding = function(item, map)
	{
		var building = map.findBuilding(item.getPosition(), TerrainLayer.Deep);
		while(!building.progressBuild()){}
		map.discoveryNearTiles(item.getPosition(), TerrainLayer.Deep);
	};

	var mineDeep_eventDestroy = function(item, map)
	{
		var building = map.findBuilding(item.getPosition(), TerrainLayer.Deep);
		if(building != null)
		{
			building.destroy();
		}
	};
		
	PrototypeLib.addMine("Metal", TerrainLayer.Surface, 2, {}, { requiredResource: "Metal", consumption: { power: 5 }, production: { metalOre: 10 },
		eventBeginBuilding: mine_eventBeginBuilding,
		eventEndBuilding: mine_eventEndBuilding,
		eventDestroy: mine_eventDestroy
		});
	
	PrototypeLib.addMine("Mineral", TerrainLayer.Underground, 2, {}, { requiredResource: "Mineral", consumption: { power: 5 }, production: { cristalOre: 2, mineralOre: 10 },
		eventBeginBuilding: mineDeep_eventBeginBuilding,
		eventEndBuilding: mineDeep_eventEndBuilding,
		eventDestroy: mineDeep_eventDestroy
		});
	
	PrototypeLib.addMine("Radioactive", TerrainLayer.Deep, 2, {}, { requiredResource: "Radioactive", consumption: { power: 5 }, production: { radioactiveOre: 2 } });

	PrototypeLib.add("Mine", TerrainLayer.Underground, 1000, {}, {
			eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Surface);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
		
	PrototypeLib.add("MineDeep", TerrainLayer.Deep, 1000, {}, {
			eventDestroy: function(item, map)
			{
				var building = map.findBuilding(item.getPosition(), TerrainLayer.Underground);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	
	//-------------------------------------------------------------
	// sussistenza
	
	PrototypeLib.add("EnvironmentalControl", TerrainLayer.Surface, 10, {}, { consumption: { power: 80 }, production: { habitatUnit: 50 } } );
	PrototypeLib.add("EnvironmentalControlAdv", TerrainLayer.Surface, 10, {}, { consumption: { power: 80 }, production: { habitatUnit: 100 } } );
	
	PrototypeLib.add("Agridome", TerrainLayer.Surface, 3, {}, { consumption: { power: 5 }, production: { foodUnit: 10 }, capacity: { foodUnit: 50 } });
	PrototypeLib.add("AgridomeAdv", TerrainLayer.Surface, 4, {}, { consumption: { power: 5 }, production: { foodUnit: 20 }, capacity: { foodUnit: 50 } });
	PrototypeLib.add("AgridomeIntensive", TerrainLayer.Surface, 5, {}, { consumption: { power: 15 }, production: { foodUnit: 40 }, capacity: { foodUnit: 50 } });
	
	PrototypeLib.add("VerticalFarm", TerrainLayer.Deep, 8, {}, { consumption: { power: 15 }, production: { foodUnit: 50 }, capacity: { foodUnit: 100 } });
	PrototypeLib.add("VerticalFarmAdv", TerrainLayer.Deep, 8, {}, { consumption: { power: 20 }, production: { foodUnit: 70 }, capacity: { foodUnit: 100 } });
	
	PrototypeLib.add("Residential", TerrainLayer.Underground, 4, {}, { consumption: { power: 15, habitatUnit: 2 }, production: { residentialUnit: 16 } });
	PrototypeLib.add("ResidentialAdv", TerrainLayer.Underground, 5, {}, { consumption: { power: 25, habitatUnit: 4 }, production: { residentialUnit: 32 } });

	PrototypeLib.add("Nursery", TerrainLayer.Underground, 20, {}, { consumption: { power: 20 }, production: { nurseryUnit: 5 } });
	
	PrototypeLib.add("MedicalStructure", TerrainLayer.Underground, 10, {}, { consumption: { power: 20, pharmaceuticalUnit: 5 }, production: { medicalUnit: 15 } });
	PrototypeLib.add("MedicalStructureAdv", TerrainLayer.Underground, 10, {}, { consumption: { power: 30, pharmaceuticalUnit: 10 }, production: { medicalUnit: 30 } });
	
	PrototypeLib.add("School", TerrainLayer.Underground, 6, {}, { consumption: { power: 20 }, production: { educationUnit: 80 } });
	PrototypeLib.add("Univesity", TerrainLayer.Underground, 8, {}, { consumption: { power: 30 }, production: { higthEducationUnit: 30 } });
	PrototypeLib.add("UnivesityAdv", TerrainLayer.Underground, 8, {}, { consumption: { power: 30 }, production: { higthEducationUnit: 60 } });
	
	PrototypeLib.add("RecreationalFacility", TerrainLayer.Underground, 15, {}, { consumption: { power: 80 }, production: { recreationalUnit: 60 } });
	
	var park = PrototypeLib.add("Park", TerrainLayer.Deep, 4, {}, { consumption: { power: 80 }, production: { recreationalUnit: 120 },
		eventBeginBuilding: function(item, map)
			{
				var position = item.getPosition();
				var layer = item.getLayer();
				if((position.x > 1) && (position.y > 1) &&
					(position.x < map.getSize().x) && (position.y < map.getSize().y))
				{
					if( (map.findResource({ x: position.x,		y: position.y - 1 }, layer) == null) &&
						(map.findResource({ x: position.x + 1,	y: position.y - 1 }, layer) == null) &&
						(map.findResource({ x: position.x + 1,	y: position.y }, layer) == null) &&
						(map.findResource({ x: position.x    ,  y: position.y }, layer) == null) &&
						(map.findBuilding({ x: position.x,		y: position.y - 1 }, layer) == null) &&
						(map.findBuilding({ x: position.x + 1,	y: position.y - 1 }, layer) == null) &&
						(map.findBuilding({ x: position.x + 1,	y: position.y }, layer) == null) &&
						(map.findBuilding({ x: position.x    ,  y: position.y }, layer) == null) )
					{
						map.addBuilding("Park_w", { x: position.x    , y: position.y - 1} ).setFrozen(true);
						map.addBuilding("Park_n", { x: position.x + 1, y: position.y - 1} ).setFrozen(true);
						map.addBuilding("Park_e", { x: position.x + 1, y: position.y} ).setFrozen(true);
						return true;
					}
				}
				return false;
			},
		eventEndBuilding: function(item, map)
			{
				var position = item.getPosition();
				var layer = item.getLayer();
				var building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
				while(!building.progressBuild()){}
				building = map.findBuilding({ x: position.x + 1, y: position.y - 1 }, layer);
				while(!building.progressBuild()){}
				building = map.findBuilding({ x: position.x + 1, y: position.y }, layer);
				while(!building.progressBuild()){}
			},
		eventDestroy: function(item, map)
			{
				var position = item.getPosition();
				var layer = item.getLayer();
				var building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x + 1, y: position.y - 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x + 1, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	park.getBuildingImageId = function()
	{
		return "Park_mini";
	};
	park.getAreaType = function()
	{
		return AreaTypes.Four;
	};
		
	PrototypeLib.add("Park_w", TerrainLayer.Deep, 1, {}, {
			eventDestroy: function(item, map)
			{
				var position = item.getPosition();
				var layer = item.getLayer();
				var building = map.findBuilding({ x: position.x, y: position.y + 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x + 1, y: position.y + 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x + 1, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	PrototypeLib.add("Park_n", TerrainLayer.Deep, 1, {}, {
			eventDestroy: function(item, map)
			{
				var position = item.getPosition();
				var layer = item.getLayer();
				var building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x - 1, y: position.y - 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x - 1, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	PrototypeLib.add("Park_e", TerrainLayer.Deep, 1, {}, {
			eventDestroy: function(item, map)
			{
				var position = item.getPosition();
				var layer = item.getLayer();
				var building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x - 1, y: position.y - 1 }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x - 1, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
				building = map.findBuilding({ x: position.x, y: position.y }, layer);
				if(building != null)
				{
					building.destroy();
				}
			}
		});
	
	//-------------------------------------------------------------
	// produzione
	
	PrototypeLib.add("Warehouse", TerrainLayer.Surface, 2, {}, { consumption: { power: 5 }, capacity: { genericStorage: 100 } });
	
	PrototypeLib.add("Smelter", TerrainLayer.Surface, 6, {}, { consumption: { power: 40, metalOre: 5 }, production: { ironBar: 3 }});
	PrototypeLib.add("SmelterAdv", TerrainLayer.Surface, 7, {}, { consumption: { power: 40, metalOre: 10 }, production: { ironBar: 8 }});

	PrototypeLib.add("GoodsFactory", TerrainLayer.Surface, 10, {}, { consumption: { power: 40, mineralOre: 4, metalOre: 2 }, production: { goodsUnit: 30 }});
	PrototypeLib.add("PharmaceuticalIndustry", TerrainLayer.Surface, 20, {}, { consumption: { power: 40, mineralOre: 10, cristalOre: 5 }, production: { pharmaceuticalUnit: 60 }});
		
	PrototypeLib.add("IndustrialFactory", TerrainLayer.Surface, 12, {}, { consumption: { power: 40 }, production: { productionUnit: 40, productionStandardStructure: 1 } });
	PrototypeLib.add("ChemicalFactory", TerrainLayer.Surface, 15, {}, { consumption: { power: 80 }, production: { productionUnit: 80, productionChemicalStructure: 1  } });

	//-------------------------------------------------------------
	// ricerca
	
	PrototypeLib.add("HotLab", TerrainLayer.Surface, 4, {}, { consumption: { power: 20 }, production: { researchUnit: 8, researchStructureSurface: 3 } });
	PrototypeLib.add("HotLabAdv", TerrainLayer.Surface, 8, {}, { consumption: { power: 80 }, production: { researchUnit: 32, researchStructureSurface: 6, researchStructureSurfaceAdv: 1 } });
	PrototypeLib.add("Lab", TerrainLayer.Underground, 6, {}, { consumption: { power: 25 }, production: { researchUnit: 10, researchStructureUnderground: 2 } });
	PrototypeLib.add("LabAdv", TerrainLayer.Underground, 8, {}, { consumption: { power: 50 }, production: { researchUnit: 15, researchStructureUnderground: 4, researchStructureUndergroundAdv: 1 } });
	PrototypeLib.add("DeepLab", TerrainLayer.Deep, 10, {}, { consumption: { power: 100 }, production: { researchUnit: 20, researchStructureDeep: 1, researchStructureDeepAdv: 1 } });

    //-------------------------------------------------------------
    // speciali

    var spacePort = PrototypeLib.add("SpacePort", TerrainLayer.Surface, 4, {}, { consumption: { power: 200 }, production: {  },
        eventBeginBuilding: function(item, map)
        {
            var position = item.getPosition();
            var layer = item.getLayer();
            if((position.x > 1) && (position.y > 1) &&
                (position.x < map.getSize().x) && (position.y < map.getSize().y))
            {
                if( (map.findResource({ x: position.x,		y: position.y - 1 }, layer) == null) &&
                    (map.findResource({ x: position.x + 1,	y: position.y - 1 }, layer) == null) &&
                    (map.findResource({ x: position.x + 1,	y: position.y }, layer) == null) &&
                    (map.findResource({ x: position.x    ,  y: position.y }, layer) == null) &&
                    (map.findBuilding({ x: position.x,		y: position.y - 1 }, layer) == null) &&
                    (map.findBuilding({ x: position.x + 1,	y: position.y - 1 }, layer) == null) &&
                    (map.findBuilding({ x: position.x + 1,	y: position.y }, layer) == null) &&
                    (map.findBuilding({ x: position.x    ,  y: position.y }, layer) == null) &&
                    // undergound
                    (map.findResource({ x: position.x,		y: position.y - 1 }, TerrainLayer.Underground) == null) &&
                    (map.findResource({ x: position.x + 1,	y: position.y - 1 }, TerrainLayer.Underground) == null) &&
                    (map.findResource({ x: position.x + 1,	y: position.y }, TerrainLayer.Underground) == null) &&
                    (map.findResource({ x: position.x    ,  y: position.y }, TerrainLayer.Underground) == null) &&
                    (map.findBuilding({ x: position.x,		y: position.y - 1 }, TerrainLayer.Underground) == null) &&
                    (map.findBuilding({ x: position.x + 1,	y: position.y - 1 }, TerrainLayer.Underground) == null) &&
                    (map.findBuilding({ x: position.x + 1,	y: position.y }, TerrainLayer.Underground) == null) &&
                    (map.findBuilding({ x: position.x    ,  y: position.y }, TerrainLayer.Underground) == null) )
                {
                    map.addBuilding("SpacePort_w", { x: position.x    , y: position.y - 1} ).setFrozen(true);
                    map.addBuilding("SpacePort_n", { x: position.x + 1, y: position.y - 1} ).setFrozen(true);
                    map.addBuilding("SpacePort_e", { x: position.x + 1, y: position.y} ).setFrozen(true);

                    map.addBuilding("SpacePort_u",   { x: position.x    , y: position.y} ).setFrozen(true);
                    map.addBuilding("SpacePort_u_w", { x: position.x    , y: position.y - 1} ).setFrozen(true);
                    map.addBuilding("SpacePort_u_n", { x: position.x + 1, y: position.y - 1} ).setFrozen(true);
                    map.addBuilding("SpacePort_u_e", { x: position.x + 1, y: position.y} ).setFrozen(true);
                    return true;
                }
            }
            return false;
        },
        eventEndBuilding: function(item, map)
        {
            var position = item.getPosition();
            var layer = item.getLayer();
            var building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
            while(!building.progressBuild()){}
            building = map.findBuilding({ x: position.x + 1, y: position.y - 1 }, layer);
            while(!building.progressBuild()){}
            building = map.findBuilding({ x: position.x + 1, y: position.y }, layer);
            while(!building.progressBuild()){}
            // undergound
            layer = TerrainLayer.Underground;
            building = map.findBuilding({ x: position.x, y: position.y }, layer);
            while(!building.progressBuild()){}
            building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
            while(!building.progressBuild()){}
            building = map.findBuilding({ x: position.x + 1, y: position.y - 1 }, layer);
            while(!building.progressBuild()){}
            building = map.findBuilding({ x: position.x + 1, y: position.y }, layer);
            while(!building.progressBuild()){}
        },
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll(position, map);
        }
    });
    spacePort.getBuildingImageId = function()
    {
        return "SpacePort_mini";
    };
    spacePort.getAreaType = function()
    {
        return AreaTypes.Four;
    };
    spacePort.destroyAll = function(position, map)
    {
        var layer = TerrainLayer.Surface;
        var building = map.findBuilding({ x: position.x, y: position.y }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x + 1, y: position.y - 1 }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x + 1, y: position.y }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x, y: position.y }, layer);
        if(building != null)
        {
            building.destroy();
        }
        // undergound
        layer = TerrainLayer.Underground;
        building = map.findBuilding({ x: position.x, y: position.y }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x, y: position.y - 1 }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x + 1, y: position.y - 1 }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x + 1, y: position.y }, layer);
        if(building != null)
        {
            building.destroy();
        }
        building = map.findBuilding({ x: position.x, y: position.y }, layer);
        if(building != null)
        {
            building.destroy();
        }
    };

    PrototypeLib.add("SpacePort_w", TerrainLayer.Surface, 1, {}, {
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll({ x: position.x, y: position.y + 1 }, map);
        }
    });
    PrototypeLib.add("SpacePort_n", TerrainLayer.Surface, 1, {}, {
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll({ x: position.x - 1, y: position.y + 1 }, map);
        }
    });
    PrototypeLib.add("SpacePort_e", TerrainLayer.Surface, 1, {}, {
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll({ x: position.x - 1, y: position.y }, map);
        }
    });
    // underground
    PrototypeLib.add("SpacePort_u", TerrainLayer.Underground, 1, {}, {
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll({ x: position.x, y: position.y }, map);
        }
    });
    PrototypeLib.add("SpacePort_u_w", TerrainLayer.Underground, 1, {}, {
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll({ x: position.x, y: position.y + 1 }, map);
        }
    });
    PrototypeLib.add("SpacePort_u_n", TerrainLayer.Underground, 1, {}, {
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll({ x: position.x - 1, y: position.y + 1 }, map);
        }
    });
    PrototypeLib.add("SpacePort_u_e", TerrainLayer.Underground, 1, {}, {
        eventDestroy: function(item, map)
        {
            var position = item.getPosition();
            spacePort.destroyAll({ x: position.x - 1, y: position.y }, map);
        }
    });