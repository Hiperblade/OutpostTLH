	Function.prototype.inherits = function(superclass)
	{
		var temp = function() { };
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
		var _error = function(msg)
		{
			alert(msg);
		};

		var _dialog = function(msg)
		{
			alert(msg);
		};

		this.error = _error;
		this.dialog = _dialog;
	}

	// singleton
	var Log = new LogConstructor();

	var Colors = {
		Standard: "rgb(119,207,60)",
		Dark: "rgb(47,106,8)",
		Error: "rgb(200,100,100)"
	};

	function CanvasGrid(ctx, position, fontSize, columnsList)
	{
		var columns = columnsList || [];

		var _addColumn = function(width)
		{
			columns.push(width);
		};

		var _getStartColumn = function(col)
		{
			var ret = 0;
			for(var i = 0; i < col; i++)
			{
				ret += columns[i];
			}
			return ret + position.x;
		};

		/*
		var _getRowHeight = function()
		{
			return fontSize + 4;
		};
		*/

		var _getStartRow = function(row)
		{
			return ((fontSize + 4) * row) + position.y;
		};

		var _internalSetText = function(row, col, text, textAlign, newColor)
		{
			var oldColor = ctx.fillStyle;
			ctx.fillStyle = newColor || oldColor;
			ctx.font = fontSize + "px Arial";
			ctx.textAlign = textAlign;
			ctx.fillText(text, _getStartColumn(col), _getStartRow(row) + fontSize);
			ctx.fillStyle = oldColor;
		};

		var _setText = function(row, col, text, color)
		{
			_internalSetText(row, col, text, "left", color);
		};

		var _setValue = function(row, col, value, color)
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