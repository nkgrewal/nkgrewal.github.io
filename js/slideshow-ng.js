var holder = $('#slideHolder');
var allPieces = holder.children();
var holderWidth = 0;
var spacing = 120;
var slideDistance = $('#imgPane').outerWidth() + spacing;
var fullHolderWidth = (allPieces.length-2) * slideDistance;
var animDuration = 800;

// ADD CLASS NAME TO EACH PIECE AND GET HOLDER WIDTH
$.each(allPieces, function(index, thisBlock){
	var pieceName='';
	if($(this).find('.cat1').html()===null){
		if($(this).find('.title h2').html()!==null){
			pieceName = $(this).find('.title h2').html();
		} else {
			pieceName = '';
		}
	} else {
		pieceName = $(this).find('.cat1').html();
	}
	var pieceNameClass = pieceName.replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
	$(this).addClass(pieceNameClass);
	if (pieceName!==''){ $('#slideRef').append('<li class="slideDot ' + pieceNameClass + '">' + pieceName + '</li>') } else {};
	holderWidth += $(this).outerWidth() + spacing;
});


// CSS CHANGES
holder.css({
	position : 'absolute',
	width : holderWidth + 50 + 'px'
});


//HIDE EVERYTHING BUT THE FIRST IMAGE PER SECTION, hover state for sublinks
$('.mainLink').children().hide();
$('.mainLink').children(':first-child').show();
$('#slideArea .moreInfo').hide();


//FUNCTION TO SET SLIDE NAV IN FOOTER
function highlightSlideRef(slideName){
	$.each($('.slideDot'), function(index){
		if($(this).hasClass(slideName)) {
			$(this).animate({ opacity: 1, fontSize: '1.1em' }, animDuration/2, function() {});
		} else { $(this).animate({ opacity: 0.8,  fontSize: '0.75em' }, animDuration/2, function() {}); }
	});
}


// FAIL SAFE: RESET TO FIRST SLIDE
function gotoFirst(){
	allPieces.animate({ left: '0px' }, animDuration, function() {} );						//move all slides back to zero position
	$('#content .moreInfo').html(allPieces.eq(0).find('.moreInfo').html()).hide();			//put "More Info" section into #content
	$('#imgPane').css({ height: allPieces.eq(0).outerHeight() +'px' });						//resize #imgPane height to match content
	highlightSlideRef(allPieces.eq(0).attr('class').replace('piece ',''));					//highlight slide name in slide nav
	$('#goBack').animate({ opacity: 0.2 }, 0, function() {});								//sop opac on back btn
}

//SLIDENAME TO HASHTAG
function runSlideJump(hashSlide){
	if (!hashSlide){ gotoFirst(); } else
	{
		hashSlide = hashSlide.replace('#', '');
		$.each(allPieces, function(index, thisBlock){
			if ($(this).hasClass(hashSlide) && hashSlide!='piece' ){
				//move slides to right position
				allPieces.animate({ left: '-='+ slideDistance*index  + 'px' }, animDuration/2, function() {} );
				//populate More Info
				$('#content .moreInfo').html(allPieces.eq(index).find('.moreInfo').html()).hide();	
				//reset height
				var thisSlideNum = (parseInt(allPieces.eq(0).css('left'))/slideDistance*-1)+1;
				$('#imgPane').css({ height: allPieces.eq(thisSlideNum).outerHeight() +'px' });
				highlightSlideRef(hashSlide);
				$('#goBack').animate({ opacity: 1 }, 0, function() {});
			} else if( hashSlide==='piece' ){ window.location = '' };
		});
	}
}

runSlideJump(window.location.hash);


//FUNCTION TO RUN NEXT SLIDE
function nextSlide(){
	window.location = '#';
	//reset holder if it's the last slide, otherwise slide to next
	if (parseInt(allPieces.eq(0).css('left')) < fullHolderWidth * -1 ) {
		gotoFirst();
		window.location.hash = allPieces.eq(0).attr('class').replace('piece ','');
	} else {
		var newSlideNum = (parseInt(allPieces.eq(0).css('left'))/slideDistance*-1)+1;
		allPieces.animate({ left: '-='+ slideDistance  + 'px' }, animDuration, function() {} );
		//allPieces.eq(newSlideNum).animate({ opacity: 1 }, animDuration/3, function() {} );
		$('#content .moreInfo').html(allPieces.eq(newSlideNum).find('.moreInfo').html());
		$('#imgPane').animate({ height: allPieces.eq(newSlideNum).outerHeight() +'px' }, animDuration, function(){} ).css('overflow','visible');
		try {
			var pieceName = allPieces.eq(newSlideNum).attr('class').replace('piece ','');
			highlightSlideRef(pieceName);
			window.location.hash = pieceName;
		} catch (err) { };
	}
	if($('#content .moreInfo').is(':visible')) { $('#content .moreInfo').hide(); };
	$('#goBack').animate({ opacity: 1 }, 0, function() {});
}

