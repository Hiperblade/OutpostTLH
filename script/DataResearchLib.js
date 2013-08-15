	ResearchLib.add("ElectrostaticEnergy",	{ discovery: ["ElectrostaticDischarge"] },	2, { researchElaborationUnit: 1 },							{ technology: ["ElectrostaticCoil"] });
	ResearchLib.add("GeothermalEnergy",		{ discovery: ["Resource_Fumarole"] },		2, { researchUnit: 10, researchStructureDeep: 1 },			{ technology: ["Geothermal"] });
	
	ResearchLib.add("Mineralogy",			{ discovery: ["Resource_Mineral"] },		3, { researchUnit: 5,  researchStructureUnderground: 1 },	{ theory: ["Extraction_Mineral"] });
	ResearchLib.add("Metallurgy",			{ discovery: ["Resource_Metal"] },			3, { researchUnit: 5,  researchStructureUnderground: 1 },	{ theory: ["Extraction_Metal"] });
	ResearchLib.add("NuclearChemistry",		{ discovery: ["Resource_Radioactive"] },	3, { researchUnit: 5,  researchStructureUnderground: 1 },	{ theory: ["Extraction_Radioactive"] });

	ResearchLib.add("NuclearPhysics",		{ theory: ["Extraction_Radioactive"] },		5, { researchUnit: 10, researchStructureDeep: 1 },			{ technology: ["Tokamak"] });
	ResearchLib.add("ParticlePhysics",		{ technology: ["Tokamak"] },				5, { researchUnit: 10, researchStructureDeep: 2 },			{ technology: ["TokamakAdv"] });
	
	ResearchLib.add("Hydroponics",			{ technology: ["Agridome"] },				3, { researchUnit: 5, researchStructureSurface: 1 },		{ technology: ["AgridomeAdv"] });
	ResearchLib.add("Aquaponics",			{ technology: ["AgridomeAdv"] },			3, { researchUnit: 5, researchStructureSurface: 1 },		{ technology: ["AgridomeIntensive"] });
	ResearchLib.add("Medicine",				{ },										3, { researchUnit: 5, researchStructureUnderground: 1 },	{ technology: ["MedicalStructure"], theory: ["Medicine"] });
	ResearchLib.add("AdvancedMedicine",		{ theory: ["Medicine"] },					3, { researchUnit: 5, researchStructureDeep: 1 },			{ technology: ["MedicalStructureAdv"] });
	ResearchLib.add("Pharmacology",			{ theory: ["Medicine"] },					3, { researchUnit: 5, researchStructureUnderground: 1 },	{ technology: ["PharmaceuticalIndustry"] });
	ResearchLib.add("Embryology",			{ theory: ["Medicine"] },					3, { researchUnit: 5, researchStructureUnderground: 1 },	{ technology: ["Nursery"] });
	
	
	
	
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