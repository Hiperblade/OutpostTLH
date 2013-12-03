	//-----

	RecipeLib.add(RecipeType.Production, "Robo-Worker", { discovery: ["Robotics"] }, 1, { productionUnit: 3, productionStandardStructure: 1, metalOre: 2 }, { roboWorker: 1 });
	RecipeLib.add(RecipeType.Production, "Robo-Dozer",  { discovery: ["Robotics"] }, 2, { productionUnit: 2, productionStandardStructure: 1, metalOre: 4 }, { dozer: 1, fusionWaste: 2, toxicWaste: 1 });
	RecipeLib.add(RecipeType.Production, "Robo-Digger", { discovery: ["Robotics"] }, 3, { productionUnit: 2, productionStandardStructure: 1, metalOre: 4 }, { digger: 1, fusionWaste: 3, toxicWaste: 1 });

    RecipeLib.add(RecipeType.Production, "MicrowaveSatellite",  { }, 3, { productionUnit: 3, productionStandardStructure: 1 }, { MicrowaveSatellite: 1 });

    RecipeLib.add(RecipeType.Production, "RadioactiveBar", { technology: ["Tokamak"] }, 1, { productionUnit: 3, productionStandardStructure: 1, radioactiveOre: 2 }, { radioactiveBar: 10, radioactiveWaste: 3 });

    RecipeLib.add(RecipeType.Production, "Goods",   { technology: ["GoodsIndustry"] }, 1, { goodsUnit: 10, productionStandardStructure: 1 },                   { goods: 10,  fusionWaste: 3 });
    RecipeLib.add(RecipeType.Production, "MediKit", { technology: ["PharmaceuticalIndustry"] }, 1, { pharmaceuticalUnit: 15, productionStandardStructure: 1 }, { mediKit: 10, toxicWaste: 3 });

	//-----
	
	RecipeLib.add(RecipeType.Research, "ElectrostaticEnergy",	{ discovery: ["ElectrostaticDischarge"] },	2, { researchElaborationUnit: 1 },							{ technology: ["ElectrostaticCoil"] });
	RecipeLib.add(RecipeType.Research, "GeothermalEnergy",		{ discovery: ["Resource_Fumarole"] },		2, { researchUnit: 10, researchStructureDeep: 1 },			{ technology: ["Geothermal"] });
	
	RecipeLib.add(RecipeType.Research, "Mineralogy",			{ discovery: ["Resource_Mineral"] },		3, { researchUnit: 5,  researchStructureUnderground: 1 },	{ theory: ["Extraction_Mineral"] });
	RecipeLib.add(RecipeType.Research, "Metallurgy",			{ discovery: ["Resource_Metal"] },			3, { researchUnit: 5,  researchStructureUnderground: 1 },	{ theory: ["Extraction_Metal"] });
	RecipeLib.add(RecipeType.Research, "NuclearChemistry",		{ discovery: ["Resource_Radioactive"] },	3, { researchUnit: 5,  researchStructureUnderground: 1 },	{ theory: ["Extraction_Radioactive"] });

	RecipeLib.add(RecipeType.Research, "NuclearPhysics",		{ theory: ["Extraction_Radioactive"] },		5, { researchUnit: 10, researchStructureDeep: 1 },			{ technology: ["Tokamak"] });
	RecipeLib.add(RecipeType.Research, "ParticlePhysics",		{ technology: ["Tokamak"] },				5, { researchUnit: 10, researchStructureDeep: 2 },			{ technology: ["TokamakAdv"] });
	
	RecipeLib.add(RecipeType.Research, "Hydroponics",			{ technology: ["Agridome"] },				3, { researchUnit: 5, researchStructureSurface: 1 },		{ technology: ["AgridomeAdv"] });
	RecipeLib.add(RecipeType.Research, "Aquaponics",			{ technology: ["AgridomeAdv"] },			3, { researchUnit: 5, researchStructureSurface: 1 },		{ technology: ["AgridomeIntensive"] });
	RecipeLib.add(RecipeType.Research, "Medicine",				{ },										3, { researchUnit: 5, researchStructureUnderground: 1 },	{ technology: ["MedicalStructure"], theory: ["Medicine"] });
	RecipeLib.add(RecipeType.Research, "AdvancedMedicine",		{ theory: ["Medicine"] },					3, { researchUnit: 5, researchStructureDeep: 1 },			{ technology: ["MedicalStructureAdv"] });
	RecipeLib.add(RecipeType.Research, "Pharmacology",			{ theory: ["Medicine"] },					3, { researchUnit: 5, researchStructureUnderground: 1 },	{ technology: ["PharmaceuticalIndustry"] });
	RecipeLib.add(RecipeType.Research, "Embryology",			{ theory: ["Medicine"] },					3, { researchUnit: 5, researchStructureUnderground: 1 },	{ technology: ["Nursery"] });

	//-----
	
	
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
	
	
	
	//ResearchLib.add("ElectrostaticEnergy", { discovery: ["ElectrostaticDischarge"] }, 3, { researchUnit: 5, researchStructureUnderground: 1 }, { technology: ["ElectrostaticCoil"] });
	/*
	var cost = { researchUnit: 10, researchStructureUnderground: 1 };
	
	var researchUnit = colonyState.getRemainder("researchUnit");
	var researchStructure = colonyState.getRemainder("researchStructureSurface");
	var researchStructure = colonyState.getRemainder("researchStructureSurfaceAdv");
	var researchStructure = colonyState.getRemainder("researchStructureUnderground");
	var researchStructure = colonyState.getRemainder("researchStructureUndergroundAdv");
	var researchStructure = colonyState.getRemainder("researchStructureDeep");
	var researchStructure = colonyState.getRemainder("researchStructureDeepAdv");
	*/