function prevSlide(){
	window.location = '#';
	//reset holder if it's the last slide, otherwise slide to next
	if (parseInt(allPieces.eq(0).css('left')) >= 0 ) {
		var newSlideNum = (parseInt(allPieces.eq(0).css('left'))/slideDistance*-1)-1;
		var pieceName = allPieces.eq(newSlideNum).attr('class').replace('piece ','');
		$('#imgPane').animate({ height: allPieces.eq(newSlideNum).outerHeight() +'px' }, animDuration, function(){}).css('overflow','visible');
		//allPieces.animate({ left: '-='+ ((allPieces.length-1) * slideDistance) + 'px' }, animDuration, function() {} );
		$('#content .moreInfo').html(allPieces.eq(newSlideNum).find('.moreInfo').html());
		try {
			highlightSlideRef(allPieces.eq(newSlideNum).attr('class').replace('piece ',''))
			window.location.hash = pieceName;
		} catch (err) {};
	} else {
		var newSlideNum = (parseInt(allPieces.eq(0).css('left'))/slideDistance*-1)-1;
		allPieces.animate({ left: '+='+ slideDistance  + 'px' }, animDuration, function() {} );
		allPieces.eq(newSlideNum).animate({ opacity: 1 }, animDuration/3, function() {} );
		$('#content .moreInfo').html(allPieces.eq(newSlideNum).find('.moreInfo').html());
		$('#imgPane').animate({ height: allPieces.eq(newSlideNum).outerHeight() +'px' }, animDuration, function(){}).css('overflow','visible');
		try {
			var pieceName = allPieces.eq(newSlideNum).attr('class').replace('piece ','');
			highlightSlideRef(pieceName);
			window.location.hash = pieceName;
		} catch (err) { };
	}
	if($('#content .moreInfo').is(':visible')) { $('#content .moreInfo').hide(); };
	$('#goBack').animate({ opacity: 1 }, 0, function() {});
}

function showMoreInfo() {
	var thisSlideNum = parseInt(allPieces.eq(0).css('left'))/slideDistance*-1;
	var slideHeight = allPieces.eq(thisSlideNum).outerHeight();
	var infoHeight = $('#content .moreInfo').outerHeight();
	$('#content .moreInfo').slideToggle('slow', function() {});
	$('html, body').animate({ scrollTop: $(document).height() }, "slow");
}

//EVENT LISTENERS
//show subimg for each section in piece
$('.subLinks').mouseover( function(){
	var linkNum = $(this).index();
	$(this).parent().parent().children('.mainLink').children().hide();
	$(this).parent().parent().children('.mainLink').children().eq(linkNum).show();
});

//show hover text for each section
$('.hov, .hov2').parent().bind({
	mouseover: function(){
	$(this).children('.hov, .hov2').slideUp('fast', function() {});
	},
	mouseout: function(){
	$(this).children('.hov, .hov2').stop(true,true).slideDown('fast', function() {});
	}
});

//click on subnav in footer reloads page to corresponding slide
$('.slideDot').bind('click', function(e){
	var hashSlide = $(this).attr('class').replace('slideDot ','');
	window.location.hash = hashSlide;
	window.location.reload();
});
$('.aboutMe').bind('click', function(e){
	window.location.hash = $(this).attr('href');
	window.location.reload();
	return false;
});

//clicks/keyboard to slide through pieces
$('#goNext').bind('click', nextSlide);
$('#goBack').bind('click', prevSlide);
$('.boxBtn').bind('click', showMoreInfo);
$(document).bind('keydown', function(e){
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
	   showMoreInfo();
	   return false;
	   break;
	}
});

$(window).load(function() {
  $('#preloader').fadeOut(900, function() {
    $('body').css('overflow','visible');
    $(this).remove();
  });
});