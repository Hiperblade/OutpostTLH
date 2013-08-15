	ProductionLib.add("Robo-Worker", { discovery: ["Robotics"] }, 1, { productionUnit: 3, productionStandardStructure: 1, metalOre: 2 }, { roboWorker: 1 });
	ProductionLib.add("Robo-Dozer", { discovery: ["Robotics"] }, 2, { productionUnit: 2, productionStandardStructure: 1, metalOre: 4 }, { dozer: 1, toxicWaste: 1 });
	ProductionLib.add("Robo-Digger", { discovery: ["Robotics"] }, 3, { productionUnit: 2, productionStandardStructure: 1, metalOre: 4 }, { digger: 1, toxicWaste: 1 });
	
	//productionWaste: { toxicWaste: 2 }
	//, mineralOre: 20, cristalOre: 1
			/*
			
			productionStandardStructure
			productionChemicalStructure
			
			
			var productionUnit = colonyState.getRemainder("productionUnit");
			var productionStructure = colonyState.getRemainder("productionStructureSurface");
			var productionStructure = colonyState.getRemainder("productionStructureSurfaceAdv");
			var productionStructure = colonyState.getRemainder("productionStructureUnderground");
			var productionStructure = colonyState.getRemainder("productionStructureUndergroundAdv");
			var productionStructure = colonyState.getRemainder("productionStructureDeep");
			var productionStructure = colonyState.getRemainder("productionStructureDeepAdv");
			*/