// JavaScript Document
$(window).load(function(){
	var holder = $('#slideHolder');
	var holderWidth =0;
	var allPieces = holder.children();
	var allPiecesCSS = [];
	var backBtn = $('#goBack');
	var nextBtn = $('#goNext');
	var count = holder.children().length;
	var output = $('#outputBx');
	var del = 3500;
	var anim = 800;
	var i=0;
	var sp = 120;
	
	var slideWidth =0;
	var slideHeight = holder.children(i).outerHeight()/1.7;
	
	window.location = '#';
	var urlPath = window.location.pathname;
	//var $urlPath = $(location).attr('href');
	
	$('#imgPane').css('height', slideHeight) ;
	holder.css('position', 'absolute') ;
	$.each(allPiecesCSS, function(){ allPiecesCSS.push($(this).css()); });
	//var $height1;
	
	/*when next is hit ->
	- set newPiece width based on contents
	- pull newPiece into place, centered in imgPane, setting imgPane height and width on it (arrows and content wrap it)
	- collect newPiece into into title, slideshow bar, rightbar (if applicable), details
	- hover states for imgs (disappear left/right arrows at beginning/end?
	
	to do this:
	get holder children (div class="piece")
	name each of them by number? 1-3, corresponding content also numbered
	set width of newPiece by calculating sub div widths
	*/
	$.each(allPieces, function(index, thisBlock){
		holderWidth += $(this).outerWidth() + sp ;
		output.append(slideHeight + '<br />');
		
		//alert (index);
	});
	//alert(allPieces.first().find('span.cat1').html());
	//opac $allPieces.animate({ opacity: 0.5 }, 0, function() {});
	//opac$allPieces.eq(0).animate({ opacity: 1 }, 0, function() {});
	//$holderHeight=$allPieces.outerHeight();
	//$holder.parent().css('height',$holderHeight);
	holder.css('width', holderWidth + 50 + 'px');
	//$holder.css('left','+=30px');
	output.append('<strong>' + holder.offset().left + '</strong>' + '<br /><br />' + holderWidth +'px');
	
	$('.moreInfo').hide();
	$('.hov2').hide();
	$('.mainLink').children().hide();
	$('.mainLink').children(':first-child').show();
	
	$('.boxBtn').click( function (e){
		$('.moreInfo').eq(i).slideToggle('slow', function() {});
		e.preventDefault();
		var currHeight = slideHeight;
		var infoHeight = $('#content').children('.moreInfo').eq(i).outerHeight();
		$('html, body').animate({ scrollTop: $(document).height() }, "slow");
	});
	
	$('.subLinks').mouseover( function(){
		var linkNum = $(this).index();
		$(this).parent().parent().children('.mainLink').children().hide();
		$(this).parent().parent().children('.mainLink').children().eq(linkNum).show();
	});
	
	$('.hov').parent().mouseover( function(){
		$(this).children('.hov').stop(true,true).slideUp('fast', function() {})
	});
	
	$('.hov').parent().mouseout( function(){
		$('.hov').stop(true,true).slideDown('fast', function() {})
	});
	
	$('.hov2').parent().mouseout( function(){
		$(this).children('.hov2').stop(true,true).slideUp('fast', function() {})
	});
	
	$('.hov2').parent().mouseover( function(){
		$('.hov2').stop(true,true).slideDown('fast', function() {})
	});
	$('.subCont').animate({ opacity: 0.2}, 0, function() {});
	$('.subCont').animate({ opacity: 1}, anim*2, function() {});
	$('.sideNote').animate({ opacity: 0.2}, 0, function() {});
	$('.sideNote').animate({ opacity: 1}, anim*8, function() {});
	
	//$(window).load(function(){
	//	var $height1 = $holder.height();
		//$output.append($height1);
	//});
	
	//SLIDESHOW
	function nextSlide(){
		if( i<count-1 ){
			i++;
			slideWidth= allPieces.eq(i).outerWidth() + sp;
			slideHeight= allPieces.eq(i).outerHeight();
			allPieces.animate({ left: '-='+ slideWidth + 'px' }, anim, function() {} );
			$('#imgPane').animate({ height: slideHeight +'px' }, anim, function(){}).css('overflow','visible');
			$('.moreInfo').hide();
			//opac $allPieces.eq(i).animate({
			//opac   opacity: 1,
			//opac   }, $anim/3, function() {}
			//opac );
			var pieceName = allPieces.eq(i).find('.cat1').html().replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
			if (!pieceName) {window.location.hash = '';} else { window.location.hash = pieceName;};
			output.append(i + slideHeight +' ---- ' + urlPath);
		} else if(i>count-2) {
		    i=0;
			slideWidth=allPieces.eq(i).outerWidth() + sp;
			slideHeight=allPieces.eq(i).outerHeight();
			allPieces.animate({ left: '+='+ slideWidth * (count-1) + 'px' }, anim, function() {} );
			$('#imgPane').animate({height: slideHeight +'px'}, anim, function(){}).css('overflow','visible');
			$('.moreInfo').hide();
			var pieceName = allPieces.eq(i).find('.cat1').html().replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
			if (!pieceName) {window.location.hash = '';} else { window.location.hash = pieceName;};
		} else {
			i=0;
			slideWidth=allPieces.eq(i).outerWidth() + sp;
			slideHeight=allPieces.eq(i).outerHeight();
			$('#imgPane').animate({height: slideHeight +'px'}, anim, function(){});
			kickIt();
			var pieceName = allPieces.eq(i).find('.cat1').html().replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
			if (!pieceName) {window.location.hash = '';} else { window.location.hash = pieceName;};
		}
		$('.slideDot').animate({ opacity: .4}, anim/2, function() {});
		$('.slideDot').eq(i).animate({ opacity: 1}, anim/2, function() {});
		//$output.append(i + ' ---- ');
		//setInterval( "nextSlide()", 5000 );
	}
	
	function prevSlide(){
		if(i>0){
			i--;
			slideWidth=allPieces.eq(i).outerWidth() + sp;
			slideHeight=allPieces.eq(i).outerHeight();
			$('#imgPane').animate({height: slideHeight +'px'}, anim, function(){}).css('overflow','visible');
			allPieces.animate({
			  left: '+='+ slideWidth + 'px',
			  }, anim, function() {}
			);
			$('.moreInfo').hide();
			var pieceName = allPieces.eq(i).find('.cat1').html().replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
			if (!pieceName) {window.location.hash = '';} else { window.location.hash = pieceName;};
			output.append(i + slideHeight +' ---- ' + urlPath);
		} else if(i===0) {
		    i=count-1;
			slideWidth=allPieces.eq(i).outerWidth() + sp;
			slideHeight=allPieces.eq(i).outerHeight();
			$('#imgPane').animate({height: slideHeight +'px'}, anim, function(){}).css('overflow','visible');
			allPieces.animate({
			  left: '-='+ slideWidth * (count-1) + 'px',
			  }, anim, function() {}
			);
			$('#imgPane').css('height', slideHeight +'px');
			$('.moreInfo').hide();
			var pieceName = allPieces.eq(i).find('.cat1').html().replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
			if (!pieceName) {window.location.hash = '';} else { window.location.hash = pieceName;};
			output.append(i + slideHeight +' ---- ' + urlPath);
		} else {
			i=0;
			slideWidth=allPieces.eq(i).outerWidth() + sp;
			slideHeight=allPieces.eq(i).outerHeight();
			$('#imgPane').css('height', slideHeight +'px');
			kickIt();
			var pieceName = allPieces.eq(i).find('.cat1').html().replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
			if (!pieceName) {window.location.hash = '';} else { window.location.hash = pieceName;};
		}
		$('.slideDot').animate({ opacity: .4}, anim/2, function() {});
		$('.slideDot').eq(i).animate({ opacity: 1}, anim/2, function() {});
		output.append(i + ' ---- ');
		//setInterval( "nextSlide()", 5000 );
	}
	
	$.each(allPieces, function(){
		$('#slideRef').append('<div class="slideDot"><p>' + ($(this).index()+1) + '</p></div>');
	});
	$('.slideDot').animate({ opacity: .4}, 0, function() {});
	
	nextBtn.click( function(e){
		nextSlide();
		//$holder.animate({left: '-=' + $slideWidth + 'px'}, "slow");
		//$holderX = $nextOffset;
		// (holderXcurr/holderXcount)
		//$output.append('<h2>' + $holder.offset().left + '</h2><h2>' + $holderX + '</h2><h2>' + $newHolderX + '</h2>');
	});
	backBtn.click( function(e){
		prevSlide();
		//$holder.animate({left: '+=' + $slideWidth + 'px'}, "slow");
		//$holderX = $backOffset;
		//$output.append($holderX);
	});
	output.append(holder.offset().left);
	/*$.each($allPieces, function(i, val) {
          $output.append(i + " : " + val + "<br/>");
		  
        });*/
	
	/*$('.slideDot').click( function(){
		$('.slideDot').animate({ opacity: .1}, 0, function() {});
		$(this).animate({ opacity: 1}, 0, function() {});
		
		var num = $(this).index();
		 nextSlide();
	});*/
		
		
	$(document).keydown(function(e){
    switch (e.keyCode) {
	   case 37: 
       prevSlide();
       return false;
	   break;
	   case 39:
	   nextSlide();
	   return false;
	   break;
	   case 32:
	   $('.moreInfo').eq(i).slideToggle('slow', function() {});
		e.preventDefault();
		var currHeight = slideHeight;
		var infoHeight = $('#content').children('.moreInfo').eq(i).outerHeight();
		$('html, body').animate({ scrollTop: $(document).height() }, "slow");
		return false;
		break;
    }
	});
});