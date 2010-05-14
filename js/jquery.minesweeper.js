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
					footer = null
					minesLeft = o.mines;
				
				function init() {
					attachSkin();
					self.addClass("jQueryMinefield default");
					drawMinefield();
					$("div", minefield).bind("click", handleBlockClick);
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
				}
				
				function drawBlock(x, y) {
					var block = $("<div></div>");
					block
						.html(x+", "+y)
						.attr("id", "block_" + x + "-" + y);
					if (y == 0) block.addClass("first");
					minefield.append(block);
				}
				
				function populateGrid(exceptionBlock) {
					// First pass - setup mines
					var aMines = $("div", minefield).not(exceptionBlock)
						.sort(randOrd).sort(randOrd).sort(randOrd) // We are sorting randomly three times to get a good spread
						.filter(":lt("+o.mines+")");
					
					aMines.each(function() {
						$(this)
							.data("mine", true)
							.addClass("mine");
					});
					aMines.each(function() {
						var myCoords = $(this).attr("id").replace("block_","").split("-");
						myCoords[0] = parseInt(myCoords[0]);
						myCoords[1] = parseInt(myCoords[1]);
						// Now increment the mine counts for my touching blocks
						incrementMineCount.call($(this).next());
						incrementMineCount.call($(this).prev());
						
						// Top and bottom
						incrementMineCount.call(getBlockAt(myCoords[0]-1, myCoords[1]));
						incrementMineCount.call(getBlockAt(myCoords[0]+1, myCoords[1]));
						
						// Cousins
						incrementMineCount.call(getBlockAt(myCoords[0]+1, myCoords[1]+1));
						incrementMineCount.call(getBlockAt(myCoords[0]+1, myCoords[1]-1));
						incrementMineCount.call(getBlockAt(myCoords[0]-1, myCoords[1]-1));
						incrementMineCount.call(getBlockAt(myCoords[0]-1, myCoords[1]+1));
						
					});
				}
				
				function getBlockAt(x,y) {
					return $("#block_"+x+"-"+y);
				}
				
				function incrementMineCount() {
					if (this.data("mine") != true) {
						count = this.data("minecount") || 0;
						count++;
						this.data("minecount",count)
						this.html(count);
					}
					return this;
					
				}
				
				function handleBlockClick(event) {
					if (firstClick) {
						populateGrid($(event.target));
						firstClick = false;
					}
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

