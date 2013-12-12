	// generatore di eventi
	function EventEngine()
	{
		var _simulation = function(colonyState, graphs)
		{
		};

		var _computation = function(colonyState, graphs, map)
		{
//TODO:8
			//var neglectPercentage = colonyState.getSimulationData().neglectPercentage;
			//var date = colonyState.getDate();
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

	var EventType = {

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
		var historicalEvents = [];
		var minorEvents = [];

		/** @param {Event} event */
		var _addHistoricalEvent = function(event)
		{
			historicalEvents.push(event);
		};

		/** @param {Event} event */
		var _addEvent = function(event)
		{
			minorEvents.push(event);
		};

		this.addHistoricalEvent = _addHistoricalEvent;
		this.addEvent = _addEvent;
	}

	var EventManager = new EventManagerConstructor();