/*
options to pass through :
  - allSlides name
  - controls(back, forward, more info, keystrokes)
  - navigation
  - slide viewport - div
  - slideshow content holder - section
  - slide content animations (imageCase, details)

- resize holder
- get direct children of holder
- hide all but first child in multi img

set per assumptions:
in an article
has a slideCase
has back fwd btn
placed in viewArea

SLIDE BY HOLDER POSITION
( Math.abs(holder.offset().left) + pieces.outerWidth(true) ) / pieces.outerWidth(true)
*/

//VARS FOR EXTERNALE HTML CLASS DEPENDENCIES
var nextControl = $('.jsGoNext');         //slideshow next button
var backControl = $('.jsGoBack');         //slideshow back button

var viewArea = $('.slideViewer');         //frame for viewing slide
var holder = $('.allSlides');             //entire slideshow container
var pieces = $('.allSlides article');     //individual slides

//var slideCase = $('section.imgCase');   //slide type - main image
var multiImgHolder = $('div.mainImg');    //slide type - multi image
var iconHolder = $('div.icons');          //slide type - multi image icons

var navHolder = $('.container');          //where to place slide nav

var backBGImage = backControl.css('background-image');  //toggle image for back - delete?
//var extraDetails = $('div.subDetails');
//var detailsBtn = $('a.detailsBtn');

//VARS FOR INTERNAL REF
var navClass = "slideNav"                 //class name of nav element
var slideObj = {};                        //empty object that will hold slide identifying info
var currSlide = 0;                        //start from 0 on load
var anim = 800;                           //slide speed


