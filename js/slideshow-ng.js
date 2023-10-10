/*
options to pass through :
  - slideholder name
  - controls(back, forward, more info, keystrokes)
  - navigation, 
  - imgpane
  - sections (imageCase, details)

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
var articles = $('article');
var anim = 800;

var slideCase = $('section.imgCase');
var multiImgHolder = $('div.mainImg');
var iconHolder = $('div.icons');

var navHolder = $('.container');
var slideObj = {};

var nextControl = $('.slideNext');
var backControl = $('.slideBack');
var backBGImage = backControl.css('background-image');
//var extraDetails = $('div.subDetails');
//var detailsBtn = $('a.detailsBtn');
var currSlide = 0;


//METHODS
var MySlideShow = {
  createSlideArray : function(){
    $.each(articles, function(i, e){
      var name = $(this).find('header h1').html();
      if(name!==undefined){
        var cleanName = name.replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
        $(this).addClass(cleanName);  //add class to article
        $.extend( slideObj, {
          hash : cleanName,
          name : name
        });  
        console.log(slideObj);  //create array of names
      } else { }    //empty if no h1
    });
  },
  createNav : function(){
    var navStr = '<nav class="slideNav"><ul>';
    //BUILD NAV LI ELEMENTS AS STRING
    //$.each(slideArray, function(i) ){
      //navStr += '<li class="'+ newClass +'">' + name + '</li>';     //create li for nav
    //};
    navStr += '<span class="count">0</span><span class="total"> / ' + (articles.length-1) + '</span>';
    navStr += '</ul></nav>';
    $(navStr).prependTo(navHolder);
    //NAV MOUSE EVENTS
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
    //SET CONTAINERS TO SLIDE, STATIC
    imgPane.css({ position : 'relative' });
    holder.css({ position : 'absolute' });
    articles.css({'margin-right' : '60px'});
    //BUILD NAV AND SLIDE
    this.createSlideArray();
    this.createNav();
    this.resetCss($(window).width());
    this.jumpToSlide(window.location.hash.substring(1));
    //HIDE ALL IMAGES BUT FIRST CHILD AND EXTRA CONTENT
    //extraDetails.hide();
    multiImgHolder.children().hide();
    multiImgHolder.children(':first-child').show();

    $('.jsHide').show();
  },
  jumpToSlide : function(slideHash){
    var slideNum=0;
    if(typeof slideHash==="undefined" || slideHash===''){slideNum=0;};
    if(typeof slideHash==="number" || slideHash===0){
      slideHash = slideNum;
    } else if(typeof slideHash==="string" && slideHash!==''){
      if(slideHash==='piece'){slideNum=0;} else {
        slideNum = holder.find('.'+slideHash).index();
      }
    }
    this.removeControls();
    $('nav.slideNav ul').slideUp();
    holder.animate({ left: '-' + (slideNum * articles.outerWidth(true)) - imgPane.offset().left + 'px' }, anim, function() {
      MySlideShow.slideEnd();
    });
  },
  navSlide : function(dir,moveBlock,slideWidth){
    this.removeControls();
    if(currSlide<articles.length-1){
      moveBlock.animate({ dir : '-='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      $('nav.slideNav ul').slideUp();
    } else {
      moveBlock.animate({ dir : 0 - imgPane.offset().left +'px'}, anim*2, function() {
        MySlideShow.slideEnd();
      });
      $('nav.slideNav ul').slideDown();
    }
  },
  /*moreInfo : function(jqArticle){
    $(jqArticle).find(extraDetails).slideToggle('fast', function(){
      imgPane.animate({ height : articles.eq(currSlide).outerHeight(true) - $('header.main').outerHeight(true) +'px' }, 'fast', function(){});
    });
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
  },*/
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
      //show nav for slide 1
      //if(currSlide < 1.5){ $('nav.slideNav ul').slideDown(); } else { $('nav.slideNav ul').slideUp(); }
    } else {
      moveBlock.animate({left: (slideWidth * (articles.length-1) * -1)-imgPane.offset().left + 'px'}, anim*2, function(){
        MySlideShow.slideEnd();
      });
      $('nav.slideNav ul').slideDown();
    }
  },
  resetCss : function(winWidth){
    // CSS CHANGES
    var paneWidth = imgPane.outerWidth(true);
    var spacing = articles.outerWidth(true) - articles.outerWidth();
    var leftSpace = imgPane.offset().left;

    //RESET CONTAINER WIDTHS
    articles.css({ width : paneWidth + 'px' });
    holder.css({
      left : currSlide*(paneWidth + spacing)*-1 -leftSpace +'px',
      width : (paneWidth + spacing) * articles.length + 50 + 'px'
    });
    imgPane.css({
      'min-height' : $(window).height() - $('footer.main').outerHeight(true) - $('nav.slideNav').outerHeight(true) + 'px',
      height : articles.eq(currSlide).outerHeight(true) - $('nav.slideNav').outerHeight(true) +'px'
    });
  },
  setHash : function(slideNum){
    slideClass = articles.eq(slideNum).attr('class').replace('piece ','');
    window.location.hash = slideClass;
  },
  slideEnd : function(){
    MySlideShow.setControls();
    currSlide = MySlideShow.getSlideNum();
    this.setHash(currSlide);
    $('.slideNav .count').html(currSlide);
    imgPane.css({
      height : articles.eq(currSlide).outerHeight(true) +'px'
    });
    if(currSlide<0.5){ backControl.css({'background-image':'none'});} else if(currSlide>0.5) {backControl.css({'background-image':backBGImage});};
  },
  setControls : function(){
    //EVENT LISTENERS
    //show subimg for each section in piece
    iconHolder.children().on('mouseover', function(){
      var linkNum = $(this).index();
      $(this).parents('article').find(multiImgHolder).children().hide();
      $(this).parents('article').find(multiImgHolder).children().eq(linkNum).show();
    });
    /*detailsBtn.on('click', function(e){
      MySlideShow.moreInfo($(this).parents('article'));
    });*/
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
    //detailsBtn.off('click');
    nextControl.off('click');
    backControl.off('click');
    $(document).off('keydown');
  }
}
//$('header.title').first().appendTo('header.main div.subContainer');

//WINDOW RESIZE
$(window).resize( function(){
  var winWidth = $(this).width();
  MySlideShow.resetCss(winWidth);
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
