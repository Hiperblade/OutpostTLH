	function ResearchLib() {	}
	
	ResearchLib.list = {};
	
	ResearchLib.add = function(name, requirement, studyTime, studyCost, studyResult)
	{
		ResearchLib.list[name] = new BaseResearch(name, requirement, studyTime, studyCost, studyResult);
	}

	ResearchLib.get = function(name)
	{
		return ResearchLib.list[name];
	}

	ResearchLib.create = function(name)
	{
		return ResearchLib.list[name].create();
	}
	
	ResearchLib.getAvailableResearch = function(colonyState)
	{
		var ret = new Array();
		for(var name in ResearchLib.list)
		{
			var tmp = ResearchLib.list[name];
			if(!colonyState.isCompletedKnowledge(name))
			{
				if(colonyState.checkKnowledge(tmp.getRequirement()))
				{
					ret.push(tmp);
				}
			}
		}
		return ret;
	}
	
	function BaseResearch(name, requirement, studyTime, studyCost, studyResult)
	{
		var name = name;
		var requirement = requirement;
		var studyTime = studyTime;
		var studyCost = studyCost;
		var studyResult = studyResult;
		
		var _create = function()
		{
			return new Research(this);
		}
		
		//-----------------------------------------
		
		this.getName = function(){ return name; }
		this.getRequirement = function(){ return requirement; }
		this.getTime = function(){ return studyTime; }
		this.getCost = function(){ return studyCost; }
		this.getResult = function(){ return studyResult; }
		
		this.create = _create;
		
		//-----------------------------------------
	}
	
	function Research(baseResearch)
	{
		var baseResearch = baseResearch;
		var name = baseResearch.getName();
		var time = baseResearch.getTime();
		var currentTime = 0;
		
		var _study = function()
		{
			if(time > currentTime)
			{
				currentTime++;
			}
			return time - currentTime;
		}
		
		//-----------------------------------------
		
		this.getName = function(){ return name; }
		this.getBase = function(){ return baseResearch; }
		this.getTime = function() { return time; }
		this.getRemainTime = function() { return (time - currentTime); }
		
		this.study = _study;
		
		//-----------------------------------------
	}
	
	//{ knowledge: {} }