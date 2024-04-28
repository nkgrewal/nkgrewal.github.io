// JavaScript Document
$(document).ready( function() {	
	var $slideContainer = $('#carousel');
	var $slidesArr = $slideContainer.children();
	var $count = $slidesArr.length;    
	
	var $slideWidth = 960;
	var $carouselWidth = $slideWidth * ($count-1);
	var $del = 10500;
	var $anim = 800;
	var i=0;
	var $dotNum;
	var timeSlide;
		
	var $controls = $('#slideControls');
	var $leftBtn = $('#leftBtn');
	var $rightBtn = $('#rightBtn');
	
	//ADD BUTTONS PER SLIDE TO CONTROLS
	$.each($slidesArr, function(){
		$leftBtn.after('<div class="slideDot"></div>');
	});
		
	var $dotsArr = $('.slideDot');
	$('.slideDot').animate({ opacity: .1}, 0, function() {});
	$('.slideDot:first').animate({ opacity: 1}, 0, function() {});
	
	//SLIDESHOW
	function nextSlide(){
		if(i<$count-1){
			i++;
			$slidesArr.animate({
			  left: '-='+ $slideWidth + 'px',
			  }, $anim, function() {}
			);
		} else if(i>$count-2) {
		    i=0;
			$slidesArr.animate({
			  left: '+='+ $slideWidth * ($count-1) + 'px',
			  }, $anim, function() {}
			);
		} else {
			i=0;
			kickIt();
		}
		$('.slideDot').animate({ opacity: .1}, $anim/2, function() {});
		$('.slideDot').eq(i).animate({ opacity: 1}, $anim/2, function() {});
		$output.append(i + ' ---- ');
		//setInterval( "nextSlide()", 5000 );
	}
	
	function prevSlide(){
		if(i>0){
			i--;
			$slidesArr.animate({
			  left: '+='+ $slideWidth + 'px',
			  }, $anim, function() {}
			);
		} else if(i===0) {
		    i=$count-1;
			$slidesArr.animate({
			  left: '-='+ $slideWidth * ($count-1) + 'px',
			  }, $anim, function() {}
			);
		} else {
			i=0;
			kickIt();
		}
		$('.slideDot').animate({ opacity: .1}, $anim/2, function() {});
		$('.slideDot').eq(i).animate({ opacity: 1}, $anim/2, function() {});
		$output.append(i + ' ---- ');
		//setInterval( "nextSlide()", 5000 );
	}
	
	//LEFT PREVIOUS BTN
	$leftBtn.click( function(){
		prevSlide();
	});
	
	//RIGHT NEXT BTN
	$rightBtn.click( function(){
		nextSlide();
	});
	
	//SLIDE BTNS
	$('.slideDot').click( function(){
		$('.slideDot').animate({ opacity: .1}, 0, function() {});
		$(this).animate({ opacity: 1}, 0, function() {});
		var $num = $(this).index();
		i = $num-1;
		if (i<1){
			$.each($slidesArr, function(){
				$(this).animate({
				  left: $slideWidth * ( $(this).index() ) + 'px',
				  }, $anim, function() {} )
			});
		} else {
			$.each($slidesArr, function(){
				$(this).animate({
				  left: ($slideWidth * ( $(this).index() )) - (i* $slideWidth) + 'px',
				  }, $anim, function() {} )
			});
		}
	});
	
	function kickIt(){
		timeSlide = setInterval( nextSlide, $del );
	}
	
	$('#linkies').mouseover( function(){
		clearInterval(timeSlide);
	});
	$controls.mouseover( function(){
		clearInterval(timeSlide);
	});
	
	$('#linkies').mouseout( function(){
		timeSlide = setInterval( nextSlide, $del );
	});
	$controls.mouseout( function(){
		timeSlide = setInterval( nextSlide, $del );
	});
	
	kickIt();
});