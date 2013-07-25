	Function.prototype.inherits = function(superclass)
	{
		var temp = function() { };
		temp.prototype = superclass.prototype;
		this.prototype = new temp();
	}
	
	function Log()
	{
	}
	
	Log.error = function(msg)
	{
		alert(msg);
	}
		
	Log.dialog = function(msg)
	{
		alert(msg);
	}
	
	var Colors =
		{
			Standard: "rgb(119,207,60)",
			Dark: "rgb(47,106,8)",
			Error: "rgb(200,100,100)"
		}
	
	function CanvasGrid(ctx, position, color, fontSize, columnsList)
	{
		var columns = new Array();
		if(columnsList != undefined)
		{
			columns = columnsList;
		}
		
		var _addColumn = function(width)
		{
			columns.push(width);
		}
		
		var _getStartColumn = function(col)
		{
			var ret = 0;
			for(var i = 0; i < col; i++)
			{
				ret += columns[i];
			}
			return ret + position.x;
		}
		
		var _getRowHeight = function()
		{
			return fontSize + 4;
		}
		
		var _getStartRow = function(row)
		{
			return ((fontSize + 4) * row) + position.y;
		}

		var _internalSetText = function(row, col, text, textAlign, newColor)
		{
			var oldColor = ctx.fillStyle;
			ctx.fillStyle = newColor || oldColor;
			ctx.font = fontSize + "px Arial";
			ctx.textAlign = textAlign;
			ctx.fillText(text, _getStartColumn(col), _getStartRow(row) + fontSize);
			ctx.fillStyle = oldColor;
		}
		
		var _setText = function(row, col, text, color)
		{
			_internalSetText(row, col, text, "left", color);
		}
		
		var _setValue = function(row, col, value, color)
		{
			_internalSetText(row, col + 1, value, "right", color);
		}
		
		//-----------------------------------------
		
		this.addColumn = _addColumn;
		this.setText = _setText;
		this.setValue = _setValue;
		this.getStartColumn = _getStartColumn;
		this.getStartRow = _getStartRow;
		
		//-----------------------------------------
	}
	
// ----------------------------


// Library: mltext.js
// Desciption: Extends the CanvasRenderingContext2D that adds two functions: mlFillText and mlStrokeText.
//
// The prototypes are: 
//
// function mlFillText(text,x,y,w,h,vAlign,hAlign,lineheight);
// function mlStrokeText(text,x,y,w,h,vAlign,hAlign,lineheight);
// 
// Where vAlign can be: "top", "center" or "button"
// And hAlign can be: "left", "center", "right" or "justify"
// Author: Jordi Baylina. (baylina at uniclau.com)
// License: GPL
// Date: 2013-02-21

function mlFunction(text, x, y, w, h, hAlign, vAlign, lineheight, fn) {
    text = text.replace(/[\n]/g, " \n ");
    text = text.replace(/\r/g, "");
    var words = text.split(/[ ]+/);
    var sp = this.measureText(' ').width;
    var lines = [];
    var actualline = 0;
    var actualsize = 0;
    var wo;
    lines[actualline] = {};
    lines[actualline].Words = [];
    i = 0;
    while (i < words.length) {
        var word = words[i];
        if (word == "\n") {
            lines[actualline].EndParagraph = true;
            actualline++;
            actualsize = 0;
            lines[actualline] = {};
            lines[actualline].Words = [];
            i++;
        } else {
            wo = {};
            wo.l = this.measureText(word).width;
            if (actualsize === 0) {
                while (wo.l > w) {
                    word = word.slice(0, word.length - 1);
                    wo.l = this.measureText(word).width;
                }
                if (word === "") return; // I can't fill a single character
                wo.word = word;
                lines[actualline].Words.push(wo);
                actualsize = wo.l;
                if (word != words[i]) {
                    Words[i] = Words[i].splice(word.length, Words[i].length - 1);
                } else {
                    i++;
                }
            } else {
                if (actualsize + sp + wo.l > w) {
                    lines[actualline].EndParagraph = false;
                    actualline++;
                    actualsize = 0;
                    lines[actualline] = {};
                    lines[actualline].Words = [];
                } else {
                    wo.word = word;
                    lines[actualline].Words.push(wo);
                    actualsize += sp + wo.l;
                    i++;
                }
            }
        }
    }
    if (actualsize === 0) lines[actualline].pop();
    lines[actualline].EndParagraph = true;

    var totalH = lineheight * lines.length;
    while (totalH > h) {
        lines.pop();
        totalH = lineheight * lines.length;
    }

    var yy;
    if (vAlign == "bottom") {
        yy = y + h - totalH + lineheight;
    } else if (vAlign == "center") {
        yy = y + h / 2 - totalH / 2 + lineheight;
    } else {
        yy = y + lineheight;
    }

    var oldTextAlign = this.textAlign;
    this.textAlign = "left";

    for (var li in lines) {
        var totallen = 0;
        var xx, usp;
        for (wo in lines[li].Words) totallen += lines[li].Words[wo].l;
        if (hAlign == "center") {
            usp = sp;
            xx = x + w / 2 - (totallen + sp * (lines[li].Words.length - 1)) / 2;
        } else if ((hAlign == "justify") && (!lines[li].EndParagraph)) {
            xx = x;
            usp = (w - totallen) / (lines[li].Words.length - 1);
        } else if (hAlign == "right") {
            xx = x + w - (totallen + sp * (lines[li].Words.length - 1));
            usp = sp;
        } else { // left
            xx = x;
            usp = sp;
        }
        for (wo in lines[li].Words) {
            if (fn == "fillText") {
                this.fillText(lines[li].Words[wo].word, xx, yy);
            } else if (fn == "strokeText") {
                this.strokeText(lines[li].Words[wo].word, xx, yy);
            }
            xx += lines[li].Words[wo].l + usp;
        }
        yy += lineheight;
    }
    this.textAlign = oldTextAlign;
}

(function mlInit() {
    CanvasRenderingContext2D.prototype.mlFunction = mlFunction;

    CanvasRenderingContext2D.prototype.mlFillText = function (text, x, y, w, h, vAlign, hAlign, lineheight) {
        this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineheight, "fillText");
    };

    CanvasRenderingContext2D.prototype.mlStrokeText = function (text, x, y, w, h, vAlign, hAlign, lineheight) {
        this.mlFunction(text, x, y, w, h, hAlign, vAlign, lineheight, "strokeText");
    };
})();
