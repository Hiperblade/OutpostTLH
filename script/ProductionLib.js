	function ProductionLib() {	}
	
	ProductionLib.list = {};
	
	ProductionLib.add = function(name, requirement, time, cost, result)
	{
		ProductionLib.list[name] = new BaseRecipe(name, requirement, time, cost, result);
	}

	ProductionLib.get = function(name)
	{
		return ProductionLib.list[name];
	}

	ProductionLib.create = function(name)
	{
		return ProductionLib.list[name].create();
	}
	
	ProductionLib.getAvailableRecipe = function(colonyState)
	{
		var ret = new Array();
		for(var name in ProductionLib.list)
		{
			var tmp = ProductionLib.list[name];
			if(colonyState.checkKnowledge(tmp.getRequirement()))
			{
				ret.push(tmp);
			}
		}
		return ret;
	}
	
	function BaseRecipe(name, requirement, time, cost, result)
	{
		var name = name;
		var requirement = requirement;
		var time = time;
		var cost = cost;
		var result = result;
		
		var _create = function()
		{
			return new Recipe(this);
		}
		
		//-----------------------------------------
		
		this.getName = function(){ return name; }
		this.getRequirement = function(){ return requirement; }
		this.getTime = function(){ return time; }
		this.getCost = function(){ return cost; }
		this.getResult = function(){ return result; }
		
		this.create = _create;
		
		//-----------------------------------------
	}
	
	function Recipe(baseRecipe)
	{
		var baseRecipe = baseRecipe;
		var name = baseRecipe.getName();
		var time = baseRecipe.getTime();
		var currentTime = 0;
		
		var _progress = function()
		{
			if(time > currentTime)
			{
				currentTime++;
			}
			return time - currentTime;
		}
		
		//-----------------------------------------
		
		this.getName = function(){ return name; }
		this.getBase = function(){ return baseRecipe; }
		this.getTime = function() { return time; }
		this.getRemainTime = function() { return (time - currentTime); }
		
		this.progress = _progress;
		
		//-----------------------------------------
	}