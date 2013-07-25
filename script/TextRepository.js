function TextRepository() { }

TextRepository.data = {};
TextRepository.defaultLanguage = "it";

TextRepository.get = function(id, language)
{
	language = language || TextRepository.defaultLanguage;

	if(TextRepository.data[language] == undefined)
	{
		TextRepository.data[language] = {};
	}
	
	if(TextRepository.data[language][id] == undefined)
	{
		return "<" + id + ">";
	}
	return TextRepository.data[language][id];
}
	
TextRepository.add = function(id, text, language)
{
	language = language || TextRepository.defaultLanguage;
	
	if(TextRepository.data[language] == undefined)
	{
		TextRepository.data[language] = {};
	}
	TextRepository.data[language][id] = text;
}

// --- Base
TextRepository.add(TerrainLayer.Surface, "Superfice");
TextRepository.add(TerrainLayer.Underground, "Sottosuolo");
TextRepository.add(TerrainLayer.Deep, "Profondità");

TextRepository.add("Base", "Base");
TextRepository.add("Advanced", "Avanzate");
TextRepository.add("Extended", "Estese");

TextRepository.add("RoboDozer", "Ruspa Robotica");
TextRepository.add("RoboDigger", "Scavatrice Robotica");
TextRepository.add("RoboMiner", "Trivella Robotica");

// --- Testi
TextRepository.add("Active", "Attivi");
TextRepository.add("Idle", "Inattivi");
TextRepository.add("Production", "Produzione");
TextRepository.add("Consumption", "Consumo");
TextRepository.add("Total", "Totale");
TextRepository.add("Progress", "Avanzamento");
TextRepository.add("Stored", "Riserve");
TextRepository.add("Surplus", "Surplus");
TextRepository.add("Materials", "Materiali");

TextRepository.add("Consumption", "Consumo");

TextRepository.add("unavailable", "[non disponibile]");
TextRepository.add("Available", "Disponibili");
TextRepository.add("ProductionTitle", "Riepilogo Produzione");
TextRepository.add("Working", "In produzione");
TextRepository.add("ResearchTitle", "Riepilogo Ricerca");
TextRepository.add("Researching", "In studio");
TextRepository.add("ReportTitle", "Report");
TextRepository.add("ReportBase", "Sezioni");
TextRepository.add("ReportEvents", "Eventi");
TextRepository.add("HelpTitle", "Guida");
TextRepository.add("HelpBase", "Guide");
TextRepository.add("Buildings", "Edifici");
TextRepository.add("HelpTutorial_Base", "Interfaccia");

TextRepository.add("TerrainLayer", "Livello");

TextRepository.add("BuildingTitle", "Costruzione");
TextRepository.add("BuildingTime", "Tempo di costruzione");
TextRepository.add("BuildingCost", "Costo di costruzione");
TextRepository.add("BuildingCapacity", "Capacità dell'edificio");

TextRepository.add("ProductionTitle", "Produzione");
TextRepository.add("BuildingConsumption", "Consuma");
TextRepository.add("BuildingProduction", "Produce");
TextRepository.add("BuildingWaste", "Scorie prodotte");
TextRepository.add("Requirements", "Requisiti");

TextRepository.add("Humans", "Umani");
TextRepository.add("Population", "Popolazione");
TextRepository.add("wellness", "Benessere");
TextRepository.add("happiness", "Felicità");
TextRepository.add("infants", "Neonati");
TextRepository.add("students", "Studenti");
TextRepository.add("researchers", "Ricercatori");
TextRepository.add("scientists", "Scienziati");
TextRepository.add("retirees", "Pensionati");
TextRepository.add("deads", "Morti");

