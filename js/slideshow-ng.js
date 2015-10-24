/*
options to pass through :
  - slideholder name, controls(back, forward, more info, keystrokes), navigation, imgpane, sections (imageCase, details)
  - 

- resize holder
- get direct children of holder
- hide all but first child in multi img

set per assumptions:
in an article
has a slideCase
has back fwd btn
placed in imgPane

SLIDE BY HOLDER POSITION
( Math.abs(holder.offset().left) + articles.outerWidth(true) ) / articles.outerWidth(true)
*/
var imgPane = $('section.imgPane');
var holder = $('.slideHolder');
var titleHolder = $('header.main div.subContainer');
var articles = $('article');
var anim = 800;

var slideCase = $('section.imgCase');
var extraDetails = $('div.subDetails');
var multiImgHolder = $('div.mainImg');
var iconHolder = $('div.icons');

var navHolder = $('.container');

var nextControl = $('.goNext');
var backControl = $('.goBack');
var detailsBtn = $('a.detailsBtn');
var currSlide = 0;


//METHODS
var MySlideShow = {
  createNav : function(){
    var navStr = '<nav class="slideNav"><ul>';

    $.each(articles, function(index, thisBlock){
      var name = $(this).find('header h1').html();
      if(name!==null){
        var newClass = name.replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
        $(this).addClass(newClass);                              //add class to article
        navStr += '<li class="'+ newClass +'">' + name + '</li>';     //create li for nav
      } else {
        navStr +='<li class="blank"></li>';
      }
    });
    navStr += '<span class="count">0</span><span class="total"> / ' + (articles.length-1) + '</span>';
    navStr += '</ul></nav>';
    
    $(navStr).prependTo(navHolder);

    $('nav.slideNav').on({
      'mouseover': function(e){
        $(this).children().stop(true,true).slideDown();
      },
      'mouseout' : function(e){
        $(this).children().stop(true,true).slideUp();
      }
    });
    $('nav.slideNav ul').on('mouseover', function(e){
      $(this).stop(true,true).slideDown();
    });
    $('nav.slideNav li').on('click', function(){
      MySlideShow.jumpToSlide($(this).attr('class'));
    });
    $('a[href="#wildcard"]').on('click', function(){
      MySlideShow.jumpToSlide($(this).attr('href').substring(1));
    });
  },
  getSlideNum : function(){
    return Math.round( Math.abs(holder.offset().left)  / articles.outerWidth(true) );
  },
  initSlideShow : function(){
    imgPane.css({
      position : 'relative'
    });
    holder.css({
      position : 'absolute'
    });
    this.createNav();
    this.setCss($(window).width());
    this.jumpToSlide(window.location.hash.substring(1));

    //HIDE ALL IMAGES BUT FIRST CHILD AND EXTRA CONTENT
    extraDetails.hide();
    multiImgHolder.children().hide();
    multiImgHolder.children(':first-child').show();

    $('.jsHide').show();
  },
  jumpToSlide : function(slideNumOrHash){
    if(typeof slideNumOrHash==="undefined" || slideNumOrHash===''){
      slideNum=0;
    }
    if(typeof slideNumOrHash==="number" || slideNumOrHash===0){
      slideNumOrHash = slideNum;
    } else if(typeof slideNumOrHash==="string" && slideNumOrHash!==''){
      if(slideNumOrHash==='piece'){slideNum=0;} else {
        slideNum = holder.find('.'+slideNumOrHash).index();
      }
    }

    this.removeControls();
    $('nav.slideNav ul').slideUp();
    holder.animate({ left: '-' + (slideNum * articles.outerWidth(true)) - imgPane.offset().left + 'px' }, anim, function() {
      MySlideShow.slideEnd();
    });
  },
  moreInfo : function(jqArticle){
    $(jqArticle).find(extraDetails).slideToggle('fast', function(){
      imgPane.animate({ height : articles.eq(currSlide).outerHeight(true) - $('header.main').outerHeight(true) +'px' }, 'fast', function(){});
    });
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
  },
  nextSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currSlide<articles.length-1){
      moveBlock.animate({ left: '-='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      $('nav.slideNav ul').slideUp();
    } else {
      moveBlock.animate({ left: 0 - imgPane.offset().left +'px'}, anim*2, function() {
        MySlideShow.slideEnd();
      });
      $('nav.slideNav ul').slideDown();
    }
  },
  prevSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currSlide>0.5){
      moveBlock.animate({ left: '+='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      if(currSlide < 1.5){ $('nav.slideNav ul').slideDown(); } else { $('nav.slideNav ul').slideUp(); }
    } else {
      moveBlock.animate({left: (slideWidth * (articles.length-1) * -1)-imgPane.offset().left + 'px'}, anim*2, function(){
        MySlideShow.slideEnd();
      });
      $('nav.slideNav ul').slideDown();
    }
  },
  resetFlashSize : function(newWidth){
    var newHeight = Math.round(newWidth * 0.67230769);
    $('.salarymap script').html("AC_FL_RunContent( 'width','"+newWidth+"','height','"+newHeight+"','codebase','http://fpdownload.macromedia.com/ pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0','src','swfs/apsySalaryMap' );");
    $('.salarymap embed').attr('width', newWidth).attr('height', newHeight);
  },
  setHash : function(slideNum){
    slideClass = articles.eq(slideNum).attr('class').replace('piece ','');
    window.location.hash = slideClass;
  },
  setCss : function(winWidth){
    // CSS CHANGES
    var paneWidth = imgPane.outerWidth(true);
    var spacing = articles.outerWidth(true) - articles.outerWidth();
    var leftSpace = imgPane.offset().left;
    
    articles.css({ width : paneWidth + 'px' });
    holder.css({
      left : currSlide*(paneWidth + spacing)*-1 -leftSpace +'px',
      width : (paneWidth + spacing) * articles.length + 50 + 'px'
    });
    titleHolder.css('width',holder.outerWidth(true)+'px');
    titleHolder.children().css({ width : paneWidth + 'px' });
    imgPane.css({
      'min-height' : $(window).height() - $('header.main').outerHeight(true) - $('footer.main').outerHeight(true) - $('nav.slideNav').outerHeight(true) + 'px',
      height : articles.eq(currSlide).outerHeight(true)- $('header.main').outerHeight(true) - $('nav.slideNav').outerHeight(true) +'px'
    });
    if(winWidth>950){ MySlideShow.resetFlashSize(800); }
    if(winWidth<949 && winWidth>550){ MySlideShow.resetFlashSize(500); }
    if(winWidth<549 && winWidth>350){ MySlideShow.resetFlashSize(300); }
  },
  slideEnd : function(){
    MySlideShow.setControls();
    currSlide = MySlideShow.getSlideNum();
    this.setHash(currSlide);
    $('.slideNav .count').html(currSlide);
    imgPane.css({
      height : articles.eq(currSlide).outerHeight(true) - $('header.main').outerHeight(true) +'px'
    });
  },
  setControls : function(){
    //EVENT LISTENERS
    //show subimg for each section in piece
    iconHolder.children().on('mouseover', function(){
      var linkNum = $(this).index();
      $(this).parents('article').find(multiImgHolder).children().hide();
      $(this).parents('article').find(multiImgHolder).children().eq(linkNum).show();
    });
    detailsBtn.on('click', function(e){
      MySlideShow.moreInfo($(this).parents('article'));
    });
    backControl.on('click', function(e){
      MySlideShow.prevSlide(holder, articles.outerWidth(true) );
    });
    nextControl.on('click', function(e){
      MySlideShow.nextSlide(holder, articles.outerWidth(true) );
    });
    $(document).on('keydown', function(e){
      switch (e.keyCode) {
         case 37:
         MySlideShow.prevSlide(holder, articles.outerWidth(true) );
         return false;
         break;
         case 39:
         MySlideShow.nextSlide(holder, articles.outerWidth(true) );
         return false;
         break;
         case 32:
         MySlideShow.moreInfo(articles.eq(currSlide));
         return false;
         break;
      }
    });
  },
  removeControls : function(){
    iconHolder.children().off('mouseover');
    detailsBtn.off('click');
    nextControl.off('click');
    backControl.off('click');
    $(document).off('keydown');
  }
}
articles.css({'margin-right' : '60px'});

//$('header.title').first().appendTo('header.main div.subContainer');

//WINDOW RESIZE
$(window).resize( function(){
  var winWidth = $(this).width();
  MySlideShow.setCss(winWidth);
});

$(document).ready(function(){
  MySlideShow.initSlideShow();
});

$(window).ready(function() {
  $('.preloader').fadeOut(900, function() {
    $('body').css('overflow','visible');
    $(this).remove();
  });
});
