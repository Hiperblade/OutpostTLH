"use strict";

Function.prototype.inherits = function(superclass)
{
	let temp = function() { };
	temp.prototype = superclass.prototype;
	this.prototype = new temp();
};

/**
 * @param {number} w
 * @param {number} h
 */
function ImageSize(w, h)
{
	/** @type{number} */
	this.width = w;
	/** @type{number} */
	this.height = h;
}

/** @return{ImageSize} */
function GetImageSize(img)
{
	return new ImageSize(img.width, img.height);
}

function LogConstructor()
{
	let _error = function(msg)
	{
		alert(msg);
	};

	let _dialog = function(msg)
	{
		alert(msg);
	};

	this.error = _error;
	this.dialog = _dialog;
}

// singleton
let Log = new LogConstructor();

let Colors = {
	Standard: "rgb(119,207,60)",
	Dark: "rgb(47,106,8)",
	Error: "rgb(200,100,100)"
};

function CanvasGrid(ctx, position, fontSize, columnsList)
{
	let columns = columnsList || [];

	let _addColumn = function(width)
	{
		columns.push(width);
	};

	let _getStartColumn = function(col)
	{
		let ret = 0;
		for(let i = 0; i < col; i++)
		{
			ret += columns[i];
		}
		return ret + position.x;
	};

	/*
	let _getRowHeight = function()
	{
		return fontSize + 4;
	};
	*/

	let _getStartRow = function(row)
	{
		return ((fontSize + 4) * row) + position.y;
	};

	let _internalSetText = function(row, col, text, textAlign, newColor)
	{
		let oldColor = ctx.fillStyle;
		ctx.fillStyle = newColor || oldColor;
		ctx.font = fontSize + "px Arial";
		ctx.textAlign = textAlign;
		ctx.fillText(text, _getStartColumn(col), _getStartRow(row) + fontSize);
		ctx.fillStyle = oldColor;
	};

	let _setText = function(row, col, text, color)
	{
		_internalSetText(row, col, text, "left", color);
	};

	let _setValue = function(row, col, value, color)
	{
		_internalSetText(row, col + 1, value, "right", color);
	};

	//-----------------------------------------

	this.addColumn = _addColumn;
	this.setText = _setText;
	this.setValue = _setValue;
	this.getStartColumn = _getStartColumn;
	this.getStartRow = _getStartRow;

	//-----------------------------------------
}