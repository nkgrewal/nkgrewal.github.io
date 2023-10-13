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

slideshow div structure:
has back fwd btn
has a slide view area window
has a holding container for all slides
has a place to insert slide show nav

in slide container structure:
each "slide" is an article without a set width
each article has a class
all portfolio articles are class named "piece" and have an h2 title

SLIDE BY HOLDER POSITION
( Math.abs(holder.offset().left) + allPieces.outerWidth(true) ) / allPieces.outerWidth(true)
*/

//VARS FOR EXTERNALE HTML CLASS DEPENDENCIES
var nextControl = $('.jsGoNext');         //slideshow next button
var backControl = $('.jsGoBack');         //slideshow back button

var viewArea = $('.slideViewer');         //frame for viewing slide
var holder = $('.allSlides');             //entire slideshow container, will animate through viewArea
var allPieces = $('.allSlides article');     //individual slides
var portPiece = 'piece';                    //class name of portfolio articles
var portTitle = 'header h2';                //location of portfolio title under allPieces

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
var currPieceIndex = 0;                   //start from 0 on load
var anim = 800;                           //slide speed
var pieceMargin = '60';                  //margin-right per slide, must be px


//METHODS
var MySlideShow = {
  createSlideObject : function(){
    $.each(allPieces, function(i, e){
      var name;
      var hashName;
      if (this.className !=='undefined'){
        //CAPTURE AND CLEAN EACH SLIDES NAMES FOR ID
        if (this.className === portPiece){           //identify "piece" slide by h2 title
          name = $(this).find( portTitle ).html();   
          hashName = name.replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
        }  
        else {                                    //identify slide by className
          hashName = this.className; 
          name = this.className; 
          name = name.replace(/[_\s]/g, "-").replace(/[^a-z0-9\s]/gi, " ")
          name = name.substr(0,1).toUpperCase()+name.substr(1);
        };
      } else {};
      //CREATE OBJECT OF UNIQUE SLIDE NAME AND HASH FOR NAV
      if(name!==undefined){
        $(this).addClass(hashName);       //add unique class name to each slide article
        var obj = {                       //create unique obj per iteration to push into slideObj
          [i] : {
            hash : hashName,
            name : name
          }
        };
        $.extend(slideObj, obj);
      } else { };                          //empty if no h1
    });
    console.log(slideObj);                //verify object of every slide's id info (e.g. name, hash)
  },
  createNav : function(){
    //CREATE OPENING TAGS FOR NAV
    var navStr = '<nav class="' + navClass + '"><ul>';
    navStr += '<li class="">' + '\u25C8' + '</li>';         //li for intro
    //BUILD NAV LI ELEMENTS AS STRING
    $.each(slideObj, function(i, e) {
      var itemClass = e.hash;
      var name = e.name;
      if (i > 0) {
        navStr += '<li class="'+ itemClass +'">' + name + '</li>'; //create li everything but intro
      };    
    });
    //CLOSING TAGS FOR NAV
    navStr += '<span class="count">0</span><span class="total"> / ' + (allPieces.length-1) + '</span>';
    navStr += '</ul></nav>';
    $(navStr).prependTo(navHolder);
    //NAV VISIBILITY
    $('nav.' + navClass).on({
      'mouseover': function(e){
        $(this).children().stop(true,true).slideDown();
      },
      'mouseout' : function(e){
        $(this).children().stop(true,true).slideUp();
      }
    });
    //NAV MOUSE EVENTS
    $('nav.' + navClass + ' li').on('click', function(){
      MySlideShow.jumpToSlide($(this).attr('class'));
    });
    $('li.about-me').on('click', function(){
      MySlideShow.jumpToSlide($(this).attr('class'));
    });
    //STOP MOUSOVER FLICKER
    $('nav.' + navClass + ' ul').on('mouseover', function(e){
      $(this).stop(true,true).slideDown();
    });
  },
  getSlideIndex : function(){
    //return slide number from width position
    return Math.round( Math.abs(holder.offset().left)  / allPieces.outerWidth(true) );
  },
  initSlideShow : function(){
    //SET CONTAINERS TO SLIDE, STATIC
    viewArea.css({ position : 'relative' });
    holder.css({ position : 'absolute' });
    allPieces.css({'margin-right' : pieceMargin + 'px' });
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
    //FIND AND SET SLIDE POSITION FROM NUMBER OR HASH
    if(typeof slideHash==="undefined" || slideHash===''){ slideNum=0; };
    if(typeof slideHash==="number" || slideHash===0){ slideHash = slideNum;
    } else if (typeof slideHash==="string" && slideHash!=='') {
      if(slideHash==='piece'){ slideNum=0; } else {
        $.each(slideObj, function(i, e) {
          if (slideHash===e.hash) { slideNum = i;} else {};   
        });
      }
    }
    //ACTION
    this.removeControls();
    $('nav.' + navClass + ' ul').slideUp();
    holder.animate({ left: '-' + (slideNum * allPieces.outerWidth(true)) - viewArea.offset().left + 'px' }, anim, function() {
      MySlideShow.slideEnd();
    });
  },
  /*navSlide : function(dir,moveBlock,slideWidth){
    this.removeControls();
    if(currPieceIndex<allPieces.length-1){
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
      viewArea.animate({ height : allPieces.eq(currPieceIndex).outerHeight(true) - $('header.main').outerHeight(true) +'px' }, 'fast', function(){});
    });
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
  },*/
  nextSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currPieceIndex<allPieces.length-1){
      //MOVE SHOW FORWARD FOR ALL BUT LAST PIECE
      moveBlock.animate({ left: '-='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideUp();
    } else {
      //RESET SHOW TO BEGINNING FROM LAST PIECE
      moveBlock.animate({ left: 0 - viewArea.offset().left +'px'}, anim*2.5, function() {
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideDown();
    }
  },
  prevSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currPieceIndex>0.5){
      moveBlock.animate({ left: '+='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd();
      });
      //show nav for slide 1
      //if(currPieceIndex < 1.5){ $('nav.' + navClass + ' ul').slideDown(); } else { $('nav.' + navClass + ' ul').slideUp(); }
    } else {
      moveBlock.animate({left: (slideWidth * (allPieces.length-1) * -1)-viewArea.offset().left + 'px'}, anim*2, function(){
        MySlideShow.slideEnd();
      });
      $('nav.' + navClass + ' ul').slideDown();
    }
  },
  resetCss : function(winWidth){
    // CSS CHANGES
    var paneWidth = viewArea.outerWidth(true);
    var spacing = allPieces.outerWidth(true) - allPieces.outerWidth();
    var leftSpace = viewArea.offset().left;
    var newHolderWidth = (paneWidth + spacing) * allPieces.length;

    //RESET CONTAINER WIDTHS
    allPieces.css({ width : paneWidth + 'px' });
    holder.css({
      left : (currPieceIndex * (paneWidth + spacing)* -1) - leftSpace +'px',
      width : newHolderWidth + 'px'
    });
    viewArea.css({
      'min-height' : $(window).height() - $('footer').outerHeight(true) - $('nav.' + navClass).outerHeight(true) + 'px',
      height : allPieces.eq(currPieceIndex).outerHeight(true) - $('nav.' + navClass).outerHeight(true) +'px'
    });
  },
  setHash : function(slideNum){
    var slideClass = allPieces.eq(slideNum).attr('class').replace('piece ','');
    //console.log ('slideclass ' + slideClass);
    window.location.hash = slideClass;
  },
  slideEnd : function(){
    MySlideShow.setControls();
    currPieceIndex = MySlideShow.getSlideIndex();
    this.setHash(currPieceIndex);
    $('nav.' + navClass + ' .count').html(currPieceIndex);
    viewArea.css({
      height : allPieces.eq(currPieceIndex).outerHeight(true) +'px'
    });
    //$('.'+slideHash).css('opacity', '1');
    if(currPieceIndex<0.5){ 
      backControl.css({'background-image':'none'});
    } else if(currPieceIndex>0.5) {
      backControl.css({'background-image':backBGImage});
    };
    //if ($('nav.' + navClass).is(':visible')) {console.log(true)} else {console.log(false)};
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
      MySlideShow.prevSlide(holder, allPieces.outerWidth(true) );
    });
    nextControl.on('click', function(e){
      MySlideShow.nextSlide(holder, allPieces.outerWidth(true) );
    });
    $(document).on('keydown', function(e){
      switch (e.keyCode) {
         case 37:
         MySlideShow.prevSlide(holder, allPieces.outerWidth(true) );
         return false;
         break;
         case 39:
         MySlideShow.nextSlide(holder, allPieces.outerWidth(true) );
         return false;
         break;
         case 32:
         MySlideShow.moreInfo(allPieces.eq(currPieceIndex));
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
    //$('button.jsGoNext').fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
  });
});
