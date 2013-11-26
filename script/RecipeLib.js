	var RecipeType = {
		Production: "production",
		Research: "research"
	};
	
	function RecipeLibConstructor()
	{
		var list = {};
		
		var _add = function(recipeType, name, requirement, time, cost, result)
		{
			list[name] = new BaseRecipe(recipeType, name, requirement, time, cost, result);
		};

		var _get = function(name)
		{
			return list[name];
		};

		var _create = function(name)
		{
			return list[name].create();
		};
		
		var _getAvailableProduction = function(colonyState)
		{
			var ret = [];
			for(var name in list)
			{
				var tmp = list[name];
				if(tmp.getRecipeType() == RecipeType.Production)
				{
					if(colonyState.checkKnowledge(tmp.getRequirement()))
					{
						ret.push(tmp);
					}
				}
			}
			return ret;
		};

		var _getAvailableResearch = function(colonyState)
		{
			var ret = [];
			for(var name in list)
			{
				var tmp = list[name];
				if(tmp.getRecipeType() == RecipeType.Research)
				{
					if(!colonyState.isCompletedKnowledge(name))
					{
						if(colonyState.checkKnowledge(tmp.getRequirement()))
						{
							ret.push(tmp);
						}
					}
				}
			}
			return ret;
		};
		
		this.add = _add;
		this.get = _get;
		this.create = _create;
		this.getAvailableProduction = _getAvailableProduction;
		this.getAvailableResearch = _getAvailableResearch;
	}
	
	function BaseRecipe(recipeType, name, requirement, time, cost, result)
	{
		//var recipeType = recipeType;
		//var name = name;
		//var requirement = requirement;
		//var time = time;
		//var cost = cost;
		//var result = result;
		
		var _create = function()
		{
			return new Recipe(this);
		};
		
		//-----------------------------------------
		
		this.getRecipeType = function(){ return recipeType; };
		this.getName = function(){ return name; };
		this.getRequirement = function(){ return requirement; };
		this.getTime = function(){ return time; };
		this.getCost = function(){ return cost; };
		this.getResult = function(){ return result; };
		
		this.create = _create;
		
		//-----------------------------------------
	}
	
	function Recipe(baseRecipe)
	{
		//var baseRecipe = baseRecipe;
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
		};
		
		//-----------------------------------------
		
		this.getName = function(){ return name; };
		this.getBase = function(){ return baseRecipe; };
		this.getTime = function() { return time; };
		this.getRemainTime = function() { return (time - currentTime); };
		
		this.progress = _progress;
		
		//-----------------------------------------
	}
	
	// singleton
	var RecipeLib = new RecipeLibConstructor();