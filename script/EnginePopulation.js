"use strict";

// calcolo popolazione (nascite, morti e stato)
function PopulationEngine()
{
	let _simulation = function(colonyState, graphs)
	{
	};

	let _computation = function(colonyState, graphs, map)
	{
		let date = colonyState.getDate();

		// totale popolazione
		let people = 0;
		let population = colonyState.getPopulation();
		let generations = population.registry;
		for(let g  = 0; g < generations.length; g++)
		{
			if(generations[g].getState(date) != GenerationState.Deads)
			{
				people += generations[g].getPopulation();
			}
		}

		// totale tubi
		let countPipes = 0;
		for(let graph = 0; graph < graphs.length; graph++)
		{
			if(BuildingGraph.hasHeadquarter(graphs[graph]))
			{
				countPipes += BuildingGraph.countPipes(graphs[graph]);
			}
		}

		let inhospitality = 1;
		let malnutrition = 1;
		let overcrowding = 1;
		let missingHealthCover = 1;
		let missingEducation = 1;
		let missingHighEducation = 1;
		let sadness = 1;

		// ambiente (aria - acqua - temperatura) (inhospitality)
		if(countPipes > 0)
		{
			let habitatUnit = colonyState.getRemainder("habitatUnit");
			colonyState.delMaterials( { habitatUnit: Math.min(habitatUnit, countPipes) } );
			inhospitality = 1 - (habitatUnit / countPipes);
			if(inhospitality < 0)
			{
				inhospitality = 0;
			}
		}

		// se ci sono persone
		if(people > 0)
		{
			// cibo (malnutrizione)
			let foodUnit = colonyState.getRemainder("foodUnit");
			colonyState.delMaterials( { foodUnit: Math.min(foodUnit, people) } );
			malnutrition = 1 - (foodUnit / people);
			if(malnutrition < 0)
			{
				malnutrition = 0;
			}

			// alloggi (sovraffollamento)
			let residentialUnit = colonyState.getRemainder("residentialUnit");
			colonyState.delMaterials( { foodUnit: Math.min(residentialUnit, people) } );
			overcrowding = 1 - (residentialUnit / people);
			if(overcrowding < 0)
			{
				overcrowding = 0;
			}

			// medicinali (copertura sanitaria mancante)
			let medicalUnit = colonyState.getRemainder("medicalUnit");
			colonyState.delMaterials( { medicalUnit: Math.min(medicalUnit, people) } );
			missingHealthCover = 1 - (medicalUnit / people);
			if(missingHealthCover < 0)
			{
				missingHealthCover = 0;
			}

			// istruzione (mancanza di istruzione)
			let educationUnit = colonyState.getRemainder("educationUnit");
			let students = 0;
			let highEducationUnit = colonyState.getRemainder("highEducationUnit");
			let researchers = 0;
			for(let i = 0; i < generations.length; i++)
			{
				let lots = generations[i].getLots();
				let minEducationLevel = lots[lots.length - 1].getEducationLevel();
				let ii;
				for(ii = 0; ii < lots.length; ii++)
				{
					if(lots[ii].getEducationLevel() == minEducationLevel)
					{
						break;
					}
				}
				for(let index = ii; index < ii + lots.length; index++)
				{
					if(generations[i].getState(date) == GenerationState.Students)
					{
						// Students
						students += lots[index % lots.length].getPopulation();
						// avanzamento istruzione
						if(students <= educationUnit)
						{
							lots[index % lots.length].teach();
						}
					}
					else if(generations[i].getState(date) == GenerationState.Researchers)
					{
						// Researchers
						researchers += lots[index % lots.length].getPopulation();
						// avanzamento istruzione
						if(researchers <= highEducationUnit)
						{
							lots[index % lots.length].teach();
						}
					}
				}
			}

			// Students
			colonyState.delMaterials( { educationUnit: Math.min(educationUnit, students) } );
			if(students > 0)
			{
				missingEducation = 1 - (educationUnit / students);
				if(missingEducation < 0)
				{
					missingEducation = 0;
				}
			}
			else
			{
				missingEducation = 0;
			}

			// Researchers
			colonyState.delMaterials( { highEducationUnit: Math.min(highEducationUnit, researchers) } );
			if(researchers > 0)
			{
				missingHighEducation = 1 - (highEducationUnit / researchers);
				if(missingHighEducation < 0)
				{
					missingHighEducation = 0;
				}
			}
			else
			{
				missingHighEducation = 0;
			}

			// felicità (tristezza)
			let recreationalUnit = colonyState.getRemainder("recreationalUnit");
			colonyState.delMaterials( { recreationalUnit: Math.min(recreationalUnit, people) } );
			sadness = 1 - (recreationalUnit / people);
			if(sadness < 0)
			{
				sadness = 0;
			}
		}
		else // non ci sono persone
		{
			if(colonyState.getRemainder("foodUnit") > 0)
			{
				malnutrition = 0;
			}

			if(colonyState.getRemainder("residentialUnit") > 0)
			{
				overcrowding = 0;
			}

			if(colonyState.getRemainder("medicalUnit") > 0)
			{
				missingHealthCover = 0;
			}
		}

		//subsistence
		//  inhospitality // inospitabilità dell'ambiente
		//	malnutrition // malnutrizione
		let subsistence = 1 - Math.max(inhospitality, malnutrition);

		//wellness
		//	overcrowding // sovraffollamento
		//	missingHealthCover // copertura sanitaria mancante		
		let wellness = 1 - Math.max(overcrowding, missingHealthCover);

		//happiness
		//	missingEducation // mancanza di istruzione
		//	missingHighEducation // mancanza di alta formazione
		//	sadness // tristezza
		let happiness = 1 - Math.max(missingEducation, missingHighEducation, sadness);

		let subsistenceAverage = (population.subsistence + subsistence) / 2;
		let wellnessAverage = (population.wellness + wellness) / 2;
		if(subsistenceAverage == 1 && wellnessAverage == 1)
		{
			// nascite (se le condizioni sono favorevoli)
			let nurseryUnit = colonyState.getRemainder("nurseryUnit");
			if(nurseryUnit > 0)
			{
				generations.push(new Generation(date, nurseryUnit));
			}
		}
		else if(subsistenceAverage < 1)
		{
			// morti
			let dead = Math.floor(people * (1 - subsistenceAverage));
			for(let d = 0; d < dead; d++)
			{
				generations[d % generations.length].kill();
			}
		}

		population.subsistence = subsistence;
		population.wellness = wellness;
		population.happiness = happiness;
	};

	//-----------------------------------------

	this.simulation = _simulation;
	this.computation = _computation;

	//-----------------------------------------
}