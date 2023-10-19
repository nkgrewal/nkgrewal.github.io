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
( Math.abs(holder.offset().left) + eachSlide.outerWidth(true) ) / eachSlide.outerWidth(true)
*/

//VARS FOR EXTERNALE HTML CLASS DEPENDENCIES
var nextControl = $('.jsGoNext');         //slideshow next button
var backControl = $('.jsGoBack');         //slideshow back button

var viewArea = $('.slideViewer');         //frame for viewing slide
var holder = $('.allSlides');             //entire slideshow container, will animate through viewArea
var eachSlide = $('.allSlides article');     //individual slides
var portPiece = 'piece';                    //class name of portfolio articles
var portTitle = 'header h2';                //location of portfolio title under eachSlide

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
var slideCount = eachSlide.length;     //total number of slide items
var anim = 800;                           //slide speed
var pieceMargin = '60';                  //margin-right per slide, must be px


//METHODS
var MySlideShow = {
  createSlideObject : function(){
    $.each(eachSlide, function(i, e){
      var name;
      var hash;
      //CAPTURE AND CLEAN EACH SLIDES NAMES FOR ID
      if (this.className[0] !==undefined){
        if (this.className === portPiece){            //identify "piece" slide by h2 title
          name = $(this).find( portTitle ).html();   
          hash = name.replace(/[^a-z0-9\s]/gi, "").replace(/[_\s]/g, "-").toLowerCase();
        } else {                                      //identify slide by className
          hash = this.className;
          name = this.className.replace(/[_\s]/g, "-").replace(/[^a-z0-9\s]/gi, " ");
          name = name.substr(0,1).toUpperCase() + name.substr(1);
        };
      } else {                                        //assign unique id if no class available
        hash = 'slide-'+i;
        name = 'Slide '+i;
      };
      //CREATE OBJECT OF UNIQUE SLIDE NAME AND HASH FOR NAV
      if(name!==undefined){
        $(this).addClass(hash);           //add unique class name to each slide article
        var obj = {                       //create unique obj per iteration to push into slideObj
          [i] : {
            hash : hash,
            name : name
          }
        };
        $.extend(slideObj, obj);
      } else { };
    });
    //verify object of every slide's id info (e.g. name, hash)
    //slideObj[0].hash, Object.values(slideObj)[0].name
    console.log(slideObj);
  },
  createNav : function(){
    //CREATE OPENING TAGS FOR NAV
    var navStr = '<nav class="' + navClass + '"><ul>';
    //BUILD NAV LI ELEMENTS AS ADDITIVE STRING FROM SLIDE OBJECT
    $.each(slideObj, function(i, e) {
      switch(true){
        case (i==0):
          navStr += '<li class="'+ e.hash +'">' + '\u25C8' + '</li></ul>';  //li for intro, visible anchor for hideable menu
          navStr += '<ul class="navHide">';
          navToggleElement = 'nav.' + navClass + ' .navHide';               //create and define hideable menu section
          break;
        case (i > 0 && i < (slideCount-1)):
          navStr += '<li class="'+ e.hash +'">' + e.name + '</li>';         //li for rest except about (last slide)
          break;
        case (i == (slideCount-1)):
          $(aboutLi).addClass(e.hash);
          break;
        default:
          console.log('createNav issue, slideObj #' + i);
      }
    });
    //CLOSING TAGS FOR NAV AND ADD TO HOLDER
    navStr += '<span class="counter"><span class="count">0</span><span class="total"> / ' + (slideCount-2) + '</span></span>';
    navStr += '</ul></nav>';
    $(navStr).prependTo(navHolder);
    //NAV MOUSE EVENTS
    //LI CLICK EVENT BASED ON FIRST ASSIGNED CLASS NAME (HASH)
    $('nav.' + navClass + ' li, ' + aboutLi).on('click', function(){
      MySlideShow.moveSlideBlock('jump', $(this).attr('class').split(' ')[0] );
    });
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
        MySlideShow.navToggle('show');
        e.stopPropagation();
      }
    });
  },
  getSlideIndexFromPos : function(){
    //return slide number from width position
    return Math.round( Math.abs(holder.offset().left)  / eachSlide.outerWidth(true) );
  },
  initSlideShow : function(){
    //SET CONTAINERS TO SLIDE, STATIC
    viewArea.css({ position : 'relative' });
    holder.css({ position : 'absolute' });
    eachSlide.css({
      'margin-right' : pieceMargin + 'px',
      'margin-top' : pieceMargin*.55 + 'px'
    });
    //BUILD NAV AND SLIDE
    this.createSlideObject();
    this.createNav();
    this.navToggle('hide');
    this.resetCss( $(window).width() );
    this.moveSlideBlock('jump', window.location.hash.substring(1) )
    //this.jumpToSlide( window.location.hash.substring(1) );
    //HIDE ALL IMAGES BUT FIRST CHILD AND EXTRA CONTENT
    //extraDetails.hide();
    multiImgHolder.children().hide();
    multiImgHolder.children(':first-child').show();

    $('.jsHide').show();
    $('.jsGoBack.jsHide').css('opacity','0');
  },
  /*jumpToSlide : function(slideID){ 
    var num=0;
    var hash;
    //FIND AND SET SLIDE POSITION FROM NUMBER OR HASH
    if(typeof slideID==="undefined" || slideID===''){ num=0; };
    if(typeof slideID==="number" || slideID===0){ slideID = num;
    } else if (typeof slideID==="string" && slideID!=='') {
      if(slideID==='piece'){ num=0; } else {
        $.each(slideObj, function(i, e) {
          if (slideID===e.hash) { num = i; hash = e.hash} else {};   
        });
      };
    }
    //ACTION
    this.removeControls();
    //$('nav.' + navClass + ' ul').slideUp();
    holder.animate({ left: '-' + (num * eachSlide.outerWidth(true)) + 'px' }, anim, function() {
      MySlideShow.slideEnd(hash);
    });
  },
  moreInfo : function(jqArticle){
    $(jqArticle).find(extraDetails).slideToggle('fast', function(){
      viewArea.animate({ height : eachSlide.eq(currIndex).outerHeight(true) - $('header.main').outerHeight(true) +'px' }, 'fast', function(){});
    });
    $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
  },*/
  moveSlideBlock : function(direction, slideID){
    //direction options: next, back, jump
    //slideID can be index num or hash
    this.removeControls();
    var moveLength = eachSlide.outerWidth(true);
    var num=0;
    var hash;
    //DEFINE NUM AND HASH FROM SLIDEID
    if(typeof slideID==="number"){ 
      num = slideID;
    } else if (typeof slideID==="string" && slideID!=='') {
      $.each(slideObj, function(i, e) {
        if (slideID===e.hash) { num = i; hash = e.hash} else {};   
      });
    } else {console.log('issue with slideID input ' + slideID)};
    console.log('defined var ' + num, hash);

    switch(direction){
      case 'next':
        if(currIndex < slideCount-1){
          //MOVE SHOW FORWARD FOR ALL BUT LAST SLIDE
          holder.animate({ left: '-='+ moveLength + 'px' }, anim, function() {
            currIndex++;
            MySlideShow.slideEnd(currIndex);
          });
        } else {
          //LOOP SHOW TO BEGINNING FROM LAST SLIDE
          holder.animate({ left: 0 + 'px'}, anim*2.5, function() {
            currIndex = 0;
            MySlideShow.slideEnd(currIndex);
          });
        }
        break;
      case 'back':
        if(currIndex>0.5){
          //MOVE BACK FOR ALL BUT FIRST SLIDE
          holder.animate({ left: '+='+ moveLength + 'px' }, anim, function() {
            currIndex--;
            MySlideShow.slideEnd(currIndex);
          });
          if(currIndex < 1.5){ this.navToggle('show'); } else { this.navToggle('hide'); }
        } else {
          //LOOP SHOW TO END FROM FIRST SLIDE
          holder.animate({left: (moveLength * (slideCount-1) * -1) + 'px'}, anim*2, function(){
            currIndex = slideCount-1;
            MySlideShow.slideEnd(currIndex);
          });
        }
        break;
      case 'jump':
        currIndex = num;
        holder.animate({ left: '-' + (currIndex * eachSlide.outerWidth(true)) + 'px' }, anim, function() {
          MySlideShow.slideEnd(currIndex);
        });
        break
      default:
        console.log('issue with direction input ' + direction);
    }
  },
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
  /*nextSlide : function(moveBlock,slideWidth,slideHash){
    this.removeControls();
    if(currIndex<slideCount-1){
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
  },
  prevSlide : function(moveBlock,slideWidth,slideHash){
    this.removeControls();
    if(currIndex>0.5){
      moveBlock.animate({ left: '+='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideEnd(currIndex);
      });
      if(currIndex < 1.5){ this.navToggle('hide'); } else { this.navToggle('show'); }
    } else {
      moveBlock.animate({left: (slideWidth * (slideCount-1) * -1) + 'px'}, anim*2, function(){
        MySlideShow.slideEnd(currIndex);
      });
    }
  },*/
  resetCss : function(winWidth){
    // CSS CHANGES
    var paneWidth = viewArea.outerWidth();
    var spacing = eachSlide.outerWidth(true) - eachSlide.outerWidth();
    var newHolderWidth = (paneWidth + spacing) * slideCount;

    //RESET CONTAINER WIDTHS
    eachSlide.css({ 
      float: 'left',
      width : paneWidth + 'px' 
    });
    holder.css({
      left : (currIndex * (paneWidth + spacing)* -1) +'px',
      width : newHolderWidth + 'px'
    });
    viewArea.css({
      'min-height' : $(window).height() - $('footer').outerHeight(true) + 'px',
      height : eachSlide.eq(currIndex).outerHeight(true)
    });
  },
  setWindowHash : function(slideNum){
    var slideClass = eachSlide.eq(slideNum).attr('class').replace('piece ','');
    window.location.hash = slideClass;
    navHolder.find('.selected').removeClass('selected');
    navHolder.find('.' + slideClass).addClass('selected');
  },
  slideEnd : function(slideNum){
    this.setControls();
    this.setWindowHash(currIndex);
    //currIndex = this.getSlideIndexFromPos();
    //console.log(currIndex);
    //hash = slideHash;

    /*//eachSlide.css('opacity', '.6');
    $.each(slideObj, function(i, e) {
      if (i==currIndex) {
        //$('article.'+e.hash).animate({opacity: 1}, 400);
        console.log('jj'+hash); 
      } else if (hash==e.hash){
        //$('article.'+hash).animate({opacity: 1}, 400);
        console.log('kk'+currIndex); 
      } else { }   
    });*/
    viewArea.css({
      height : eachSlide.eq(currIndex).outerHeight(true) +'px'
    });
    //BACKBUTTON REFINEMENT
    if(currIndex == 0){ $(backControl).css("opacity", "0"); }
      else { $(backControl).fadeTo( "slow" , 1, function() {});
    };
    //NAV COUNTER
    /*$('nav.' + navClass + ' .count').html(currIndex);
    if (currIndex===0 || currIndex > (slideCount-2) ){ 
      $('nav.' + navClass + ' span').hide(); } else { 
      $('nav.' + navClass + ' span').show();
    };*/
  },
  setControls : function(){
    //EVENT LISTENERS
    backControl.on('click', function(e){
      MySlideShow.moveSlideBlock('back', currIndex);
    });
    nextControl.on('click', function(e){
      MySlideShow.moveSlideBlock('next', currIndex);
    });
    $(document).on('keydown', function(e){
      switch (e.keyCode) {
        case 37:
          MySlideShow.moveSlideBlock('back', currIndex);
          //MySlideShow.prevSlide(holder, eachSlide.outerWidth(true), slideHash );
          return false;
          break;
        case 39:
          MySlideShow.moveSlideBlock('next', currIndex);
          //MySlideShow.nextSlide(holder, eachSlide.outerWidth(true), slideHash );
          return false;
          break;
        case 32:
          MySlideShow.moreInfo(eachSlide.eq(currIndex));
          return false;
          break;
      }
    });
    //show subimg for each section in piece
    iconHolder.children().on('mouseover', function(){
      var linkNum = $(this).index();
      $(this).parents('article').find(multiImgHolder).children().hide();
      $(this).parents('article').find(multiImgHolder).children().eq(linkNum).show();
    });
    /*detailsBtn.on('click', function(e){
      MySlideShow.moreInfo($(this).parents('article'));
    });*/
  },
  removeControls : function(){
    nextControl.off('click');
    backControl.off('click');
    $(document).off('keydown');
    iconHolder.children().off('mouseover');
    //detailsBtn.off('click');
  }
}

//BACK BUTTON AND RESIZE
$(window).on({
  'hashchange': function(e){
    MySlideShow.moveSlideBlock('jump', window.location.hash.substring(1) );
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
