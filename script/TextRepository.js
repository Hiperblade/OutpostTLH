function TextRepositoryConstructor()
{
	var data = {};
	var defaultLanguage = "it";

	var _get = function(id, language)
	{
		language = language || defaultLanguage;

		if(data[language] == undefined)
		{
			data[language] = {};
		}
		
		if(data[language][id] == undefined)
		{
			return "[" + id + "]";
		}
		return data[language][id];
	};
		
	var _add = function(id, text, language)
	{
		language = language || defaultLanguage;
		
		if(data[language] == undefined)
		{
			data[language] = {};
		}
		data[language][id] = text;
	};
	
	this.get = _get;
	this.add = _add;
}

// singleton
var TextRepository = new TextRepositoryConstructor();