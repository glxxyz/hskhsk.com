/*
    Shanka HSK Flashcards - hanzicanvas.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

    Original license below- heavily modified by Alan Davies 2014

*/

/*
TouchPaint

Copyright (c) 2011, Greg Murray
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by Greg Murray.
4. Neither the name of Greg Murray nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY Greg Murray ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL Greg Murray BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var canvascache = [];

HanziCanvas = function(uuid) {

   var _this = this;
   var _enabled = true;
   _this.parent = null;
   _this.activeChild = null;
   _this.draw = true;
      
   var hotmin = 1;
   var hotmax = 279;
   var points = [];
   var maxundolength = 10;
   _this.undohistory = [];
   _this.redohistory = [];
   var lastcontrolx = null;
   var lastcontroly = null;
   var lastbrushwidth = 0;
   
   this.buffer = null;
   
   this.penblack = function() {
        // this.canvas.style.cursor = "crosshair";
        this.draw = true;
    }

    this.penwhite = function() {
        // this.canvas.style.cursor = "hand";
        this.draw = false;
    }

    this.addUndoHistoryItem = function() {
        if (this.undohistory.length == maxundolength) {
            this.recyclecanvas(this.undohistory[0]);
            this.undohistory.splice(0, 1);
        }
        var newcanvas = this.getnewcanvas();          
        newcanvas.ctx.drawImage(this.canvas, 0, 0);
        this.undohistory.push(newcanvas);        
        this.clearredohistory();
        shanka.canvasupdateundoredo();
    }
    
    this.undo = function() {
        if (this.undohistory.length) {
            var newcanvas = this.getnewcanvas();          
            newcanvas.ctx.drawImage(this.canvas, 0, 0);
            this.redohistory.push(newcanvas);
            
            var undocanvas = this.undohistory.pop();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur=0;
            this.ctx.drawImage(undocanvas, 0, 0);
            this.copyToChild();
            this.recyclecanvas(undocanvas);
        }
    }

    this.redo = function() {
        if (this.redohistory.length) {            
            var newcanvas = this.getnewcanvas();          
            newcanvas.ctx.drawImage(this.canvas, 0, 0);
            this.undohistory.push(newcanvas);
            
            var redocanvas = this.redohistory.pop();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur=0;
            this.ctx.drawImage(redocanvas, 0, 0);            
            this.copyToChild();
            this.recyclecanvas(redocanvas);
        }
    }

    this.canundo = function() {
        return (this.undohistory.length > 0);
    }

    this.canredo = function() {
        return (this.redohistory.length > 0);
    }
    
    this.getnewcanvas = function() {
        var newcanvas = null;
        if (canvascache.length) {
            newcanvas = canvascache.pop();
        } else {
            newcanvas = document.createElement('canvas');
            if (this.parent) {
                newcanvas.width = this.parent.canvas.width;
                newcanvas.height = this.parent.canvas.height;          
            } else {
                newcanvas.width = this.canvas.width;
                newcanvas.height = this.canvas.height;          
            }
            newcanvas.ctx = newcanvas.getContext("2d");
        }
        return newcanvas;
    }

    this.recyclecanvas = function(canvas) {
        canvas.parent = null;
        canvascache.push(canvas);
    }
    
    this.clearundohistory = function() {
        for (var i=0, len=this.undohistory.length; i<len; i++) {
            this.recyclecanvas(this.undohistory[i]);
        }
        this.undohistory = [];
    }

    this.clearredohistory = function() {
        for (var i=0, len=this.redohistory.length; i<len; i++) {
            this.recyclecanvas(this.redohistory[i]);
        }
        this.redohistory = [];
    }

  this.reset = function() {
      this.clear();
  };
  
    this.deselectActiveChild = function() {
        if (this.activeChild != null) {
            // deselect
            this.activeChild.canvas.classList.remove("touchpaintminisel");
            this.activeChild.canvas.classList.add("touchpaintmini");
        }    
    }
  
    this.selectActiveChild = function() {
        if (this.activeChild != null) {
            // select
            this.activeChild.canvas.classList.remove("touchpaintmini");
            this.activeChild.canvas.classList.add("touchpaintminisel");
        }    
    }
  
    this.copyToChild = function() {
        if (this.activeChild != null) {
            this.activeChild.copyFromParent();
        }
    }

    this.copyFromChild = function() {
        if (this.activeChild != null) {
            this.ctx.drawImage(this.activeChild.buffer, 0, 0);
        }
    }
    
    this.copyFromParent = function() {
        if (this.parent ) {
            this.ctx.drawImage(this.parent.canvas, 0, 0, 280, 280, 0, 0, 55, 55);
            this.overdrawBorder();
            if (!this.buffer) {
                // keep a full resolution copy of the image around
                this.buffer = this.getnewcanvas();
            }
            this.buffer.ctx.drawImage(this.parent.canvas, 0, 0, 280, 280, 0, 0, 280, 280);
        }
    }

    this.copychildtochild = function(from, to) {
        to.canvas.ctx.drawImage(from.canvas, 0, 0);
        if (to.buffer) {
            this.recyclecanvas(to.buffer);
        }
        to.buffer = from.buffer;
        from.buffer = null;
    }
    
    this.overdrawBorder = function() {
        var m = this.canvas.width;
        this.drawLine( { x: 0, y: 0 }, { x: 0, y: m }, this.parent.bordercolour, 1);
        this.drawLine( { x: 0, y: 0 }, { x: m, y: 0 }, this.parent.bordercolour, 1);
        this.drawLine( { x: m, y: m }, { x: 0, y: m }, this.parent.bordercolour, 1);
        this.drawLine( { x: m, y: m }, { x: m, y: 0 }, this.parent.bordercolour, 1);
    }
    

  this.clear = function() {
    if (this.parent) {
        this.copyFromParent();
    } else {
      this.addUndoHistoryItem();
      this.ctx.globalAlpha = 1;
      this.ctx.shadowBlur=0;
       
      /*this.ctx.beginPath();
      this.ctx.fillStyle = "#ffffff" ;
      this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
      this.ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );
      this.ctx.closePath();*/

      this.ctx.beginPath();
      this.ctx.fillStyle = this.backgcolour ;
      this.ctx.clearRect( hotmin, hotmin, hotmax - hotmin, hotmax - hotmin );
      this.ctx.fillRect( hotmin, hotmin, hotmax - hotmin, hotmax - hotmin );
      this.ctx.closePath();

      points = [];
            
      this.drawgrid();
        
       this.copyToChild();
    }
  };
  
    this.drawgrid = function() {
        var gcobefore = this.ctx.globalCompositeOperation;      
        //this.ctx.globalCompositeOperation = "darker";
        this.ctx.globalAlpha = 1;

        var guide = shanka.getsetting("guide");
        var hotmid = hotmin+(hotmax-hotmin)/2;
        var onethird = hotmin+(hotmax-hotmin)/3;
        var twothirds = hotmin+(hotmax-hotmin)*2/3;

        if (guide == "star" || guide == "cross" || guide == "bar") {
            this.drawLine( { x: hotmid, y: hotmin }, { x: hotmid, y: hotmax }, this.gridcolour, 2);
        }
      
        if (guide == "star" || guide == "cross") {
            this.drawLine( { x: hotmin, y: hotmid }, { x: hotmax, y: hotmid }, this.gridcolour, 2);
        }
        
        if (guide == "star") {
              this.drawLine( { x: hotmin, y: hotmin }, { x: hotmax, y: hotmax }, this.gridcolour, 2);
              this.drawLine( { x: hotmin, y: hotmax }, { x: hotmax, y: hotmin }, this.gridcolour, 2);
        }
        
        if (guide == "grid") {
            this.drawLine( { x: onethird, y: hotmin },  { x: onethird, y: hotmax }, this.gridcolour, 2);
            this.drawLine( { x: twothirds, y: hotmin }, { x: twothirds, y: hotmax }, this.gridcolour, 2);
            this.drawLine( { x: hotmin, y: onethird },  { x: hotmax, y: onethird }, this.gridcolour, 2);
            this.drawLine( { x: hotmin, y: twothirds }, { x: hotmax, y: twothirds }, this.gridcolour, 2);
        }
      
        // all have a border
        this.drawLine( { x: hotmin, y: hotmin }, { x: hotmin, y: hotmax }, this.bordercolour, 2);
        this.drawLine( { x: hotmin, y: hotmin }, { x: hotmax, y: hotmin }, this.bordercolour, 2);
        this.drawLine( { x: hotmax, y: hotmax }, { x: hotmin, y: hotmax }, this.bordercolour, 2);
        this.drawLine( { x: hotmax, y: hotmax }, { x: hotmax, y: hotmin }, this.bordercolour, 2);

        //this.ctx.globalCompositeOperation = gcobefore;
    }

  function startDrawing( e ) {
  
        if (_enabled) {
              var rect = _this.canvas.getBoundingClientRect();
              var _current;
              if ( e.targetTouches && e.targetTouches.item(0) !== null ) {
                      var te =  e.targetTouches.item(0);
                      _current = { x : te.pageX - rect.left, y : te.pageY - rect.top }; 
              } else {
                      _current =  { x : e.pageX - rect.left, y : e.pageY - rect.top };
              }
              
              // console.log("start drawing")
               _this.addUndoHistoryItem();               
               points = [_current];
              _this.brushLine();
              e.preventDefault();
        } else if (_this.parent) {
            var page = document.getElementById("pagecontentouter");     
            _this.scrollTop = page.scrollTop;
        }
  }

    this.setActive = function (activeChild)
    {
        this.deselectActiveChild();
    
        // clear
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur=0;        
        this.ctx.beginPath();
        this.ctx.fillStyle = this.backgcolour;
        this.ctx.clearRect( 0, 0, this.canvas.width, this.canvas.height );
        this.ctx.fillRect( 0, 0, this.canvas.width, this.canvas.height );
        this.ctx.closePath();
        
        // copy image
        this.activeChild = activeChild;
        this.copyFromChild();
        this.selectActiveChild();
        
        this.clearundohistory();
        this.clearredohistory();
        shanka.canvasupdateundoredo();        
    }
    
    this.setParent = function (newparent)
    {
        this.parent = newparent;
    }
    
    this.leftstack = [];
    this.rightstack = [];
    
    this.pushleftstack = function(target) {
        if (this.buffer) {
            this.leftstack.push(this.buffer);
        }
        this.buffer = null;
    }
    this.pushrightstack = function(target) {
        if (this.buffer) {
            this.rightstack.push(this.buffer);
        }
        this.buffer = null;
    }
    this.poprightstack = function(target) {
        if (this.rightstack.length) {
            if (this.buffer) {
                this.recycleCanvas(this.buffer);
            }
            this.buffer = this.rightstack.pop();
        } else {
            // nothing on the stack, just clear it, parent will be cleared
            target.copyFromParent();
        }
    }
    this.popleftstack = function(target) {
        if (this.leftstack.length) {
            if (this.buffer) {
                this.recycleCanvas(this.buffer);
            }
            this.buffer = this.leftstack.pop();
        } else {
            // nothing on the stack, just clear it, parent will be cleared
            target.copyFromParent();
        }
    }
  
    function stopDrawing( e ) {
        if (_enabled) {        
            if (points.length) {
                var remapcurx = points[points.length-1].x * _this.canvas.width  / _this.canvas.clientWidth + _this.canvas.clientLeft;
                var remapcury = points[points.length-1].y * _this.canvas.height / _this.canvas.clientHeight + _this.canvas.clientTop;
                if (points.length == 1) {
                    var remapprvx = remapcurx + (Math.random() - 0.5) * 20;
                    var remapprvy = remapcury + (Math.random() - 0.5) * 20;
                    _this.createsplodges(lastbrushwidth, remapprvx, remapprvy, remapcurx, remapcury, false);
                    remapprvx = remapcurx + (Math.random() - 0.5) * 20;
                    remapprvy = remapcury + (Math.random() - 0.5) * 20;
                    _this.createsplodges(lastbrushwidth, remapprvx, remapprvy, remapcurx, remapcury, false);
                } else {
                    var remapprvx = points[points.length-2].x * _this.canvas.width  / _this.canvas.clientWidth + _this.canvas.clientLeft;
                    var remapprvy = points[points.length-2].y * _this.canvas.height / _this.canvas.clientHeight + _this.canvas.clientTop;
                    _this.createsplodges(lastbrushwidth, remapprvx, remapprvy, remapcurx, remapcury, true);
                }
            } 

            points = [];
            e.preventDefault();
          
            _this.copyToChild();
        } else if (_this.parent) {
            // ensure that they didn't scroll
            var page = document.getElementById("pagecontentouter");     
            if (_this.scrollTop == page.scrollTop) {
                _this.parent.setActive(_this);
            }
        }
    }

  function move( e ) {
      if ( points.length ) {
          var te =  e.targetTouches.item(0);
          var rect = _this.canvas.getBoundingClientRect();
          var _current = { x : te.pageX - rect.left -1, y : te.pageY - rect.top }; 
          pushPoint(_current);
      }
      e.preventDefault();
  }

  function moveMouse( e ) {
      if ( points.length ) {
          var rect = _this.canvas.getBoundingClientRect();
          var _current = { x : e.pageX - rect.left, y : e.pageY - rect.top };
          pushPoint(_current);
      }
      e.preventDefault();
  }
  
    function pushPoint(current) {
        var pushpoint = true;
        
        if (points.length) {
            var last = points[points.length-1];
            var deltax = last.x - current.x;
            var deltay = last.y - current.y;
            dist = Math.sqrt(Math.pow(deltax, 2) + Math.pow(deltay, 2));
            if (dist<=3) {
                pushpoint = false;
            }
        }
        
        if (pushpoint) {        
            points.push(current);
            _this.brushLine();
        }
    }

    this.brushLine = function() {  
        
        // remap width and high to account for resized canvas
        var remapcurx = points[points.length-1].x * this.canvas.width  / this.canvas.clientWidth + this.canvas.clientLeft;
        var remapcury = points[points.length-1].y * this.canvas.height / this.canvas.clientHeight + this.canvas.clientTop;
        
        if (   remapcurx < hotmin
            || remapcury < hotmin
            || remapcurx > hotmax
            || remapcury > hotmax) {
            this.ctx.globalAlpha = 1; // 0.3;                 
        } else {
            this.ctx.globalAlpha = 1; // 0.9;                 
        }

        // this.ctx.shadowColor= this.brushcolour;
        // this.ctx.shadowBlur = brushwidth/6;        
        
        if (points.length == 1) {
            var strokeSize = this.brushwidth * 4 / 5;
            lastbrushwidth = strokeSize;
                       
            // a single point is a circle
            this.ctx.beginPath();
            this.ctx.arc(remapcurx, remapcury, strokeSize/2, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = this.brushcolour;
            this.ctx.fill();
        }
        else {
            var remapprvx = points[points.length-2].x * this.canvas.width  / this.canvas.clientWidth + this.canvas.clientLeft;
            var remapprvy = points[points.length-2].y * this.canvas.height / this.canvas.clientHeight + this.canvas.clientTop;

            var minwidth = this.brushwidth * 1 / 3;
            var maxwidth = this.brushwidth;
            var distofmaxwidth = 3;  // dist must be > 4, so no divide by zero problem
            var distofminwidth = 7;
            var dist = Math.sqrt(Math.pow(remapcurx - remapprvx, 2) + Math.pow(remapcury - remapprvy, 2));
            var strokeSize = minwidth + (maxwidth - minwidth) * (distofminwidth - distofmaxwidth) / (dist - distofmaxwidth);
            // ensure it is in a sensible range
            strokeSize = Math.max(Math.min(strokeSize, maxwidth), minwidth);
            // ensure it's not too big a jump from the last stroke size
            strokeSize = Math.max(Math.min(strokeSize, lastbrushwidth + this.brushwidth / 10), lastbrushwidth - this.brushwidth/10);
            
            this.ctx.strokeStyle = this.brushcolour;
            this.ctx.lineWidth = strokeSize;
            this.ctx.beginPath();
            this.ctx.moveTo(remapprvx, remapprvy );
            if (points.length == 2) {
                this.ctx.lineTo(remapcurx, remapcury);
                lastcontrolx = remapcurx - (remapcurx - remapprvx) * 0.5;
                lastcontroly = remapcury - (remapcury - remapprvy) * 0.5;
                this.ctx.stroke();
                this.ctx.closePath();    
                this.createsplodges(lastbrushwidth, remapcurx, remapcury, remapprvx, remapprvy, true);
            } else {
                var newctlx = remapprvx + (remapprvx - lastcontrolx) * 0.5;
                var newctly = remapprvy + (remapprvy - lastcontroly) * 0.5;
                this.ctx.quadraticCurveTo(newctlx, newctly, remapcurx, remapcury);
                lastcontrolx = newctlx;
                lastcontroly = newctly;
                this.ctx.stroke();
                this.ctx.closePath();    
            }

            // save for next time
            lastbrushwidth = strokeSize;
        }
        
        if (!this.draw) {
            // redraw the grid that has been erased, doesn't seem to work so leave it for now...
            // this.drawgrid();
        }
    }
        
    this.drawLine = function(start, end, colour, lineWidth) {
        this.ctx.globalAlpha = 1;         
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo( start.x, start.y );
        this.ctx.lineTo( end.x, end.y );
        this.ctx.stroke();
        this.ctx.closePath();        
    }
    
    this.createsplodges = function(lastbrushwidth, fromx, fromy, tox, toy, pointy) {
    
        var deltax = tox - fromx;
        var deltay = toy - fromy;
        var dist = Math.sqrt(Math.pow(deltax, 2) + Math.pow(deltay, 2));
        var unitx = deltax / dist;
        var unity = deltay / dist;
        
        var numsplodge = Math.floor(Math.random()*15+15);
        
        for (var i=0; i<numsplodge; i++) {        
            var strokeSize = (Math.random() + 0.3) * lastbrushwidth / 4;
            var paralleldist = (lastbrushwidth/2) * (Math.random() * 0.7 + 0.4);
            var tangentdist = (lastbrushwidth/2) * (Math.random() * 1.9 - 0.95);
            
            if (pointy) {
                paralleldist += ((lastbrushwidth/2) - Math.abs(tangentdist)) * 1.2;
            }
            
            var remapcurx = tox + unitx * paralleldist + unity * tangentdist;
            var remapcury = toy + unity * paralleldist - unitx * tangentdist;
            var remapprvx = remapcurx - unitx * lastbrushwidth / 2; 
            var remapprvy = remapcury - unity * lastbrushwidth / 2; 
  
            // this.ctx.globalAlpha = (Math.random() * 0.7 + 0.1);
            this.ctx.strokeStyle = this.brushcolour;
            this.ctx.lineWidth = strokeSize/2;
            this.ctx.beginPath();
            this.ctx.moveTo(remapprvx, remapprvy );
            this.ctx.lineTo(remapcurx, remapcury);
            this.ctx.stroke();
            this.ctx.closePath();    
/*            this.ctx.globalAlpha = (Math.random() * 0.7 + 0.1);
            this.ctx.beginPath();
            this.ctx.arc(remapcurx, remapcury, strokeSize/2, 0, 2 * Math.PI, false);
            this.ctx.fillStyle = this.brushcolour;
            this.ctx.fill();*/
        }
    }
  
  function gobbler( e ) {
      e.preventDefault();
  }

  this.getData = function() {
      // return this.history;
  };

  this.init = function(args) {
  	if (args && "enabled" in args && typeof args.enabled === "boolean" ) {
  	    _enabled = args.enabled;
  	}
	
    this.canvas = document.getElementById( uuid );
	if (args &&  "height" in args && typeof args.height === "number" ) {
	    this.height = args.height;
	} else {
	    this.height = this.canvas.clientHeight;
	}
	if (args && "width" in args && typeof args.width === "number" ) {
	    this.width = args.width;
	} else {
	    this.width = this.canvas.clientWidth;
	}
    
	this.canvas.style.background = this.backgcolour;
    this.ctx = this.canvas.getContext( "2d" );
	this.ctx.lineCap = "round";

    this.canvas.addEventListener( "touchstart", startDrawing, false );
    this.canvas.addEventListener( "mousedown", startDrawing, false );
    this.canvas.addEventListener( "touchend", stopDrawing, false );
    
    if ( _enabled ) {
        this.canvas.style.cursor = "crosshair";
        this.canvas.addEventListener( "touchmove", move, false );
        document.body.addEventListener( "gesturestart", gobbler, true );
        this.canvas.addEventListener( "mousemove", moveMouse, false );
        this.canvas.addEventListener( "click", stopDrawing, false );
        
        this.clear();
    }
  }
};
