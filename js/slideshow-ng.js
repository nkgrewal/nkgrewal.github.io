/*

to-do:
- fix nav slidedown for first and last sides
- mobile? scroll down and show nav
- mobile friendly layout + swiping

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

var navHolder = $('footer.scaffold .fascia');    //where to place slide nav
var aboutLi = 'footer .about li:first-child';   //add slideshow link outside nav

//var extraDetails = $('div.subDetails');
//var detailsBtn = $('a.detailsBtn');

//VARS FOR INTERNAL REF
var navClass = 'slideNav';                 //class name of nav element
var navToggleElement = '';                //empty var set in nav creation
var slideObj = {};                        //empty object that will hold slide identifying info
var currIndex = 0;                   //start from 0 on load
var allPiecesCount = allPieces.length;     //total number of slide items
var anim = 800;                           //slide speed
var pieceMargin = '60';                  //margin-right per slide, must be px


//METHODS
var MySlideShow = {
  createSlideObject : function(){
    $.each(allPieces, function(i, e){
      var name;
      var hash;
      if (this.className !=='undefined'){
        //CAPTURE AND CLEAN EACH SLIDES NAMES FOR ID
        if (this.className === portPiece){           //identify "piece" slide by h2 title
          name = $(this).find( portTitle ).html();   
          hash = name.replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
        }  
        else {                                    //identify slide by className
          hash = this.className; 
          name = this.className; 
          name = name.replace(/[_\s]/g, "-").replace(/[^a-z0-9\s]/gi, " ")
          name = name.substr(0,1).toUpperCase()+name.substr(1);
        };
      } else {};
      //CREATE OBJECT OF UNIQUE SLIDE NAME AND HASH FOR NAV
      if(name!==undefined){
        $(this).addClass(hash);       //add unique class name to each slide article
        var obj = {                       //create unique obj per iteration to push into slideObj
          [i] : {
            hash : hash,
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
    //BUILD NAV LI ELEMENTS AS STRING
    $.each(slideObj, function(i, e) {
      switch(true){
        case (i==0):
          navStr += '<li class="'+ e.hash +'">' + '\u25C8' + '</li></ul>';  //li for intro
          navStr += '<ul class="navHide">';
          break;
        case (i > 0 && i < (allPiecesCount-1)):
          navStr += '<li class="'+ e.hash +'">' + e.name + '</li>';    //li for rest except about
          break;
        case (i == (allPiecesCount-1)):
          $(aboutLi).addClass(e.hash);
          break;
        default:
          console.log(i);
      }
    });
    //CLOSING TAGS FOR NAV AND ADD TO HOLDER
    navStr += '<span class="counter"><span class="count">0</span><span class="total"> / ' + (allPiecesCount-2) + '</span></span>';
    navStr += '</ul></nav>';
    navToggleElement = 'nav.' + navClass + ' .navHide';
    $(navStr).prependTo(navHolder);
    //NAVIGATION LINKS
    $('nav.' + navClass + ' li, ' + aboutLi).on('click', function(){
      var cleanName = $(this).attr('class').split(' ')[0];
      MySlideShow.jumpToSlide(cleanName);
    });
    //NAV MOUSE EVENTS
    //NAV VISIBILITY
    $(navHolder).on({
      'mouseenter': function(e){
        MySlideShow.navToggle('show');
        e.stopPropagation();
      },
      'mouseleave' : function(e){
        MySlideShow.navToggle('hide');
        e.stopPropagation();
      },
      'click': function(e){
        MySlideShow.navToggle('toggle');
        e.stopPropagation();
      }
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
    allPieces.css({
      'margin-right' : pieceMargin + 'px',
      'margin-top' : pieceMargin*.55 + 'px'
    });
    //BUILD NAV AND SLIDE
    this.createSlideObject();
    this.createNav();
    this.navToggle('hide');
    this.resetCss( $(window).width() );
    this.jumpToSlide( window.location.hash.substring(1) );
    //HIDE ALL IMAGES BUT FIRST CHILD AND EXTRA CONTENT
    //extraDetails.hide();
    multiImgHolder.children().hide();
    multiImgHolder.children(':first-child').show();

    $('.jsHide').show();
    $('.jsGoBack.jsHide').css('opacity','0');
  },
  jumpToSlide : function(slideHash){ 
    var num=0;
    var hash;
    //FIND AND SET SLIDE POSITION FROM NUMBER OR HASH
    if(typeof slideHash==="undefined" || slideHash===''){ num=0; };
    if(typeof slideHash==="number" || slideHash===0){ slideHash = num;
    } else if (typeof slideHash==="string" && slideHash!=='') {
      if(slideHash==='piece'){ num=0; } else {
        $.each(slideObj, function(i, e) {
          if (slideHash===e.hash) { num = i; hash = e.hash} else {};   
        });
      };
    }
    //ACTION
    this.removeControls();
    //$('nav.' + navClass + ' ul').slideUp();
    holder.animate({ left: '-' + (num * allPieces.outerWidth(true)) + 'px' }, anim, function() {
      MySlideShow.slideEnd(hash);
    });
  },
  /*moreInfo : function(jqArticle){
    $(jqArticle).find(extraDetails).slideToggle('fast', function(){
      viewArea.animate({ height : allPieces.eq(currIndex).outerHeight(true) - $('header.main').outerHeight(true) +'px' }, 'fast', function(){});
    });
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
  },*/
  navToggle : function(toggleState, speed){
    var s1;
    var s2;
    if (speed === null || speed === undefined ){
      s1 = 200; s2 = s1*2; 
    } else { s1 = speed; s2 = speed; };
    if (toggleState==='show' || toggleState==='hide'){
      if (toggleState==='show') {
        $(navToggleElement).fadeIn(s1);
      } else {
        $(navToggleElement).fadeOut(s2);
      }
    } else if(toggleState==='toggle'){
      $(navToggleElement).slideToggle(s2);
    } else { console.log('use only "show", "hide", or "toggle" for navToggle functions first property');}
  },
  nextSlide : function(moveBlock,slideWidth,slideHash){
    this.removeControls();
    if(currIndex<allPiecesCount-1){
      //MOVE SHOW FORWARD FOR ALL BUT LAST PIECE
      moveBlock.animate({ left: '-='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd(currIndex);
      });
      //$('nav.' + navClass + ' ul').slideUp();
    } else {
      //RESET SHOW TO BEGINNING FROM LAST PIECE
      moveBlock.animate({ left: 0 + 'px'}, anim*2.5, function() {
        MySlideShow.slideEnd(currIndex);
      });
    }
    //this.navToggle('show');
  },
  prevSlide : function(moveBlock,slideWidth,slideHash){
    this.removeControls();
    if(currIndex>0.5){
      moveBlock.animate({ left: '+='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd(currIndex);
      });
      if(currIndex < 1.5){ this.navToggle('hide'); } else { this.navToggle('show'); }
    } else {
      moveBlock.animate({left: (slideWidth * (allPiecesCount-1) * -1) + 'px'}, anim*2, function(){
        MySlideShow.slideEnd(currIndex);
      });
    }
    //this.navToggle('show');
  },
  resetCss : function(winWidth){
    // CSS CHANGES
    var paneWidth = viewArea.outerWidth();
    var spacing = allPieces.outerWidth(true) - allPieces.outerWidth();
    var newHolderWidth = (paneWidth + spacing) * allPiecesCount;

    //RESET CONTAINER WIDTHS
    allPieces.css({ 
      float: 'left',
      width : paneWidth + 'px' 
    });
    holder.css({
      left : (currIndex * (paneWidth + spacing)* -1) +'px',
      width : newHolderWidth + 'px'
    });
    viewArea.css({
      'min-height' : $(window).height() - $('footer').outerHeight(true) + 'px',
      height : allPieces.eq(currIndex).outerHeight(true)
    });
  },
  setHash : function(slideNum){
    var slideClass = allPieces.eq(slideNum).attr('class').replace('piece ','');
    window.location.hash = slideClass;
    navHolder.find('.selected').removeClass('selected');
    navHolder.find('.' + slideClass).addClass('selected');
  },
  slideEnd : function(slideHash){
    this.setControls(slideHash);
    currIndex = this.getSlideIndex();
    hash = slideHash;
    this.setHash(currIndex);

    this.navToggle('hide', 900);
    allPieces.css('opacity', '.6');
    $.each(slideObj, function(i, e) {
      console.log(i, currIndex);
      if (i==currIndex) {
        $('article.'+e.hash).animate({opacity: 1}, 400);
        console.log('jj'+hash); 
      } else if (hash==e.hash){
        //$('article.'+hash).animate({opacity: 1}, 400);
        console.log('kk'+currIndex); 
      } else { }   
    });
    viewArea.css({
      height : allPieces.eq(currIndex).outerHeight(true) +'px'
    });
    //BACKBUTTON REFINEMENT
    if(currIndex == 0){ $(backControl).css("opacity", "0"); }
      else { $(backControl).fadeTo( "slow" , 1, function() {});
    };
    //NAV COUNTER
    $('nav.' + navClass + ' .count').html(currIndex);
    if (currIndex===0 || currIndex > (allPiecesCount-2) ){ 
      $('nav.' + navClass + ' span').hide(); } else { 
      $('nav.' + navClass + ' span').show();
    };
  },
  setControls : function(slideHash){
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
      MySlideShow.prevSlide(holder, allPieces.outerWidth(true), slideHash );
    });
    nextControl.on('click', function(e){
      MySlideShow.nextSlide(holder, allPieces.outerWidth(true), slideHash );
    });
    $(document).on('keydown', function(e){
      switch (e.keyCode) {
         case 37:
         MySlideShow.prevSlide(holder, allPieces.outerWidth(true), slideHash );
         return false;
         break;
         case 39:
         MySlideShow.nextSlide(holder, allPieces.outerWidth(true), slideHash );
         return false;
         break;
         case 32:
         MySlideShow.moreInfo(allPieces.eq(currIndex));
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

//BACK BUTTON AND RESIZE
$(window).on({
  'hashchange': function(e){
    MySlideShow.jumpToSlide( window.location.hash.substring(1) );
  },
  'resize': function(){
    MySlideShow.resetCss( $(this).width() );
  }
});

//KICK IT
$(document).ready(function(){
  MySlideShow.initSlideShow();
});

//PRELOADER
$(window).ready(function() {
  $('.curtainLoad').fadeOut(900, function() {
    $('body').css('overflow','visible');
    $(this).remove();
    //$('button.jsGoNext').fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
  });
});