// --- Materiali
TextRepository.add("researchElaborationUnit", "Unità di Elaborazione");
TextRepository.add("researchStructureSurface", "Laboratori di Superfice");
TextRepository.add("researchStructureSurfaceAdv", "Laboratori di Superfice Avanzati");
TextRepository.add("researchStructureUnderground", "Laboratori Sotterranei");
TextRepository.add("researchStructureUndergroundAdv", "Laboratori Sotterranei Avanzati");
TextRepository.add("researchStructureDeep", "Laboratori di Profondità");
TextRepository.add("researchStructureDeepAdv", "Laboratori di Profondità Avanzati");
TextRepository.add("productionStandardStructure", "Strutture Produttive Standard");
TextRepository.add("researchUnit", "Unità di Ricerca");
TextRepository.add("productionUnit", "Unità di Produzione");
TextRepository.add("emergencyTeamUnit", "Unità di Pronto Intervento");
TextRepository.add("controlUnit", "Unità di Controllo");
TextRepository.add("habitatUnit", "Unità di Supporto Ambientale");
TextRepository.add("repairUnit", "Manutenzione");
TextRepository.add("foodUnit", "Cibo");
TextRepository.add("residentialUnit", "Unità Abitative");
TextRepository.add("educationUnit", "Unità Educative");
TextRepository.add("higthEducationUnit", "Unità Educative Superiore");
TextRepository.add("recreationalUnit", "Unità Ricreative");
TextRepository.add("pharmaceuticalUnit", "Unità Farmaceutiche");
TextRepository.add("medicalUnit", "Unità Medicali");
TextRepository.add("nurseryUnit", "Unità Pediatriche");
TextRepository.add("goodsUnit", "Beni di Consumo");

TextRepository.add("power", "Energia");
TextRepository.add("mineralOre", "Minerali Amorfi");
TextRepository.add("cristalOre", "Minerali Cristallini");
TextRepository.add("metalOre", "Minerali Metallici");
TextRepository.add("radioactiveOre", "Minerali Radioattivi");
TextRepository.add("ironBar", "Barre di Ferro");
TextRepository.add("fusionWaste", "Scorie di Fusione");
TextRepository.add("radioactiveWaste", "Scorie Radioattive");
TextRepository.add("toxicWaste", "Scorie Tossiche");

TextRepository.add("roboticStorage", "Rimesse");
TextRepository.add("genericStorage", "Magazzini");
TextRepository.add("radioactiveStorage", "Aree di Stoccaggio");


// --- Edifici
TextRepository.add("Pipes", "Tubature");

TextRepository.add("LandingModule", "Modulo d'Atterraggio");
TextRepository.add("SupportModule", "Modulo di Supporto");
TextRepository.add("MicrowavePlant", "Impianto a Microonde");
TextRepository.add("MicrowaveSatellite", "Satellite a Microonde");

TextRepository.add("ElectrostaticCoil", "Bobina Elettrostatica");
TextRepository.add("Geothermal", "Centrale Geotermica");
TextRepository.add("StorageArea", "Area di stoccaggio");
TextRepository.add("Tokamak", "Reattore Tokamak");
TextRepository.add("TokamakAdv", "Reattore Tokamak Avanzato");
TextRepository.add("Capacitor", "Condensatore");
TextRepository.add("CommandCenter", "Centro di Comando");
TextRepository.add("MaintenanceCenter", "Centro di Manutenzione");
TextRepository.add("RoboRemittance", "Rimessa Robotica");
TextRepository.add("RoboRemittanceAdv", "Rimessa Robotica Avanzata");
TextRepository.add("RoboCommander", "Comando Robotico");
TextRepository.add("RoboCommanderAdv", "Comando Robotico Avanzato");
TextRepository.add("EnvironmentalControl", "Controllo Ambientale");
TextRepository.add("EnvironmentalControlAdv", "Controllo Ambientale Avanzato");
TextRepository.add("Agridome", "Cupola Agricola");
TextRepository.add("AgridomeAdv", "Cupola Agricola Avanzata");
TextRepository.add("AgridomeIntensive", "Cupola Agricola Intensiva");
TextRepository.add("VerticalFarm", "Fattoria Verticale");
TextRepository.add("VerticalFarmAdv", "Fattoria Verticale Avanzata");
TextRepository.add("Residential", "Struttura Residenziale");
TextRepository.add("ResidentialAdv", "Struttura Residenziale Avanzata");
TextRepository.add("Nursery", "Asilo");
TextRepository.add("MedicalStructure", "Struttura Medica");
TextRepository.add("MedicalStructureAdv", "Struttura Medica Avanzata");
TextRepository.add("School", "Scuola");
TextRepository.add("Univesity", "Università");
TextRepository.add("UnivesityAdv", "Università Avanzata");
TextRepository.add("RecreationalFacility", "Struttura Ricreativa");
TextRepository.add("RecreationalFacilityAdv", "Struttura Ricreativa Avanzata");
TextRepository.add("Warehouse", "Magazzino");
TextRepository.add("Smelter", "Fonderia");
TextRepository.add("SmelterAdv", "Fonderia Avanzata");
TextRepository.add("GoodsFactory", "Fabbrica di Beni");
TextRepository.add("IndustrialFactory", "Fabbrica Industriale");
TextRepository.add("ChemicalFactory", "Fabbrica Chimica");
TextRepository.add("PharmaceuticalIndustry", "Industria Farmaceutica");
TextRepository.add("HotLab", "Laboratorio di Superfice");
TextRepository.add("HotLabAdv", "Laboratorio di Superfice Avanzato");
TextRepository.add("Lab", "Laboratorio");
TextRepository.add("LabAdv", "Laboratorio Avanzato");
TextRepository.add("DeepLab", "Laboratorio di Profondità");

