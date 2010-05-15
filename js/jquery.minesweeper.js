(function($){

 	$.fn.extend({ 
 		
		//pass the options variable to the function
 		minesweeper: function(options) {


			//Set the default values, use comma to separate the settings, example:
			var defaults = {
				size: 	[10,10],
				mines:	10,
				skin: 	"default"
			}
				
			var options =  $.extend(defaults, options);

    		return this.each(function() {
				var o = options,
					firstClick = true,
					self = $(this),
					minefield = null, 
					heading = null,
					footer = null,
					mines = null,
					minesLeft = o.mines;
				
				function init() {
					attachSkin();
					self.addClass("jQueryMinefield default");
					drawMinefield();
				}
				
				function drawMinefield() {
					if (minefield == null) {
						minefield = $("<div class='minefield'></div>");
						self.append(minefield);
					} else {
						minefield.empty();
						firstClick = true;
					}
					for (var x = 0; x < o.size[0]; x++) {
						for (var y = 0; y < o.size[1]; y++) {
							drawBlock(x, y);
						}
					}
					$("div", minefield)
						.bind("click", handleBlockClick)
						.bind("contextmenu", handleBlockRightClick);
				}
				
				function drawBlock(x, y) {
					var block = $("<div></div>");
					block
						.attr("id", "block_" + x + "-" + y)
						.data("minestate", "hidden");
						
					if (y == 0) block.addClass("first");
					minefield.append(block);
				}
				
				function populateGrid(exceptionBlock) {
					// First pass - setup mines
					mines = $("div", minefield).not(exceptionBlock)
						.sort(randOrd).sort(randOrd).sort(randOrd) // We are sorting randomly three times to get a good spread
						.filter(":lt("+o.mines+")");
					
					mines.each(function() {
						$(this)
							.data("mine", true);
					});
					mines.each(function() {
						var myCoords = getBlockCoords($(this));
						
						var touching = getTouchingBlocks($(this));
						jQuery.each(touching, function(){
							if ($(this).length) {
								incrementMineCount.call($(this));
							}
						});
					});
				}
				
				function clearBlock(block, callerBlock) {
					// Examine the blocks touching this block and clear as appropriate
					if (isEmpty.call(block)) {
						block.addClass("cleared").data("minestate", "cleared");
						var touching = getTouchingBlocks(block, ":not(.cleared)");
						jQuery.each(touching, function(){
							if ($(this).length) {
								if (blocksAreCousins(block, $(this)) && isEmpty.call($(this))) {
									// Do nothing with this block - it is an empty cousin
								} else {
									clearBlock($(this), block);
								}
							}
						});
					} else { 
						revealBlock(block);
						return false;
					}
				}
				
				function revealBlock(block) {
					if ((block.data("minecount") || 0) > 0) {
						// The block is touching at least one mine, only reveal the block itself
						block.addClass("revealed");
						block.html(block.data("minecount"));
					} else {
						clearBlock(block);
					}
					return block;
				}
				
				function handleBlockClick(event) {
					var block = $(event.target);
					
					if (firstClick) {
						populateGrid(block);
						firstClick = false;
					}
					
					//TODO: Check to see if the block was marked as a mine or question
					if (block.data("minestate") != "flagged" && block.data("minestate") != "question") {
						if (block.data("mine") == true) {
							// Hit a mine, end the game
							block.addClass("explosion");
							endGame();
						} else {
							revealBlock(block);
						}
					}
				}
				
				function handleBlockRightClick(event) {
					var block = $(event.target);
					
					switch(block.data("minestate")) {
						case "hidden":
							block.data("minestate","flagged").addClass("flagged");
							break;
						case "flagged":
							block.data("minestate","question").removeClass("flagged").addClass("question");
							break;
						case "question":
							block.data("minestate","hidden").removeClass("flagged");
							break;
					}
					return false;		
				}
				
				function endGame() {
					mines.addClass("mine");
					$("div", minefield)
						.unbind("click", handleBlockClick)
						.unbind("contextmenu", handleBlockRightClick);				
				}
				
				function getTouchingBlocks(block, filter, diagonalFlag) {
					if (diagonalFlag == null) diagonalFlag = true;
					
					var touching = [];
					
					var myCoords = getBlockCoords(block);
					if (myCoords[0] > 0) {
						// Not the top row, so get the above blocks
						touching.push(getBlockAt(myCoords[0]-1, myCoords[1], filter));
						if (diagonalFlag) {
							if (myCoords[1] > 0) 			/* Not the left */ 	touching.push(getBlockAt(myCoords[0]-1, myCoords[1]-1, filter));
							if (myCoords[1] < o.size[1]) 	/* Not the right */ touching.push(getBlockAt(myCoords[0]-1, myCoords[1]+1, filter));
						}	
					}
					if (myCoords[0] < o.size[0]) {
						// Not the bottom row, so get the below blocks
						touching.push(getBlockAt(myCoords[0]+1, myCoords[1], filter));
						if (diagonalFlag) {
							if (myCoords[1] > 0) 			/* Not the left */ 	touching.push(getBlockAt(myCoords[0]+1, myCoords[1]-1, filter));
							if (myCoords[1] < o.size[1]) 	/* Not the right */ touching.push(getBlockAt(myCoords[0]+1, myCoords[1]+1, filter));
						}
					}
					if (myCoords[1] > 0) {
						// Not the left, so go left
						touching.push(getBlockAt(myCoords[0], myCoords[1]-1, filter));
					}
					if (myCoords[1] < o.size[1]) {
						touching.push(getBlockAt(myCoords[0], myCoords[1]+1, filter));
					}
					return touching;
				}
				
				function getBlockCoords(block) {
					var c = $(block).attr("id").replace("block_","").split("-");
					c[0] = parseInt(c[0]);
					c[1] = parseInt(c[1]);	
					return c;
				}
				
				function getBlockAt(x,y,filter) {
					if (filter != null)	return $("#block_"+x+"-"+y).filter(filter);
					return $("#block_"+x+"-"+y);
				}
				
				function isEmpty() {
					if (($(this).data("minecount") || 0) == 0 || $(this).data("mine") == true) return true;
				}
				
				function blocksAreCousins(a, b) {
					var aCoords = getBlockCoords(a),
						bCoords = getBlockCoords(b);
						
					if (aCoords[0] != bCoords[0] && aCoords[1] != bCoords[1]) return true;
					return false;
				}
				
				function incrementMineCount() {
					if (this.data("mine") != true) {
						count = this.data("minecount") || 0;
						count++;
						this.data("minecount",count);
						// this.html(count);
					}
					return this;
				}
				
				function randOrd(){return (Math.round(Math.random())-0.5); }
				
				function attachSkin() {
			        $('head').append('<link rel="stylesheet" href="skins/'+o.skin+'/skin.css" type="text/css" />');
				}
				
				init();
    		});
    		
    	}
	});
	
})(jQuery);

