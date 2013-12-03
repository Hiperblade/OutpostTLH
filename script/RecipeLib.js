	var RecipeType = {
		Production: "production",
		Research: "research"
	};
	
	function RecipeLibConstructor()
	{
		var list = {};

        /**
         *  @param {RecipeType} recipeType
         *  @param {string} name
         *  @param {object} requirement
         *  @param {number} time
         *  @param {object} cost
         *  @param {object} result
         */
		var _add = function(recipeType, name, requirement, time, cost, result)
		{
			list[name] = new BaseRecipe(recipeType, name, requirement, time, cost, result);
		};

        /**
         *  @param {string} name
         */
		var _get = function(name)
		{
			return list[name];
		};

        /**
         *  @param {string} name
         */
		var _create = function(name)
		{
			return list[name].create();
		};

        /**
         *  @param {ColonyState} colonyState
         */
		var _getAvailableProduction = function(colonyState)
		{
			var ret = [];
			for(var name in list)
			{
                if(list.hasOwnProperty(name))
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
			}
			return ret;
		};

        /**
         *  @param {ColonyState} colonyState
         */
		var _getAvailableResearch = function(colonyState)
		{
			var ret = [];
			for(var name in list)
			{
                if(list.hasOwnProperty(name))
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