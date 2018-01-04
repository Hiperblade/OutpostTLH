"use strict";

function TextRepositoryConstructor()
{
	let data = {};
	let defaultLanguage = "it";

	let _get = function(id, language)
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

	let _add = function(id, text, language)
	{
		language = language || defaultLanguage;

		if(data[language] == undefined)
		{
			data[language] = {};
		}
		data[language][id] = text;
	};

	let _addDescription = function(id, text, textDescription, language)
	{
		_add(id, text, language);
		_add(id + "Description", textDescription, language);
	};

	this.get = _get;
	this.add = _add;
	this.addDescription = _addDescription;
}

// singleton
let TextRepository = new TextRepositoryConstructor();