//METHODS
var MySlideShow = {
  createSlideObject : function(){
    $.each(pieces, function(i, e){
      var name = $(this).find('header h1').html();    //identify slide by h1 title
      if(name!==undefined){
        var cleanName = name.replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
        $(this).addClass(cleanName);      //add unique class name to each slide
        var obj = {                       //create unique obj per iteration to push into slideObj
          [cleanName] : {
            num : i,
            //hash : cleanName,
            name : name
          }
        };
        $.extend(slideObj, obj);
      } else { }                          //empty if no h1
    });
    console.log(slideObj);                //verify object of every slide's id info (e.g. name, hash)
  },
  createNav : function(){
    //CREATE OPENING TAGS FOR NAV
    var navStr = '<nav class="' + navClass + '"><ul>';
    navStr += '<li class="">' + '\u25C8' + '</li>';
    //BUILD NAV LI ELEMENTS AS STRING
    $.each(slideObj, function(i, e) {
      var newClass = i;
      var name = e.name;
      console.log(newClass, e.name);
      navStr += '<li class="'+ newClass +'">' + name + '</li>';     //create li for slides
    });
    //CLOSING TAGS FOR NAV
    navStr += '<li class="wildcard">About</li>';
    navStr += '<span class="count">0</span><span class="total"> / ' + (pieces.length-1) + '</span>';
    navStr += '</ul></nav>';
    $(navStr).prependTo(navHolder);
    //NAV MOUSE EVENTS
    $('nav.' + navClass).on({
      'mouseover': function(e){
        $(this).children().stop(true,true).slideDown();
      },
      'mouseout' : function(e){
        $(this).children().stop(true,true).slideUp();
      }
    });
    //PREVENT MOUSOVER FLICKER
    $('nav.' + navClass + ' ul').on('mouseover', function(e){
      $(this).stop(true,true).slideDown();
    });
    $('nav.' + navClass + ' li').on('click', function(){
      MySlideShow.jumpToSlide($(this).attr('class'));
    });
    $('a[href="#wildcard"]').on('click', function(){
      MySlideShow.jumpToSlide($(this).attr('href').substring(1));
    });
  },
  getSlideNum : function(){
    return Math.round( Math.abs(holder.offset().left)  / pieces.outerWidth(true) );
  },
  initSlideShow : function(){
    //SET CONTAINERS TO SLIDE, STATIC
    viewArea.css({ position : 'relative' });
    holder.css({ position : 'absolute' });
    pieces.css({'margin-right' : '60px'});
    //BUILD NAV AND SLIDE
    this.createSlideObject();
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
    $('nav.' + navClass + ' ul').slideUp();
    if ($('nav.' + navClass).is(':visible')) {console.log(true)} else {console.log(false)};
    holder.animate({ left: '-' + (slideNum * pieces.outerWidth(true)) - viewArea.offset().left + 'px' }, anim, function() {
      MySlideShow.slideEnd();
    });
  },
  /*navSlide : function(dir,moveBlock,slideWidth){
    this.removeControls();
    if(currSlide<pieces.length-1){
      moveBlock.animate({ dir : '-='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideUp();
    } else {
      moveBlock.animate({ dir : 0 - viewArea.offset().left +'px'}, anim*2, function() {
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideDown();
    }
  },
  moreInfo : function(jqArticle){
    $(jqArticle).find(extraDetails).slideToggle('fast', function(){
      viewArea.animate({ height : pieces.eq(currSlide).outerHeight(true) - $('header.main').outerHeight(true) +'px' }, 'fast', function(){});
    });
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
  },*/
  nextSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currSlide<pieces.length-1){
      moveBlock.animate({ left: '-='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideUp();
    } else {
      moveBlock.animate({ left: 0 - viewArea.offset().left +'px'}, anim*2, function() {
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideDown();
    }
  },
  prevSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currSlide>0.5){
      moveBlock.animate({ left: '+='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      //show nav for slide 1
      //if(currSlide < 1.5){ $('nav.' + navClass + ' ul').slideDown(); } else { $('nav.' + navClass + ' ul').slideUp(); }
    } else {
      moveBlock.animate({left: (slideWidth * (pieces.length-1) * -1)-viewArea.offset().left + 'px'}, anim*2, function(){
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideDown();
    }
  },
  resetCss : function(winWidth){
    // CSS CHANGES
    var paneWidth = viewArea.outerWidth(true);
    var spacing = pieces.outerWidth(true) - pieces.outerWidth();
    var leftSpace = viewArea.offset().left;

    //RESET CONTAINER WIDTHS
    pieces.css({ width : paneWidth + 'px' });
    holder.css({
      left : currSlide*(paneWidth + spacing)*-1 -leftSpace +'px',
      width : (paneWidth + spacing) * pieces.length + 50 + 'px'
    });
    viewArea.css({
      'min-height' : $(window).height() - $('footer').outerHeight(true) - $('nav.' + navClass).outerHeight(true) + 'px',
      height : pieces.eq(currSlide).outerHeight(true) - $('nav.' + navClass).outerHeight(true) +'px'
    });
  },
  setHash : function(slideNum){
    slideClass = pieces.eq(slideNum).attr('class').replace('piece ','');
    window.location.hash = slideClass;
  },
  slideEnd : function(){
    MySlideShow.setControls();
    currSlide = MySlideShow.getSlideNum();
    this.setHash(currSlide);
    $('nav.' + navClass + ' .count').html(currSlide);
    viewArea.css({
      height : pieces.eq(currSlide).outerHeight(true) +'px'
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
      MySlideShow.prevSlide(holder, pieces.outerWidth(true) );
    });
    nextControl.on('click', function(e){
      MySlideShow.nextSlide(holder, pieces.outerWidth(true) );
    });
    $(document).on('keydown', function(e){
      switch (e.keyCode) {
         case 37:
         MySlideShow.prevSlide(holder, pieces.outerWidth(true) );
         return false;
         break;
         case 39:
         MySlideShow.nextSlide(holder, pieces.outerWidth(true) );
         return false;
         break;
         case 32:
         MySlideShow.moreInfo(pieces.eq(currSlide));
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
//$('header.title').first().appendTo('main.scaffold div.fascia');

//WINDOW RESIZE
$(window).resize( function(){
  var winWidth = $(this).width();
  MySlideShow.resetCss(winWidth);
});

$(document).ready(function(){
  MySlideShow.initSlideShow();
});

$(window).ready(function() {
  $('.curtainLoad').fadeOut(900, function() {
    $('body').css('overflow','visible');
    $(this).remove();
  });
});
