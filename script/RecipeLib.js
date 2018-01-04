"use strict";

	let RecipeType = {
		Production: "production",
		Research: "research"
	};

	function RecipeLibConstructor()
	{
		let list = {};

		/**
		 *  @param {RecipeType} recipeType
		 *  @param {string} name
		 *  @param {object} requirement
		 *  @param {number} time
		 *  @param {object} cost
		 *  @param {object} result
		 */
		let _add = function(recipeType, name, requirement, time, cost, result)
		{
			list[name] = new BaseRecipe(recipeType, name, requirement, time, cost, result);
		};

		/**
		 *  @param {string} name
		 */
		let _get = function(name)
		{
			return list[name];
		};

		/**
		 *  @param {string} name
		 */
		let _create = function(name)
		{
			return list[name].create();
		};

		/**
		 *  @param {ColonyState} colonyState
		 */
		let _getAvailableProduction = function(colonyState)
		{
			let ret = [];
			for(let name in list)
			{
				if(list.hasOwnProperty(name))
				{
					let tmp = list[name];
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
		let _getAvailableResearch = function(colonyState)
		{
			let ret = [];
			for(let name in list)
			{
				if(list.hasOwnProperty(name))
				{
					let tmp = list[name];
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
		let _create = function()
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
		let name = baseRecipe.getName();
		let time = baseRecipe.getTime();
		let currentTime = 0;

		let _progress = function()
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
	let RecipeLib = new RecipeLibConstructor();