TextRepository.add("MineMetal", "Miniera di Metalli");
TextRepository.add("MineCristal", "Miniera di Cristalli");
TextRepository.add("MineRadioactive", "Miniera di materiali Radioattivi");

TextRepository.add("Park", "Parco");

// --- Ricerche e Ricette
TextRepository.add("ElectrostaticEnergy", "Elettricità Statica");
TextRepository.add("ElectrostaticEnergy" + "Description", "Lo studio dell'elettricità statica potrebbe permettre la creazione di strutture in grado di raccogliere la carica presente nell'atmosfera del pianeta.");

TextRepository.add("GeothermalEnergy", "Energia Geotermica");
TextRepository.add("GeothermalEnergy" + "Description", "Energia Geotermica ...");

TextRepository.add("Mineralogy", "Mineralogia");
TextRepository.add("Mineralogy" + "Description", "Consente l'estrazione dei minrali.");

TextRepository.add("Metallurgy", "Metallurgia");
TextRepository.add("Metallurgy" + "Description", "Consente l'estrazione dei metalli.");

TextRepository.add("NuclearChemistry", "Chimica Nucleare");
TextRepository.add("NuclearChemistry" + "Description", "Chimica Nucleare ...");

TextRepository.add("NuclearPhysics", "Fisica Nucleare");
TextRepository.add("NuclearPhysics" + "Description", "Fisica Nucleare ...");

TextRepository.add("ParticlePhysics", "Fisica delle particelle");
TextRepository.add("ParticlePhysics" + "Description", "Fisica delle particelle ...");

TextRepository.add("Hydroponics", "Hidroponica");
TextRepository.add("Hydroponics" + "Description", "Hidroponica ...");

TextRepository.add("Aquaponics", "Acquaponica");
TextRepository.add("Aquaponics" + "Description", "Acquaponica ...");

TextRepository.add("Medicine", "Medicina");
TextRepository.add("Medicine" + "Description", "Medicina ...");

TextRepository.add("AdvancedMedicine", "Medicina Avanzata");
TextRepository.add("AdvancedMedicine" + "Description", "Medicina Avanzata ...");

TextRepository.add("Pharmacology", "Farmacologia");
TextRepository.add("Pharmacology" + "Description", "Farmacologia ...");

TextRepository.add("Embryology", "Embriologia");
TextRepository.add("Embryology" + "Description", "Embriologia ...");

TextRepository.add("Robo-Worker", "Lavoratore Robotico");
TextRepository.add("Robo-Worker" + "Description", "Unità lavorativa di base utilizata in tute le strutture della colonia.");

TextRepository.add("Robo-Digger", "Scavatrice Robotica");
TextRepository.add("Robo-Digger" + "Description", "Scavatrice Robotica ...");

TextRepository.add("Robo-Dozer", "Ruspa Robotica");
TextRepository.add("Robo-Dozer" + "Description", "Ruspa Robotica ...");
