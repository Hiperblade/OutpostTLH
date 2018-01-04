"use strict";

	// generatore di eventi
	function EventEngine()
	{
		let _simulation = function(colonyState, graphs)
		{
		};

		let _computation = function(colonyState, graphs, map)
		{
//TODO:8
			//let neglectPercentage = colonyState.getSimulationData().neglectPercentage;
			//let date = colonyState.getDate();
			// incidenti, catastrofi (distruzione o danneggiamento edifici, morti o feriti)
			// scoperte (nuove risorse, rovine ecc.)
		};

		//-----------------------------------------

		this.simulation = _simulation;
		this.computation = _computation;

		//-----------------------------------------
	}

	function EventTrigger(requirements)
	{

	}

	let EventType = {

	};

	/**
	 * @param {EventType} eventType
	 * @param {number} date
	 */
	function Event(eventType, date)
	{

	}

	function EventManagerConstructor()
	{
		let historicalEvents = [];
		let minorEvents = [];

		/** @param {Event} event */
		let _addHistoricalEvent = function(event)
		{
			historicalEvents.push(event);
		};

		/** @param {Event} event */
		let _addEvent = function(event)
		{
			minorEvents.push(event);
		};

		this.addHistoricalEvent = _addHistoricalEvent;
		this.addEvent = _addEvent;
	}

	let EventManager = new EventManagerConstructor();