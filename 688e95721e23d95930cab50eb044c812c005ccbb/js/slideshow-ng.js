/*

to-do:
-edit and compress video
-add case studies
-finesse mobile breakpoint js

options to pass through :
  - allSlides name
  - controls(back, forward, more info, keystrokes)
  - navigation
  - slide viewport - div
  - slideshow content slideHolder - section
  - slide content animations (imageCase, details)

slideshow div structure:
has back fwd btn
has a slide view area window
has a holding container for all slides
has a place to insert slide show nav

in slide container structure:
each "slide" is an article without a set width
each article has a class
all portfolio articles are class named "piece" and have an h2 title

*/

//VARS FOR EXTERNAL NAMES
var mobileNavTitle = 'Projects';

//VARS FOR EXTERNAL, HTML CLASS DEPENDENCIES
var mobileMQ = '(max-width: 620px)';      //mobile breakpoint

var nextControl = $('.jsGoNext');         //slideshow next button
var backControl = $('.jsGoBack');         //slideshow back button
var viewArea = $('.slideViewer');         //frame for viewing slide

var slideHolder = $('.allSlides');             //entire slideshow container, will animate through viewArea
var eachSlide = $('.allSlides article');     //individual slides
var portPiece = 'piece';                    //class name of portfolio articles
var portTitle = 'header h2';                //location of portfolio title under eachSlide

var slideSpacing = parseInt(slideHolder.css('gap'));   //spacing between slides, must be hardcoded as px, updated in resetCss

var navHolder = $('footer.scaffold .fascia');    //where to place slide nav
var aboutLi = 'footer .about li:first-child';   //add slideshow link outside nav

var imgHolder = $('.imgCase');                //slide type - multi image
var imgHolderButtons = $('.imgButtons');       //slide type - multi image icons

var scrollHint = $('.scrollHint');            //hint to scroll from splash



//VARS FOR INTERNAL REF
const mobileDevice = window.matchMedia(mobileMQ);

var navClass = 'slideNav';                      //class name of nav element
var navToggleElement = 'nav .navHide';          //classname of hideable nav
const slideMap = new Map();                     //empty object that will hold slide identifying info
var currIndex = 0;                              //start from 0 on load, only changes under moveSlideBlock
var anim = 450;                                 //slide speed
var pieceMargin = '60';                         //margin-right per slide, must be px


//METHODS
var MySlideShow = {
  createSlideMap : function(){
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
      //CREATE MAP OF UNIQUE SLIDE NAME AND HASH FOR NAV
      if(name!==undefined){
        $(this).addClass(hash);           //add unique class name to each slide article
        slideMap.set(i, {hash, name});         //key, value = name, hash
      } else { };
    });
    //verify object of every slide's id info (e.g. name, hash)
    console.log( slideMap, slideMap.get(0).hash, slideMap.keys().next().value );
    //console.log( 'slideMap Obj check i=2 ' + Array.from(slideMap.keys())[2], Array.from(slideMap.values())[2] );
  },
  createNav : function() {
    $(backControl).animate({opacity: 0}, anim/2 );

    //CREATE OPENING TAGS FOR NAV
    var navStr = '<ul class="m-only"><li>' + mobileNavTitle + '</li></ul><nav class="' + navClass + '" role="menu">';
    //BUILD NAV LI ELEMENTS AS ADDITIVE STRING FROM SLIDE OBJECT
    slideMap.forEach( (info, i) => {
      switch(true){
        case (i==0): 
          navStr += '<ul class="firstSlide"><li class="'+ slideMap.get(i).hash +'" role="menuitem" aria-label="Back to first slide">' + '\u2756' + '</li></ul>';  //li for intro, visible anchor for hideable menu
          navStr += '<ul class="navHide">';
          break;
        case (i > 0 && i < (slideMap.size-1)):
          navStr += '<li class="'+ slideMap.get(i).hash +'">' + slideMap.get(i).name + '</li>';         //li for rest except about (last slide)
          break;
        case (i == (slideMap.size-1)):
          $(aboutLi).addClass(slideMap.get(i).hash);
          break;
        default:
          console.log('createNav issue, slideMap #' + i);
      }
      i++;
    });
    //CLOSING TAGS FOR NAV AND ADD TO slideHolder
    navStr += '<span class="counter"><span class="count">0</span><span class="total"> / ' + (slideMap.size-2) + '</span></span>';
    navStr += '</ul></nav>';
    $(navStr).prependTo(navHolder);
    //NAV MOUSE EVENTS
    //LI CLICK EVENT BASED ON FIRST ASSIGNED CLASS NAME (HASH)
    $('nav.' + navClass + ' li, ' + aboutLi).on('click', function(){
      MySlideShow.moveSlideBlock('jump', $(this).attr('class').split(' ')[0] );
    });
    //NAV VISIBILITY MOBILE THEN DESKTOP
    this.navToggle('hide');
    scrollHint.animate({opacity:0});
    mobileDevice.addListener(handleDeviceChange);
    function handleDeviceChange(e) {
      if (e.matches) {
        console.log(e + " Mobile");
        navHolder.off('mouseenter mouseleave click');
        $('nav .firstSlide').addClass('navHide');
        MySlideShow.navToggle('hide');
        $(navHolder).find('ul.m-only').on({
          'click': function(e){
            MySlideShow.navToggle('toggle');
            e.stopPropagation();
          },
          'tap': function(e){
            MySlideShow.navToggle('toggle');
            e.stopPropagation();
          }
        });
      } else {
        console.log(e + " Desktop");
        navHolder.find('ul.m-only').off('click tap');
        $('nav .firstSlide').removeClass('navHide');
        $('nav .firstSlide').show();
        //DESKTOP above fold
        if( window.pageYOffset < 150 ){
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
        } else {
          $(navHolder).on({
            'mouseleave' : function(e){
              MySlideShow.navToggle('show');
              e.stopPropagation();
            }
          });
        }
      };
    };
    handleDeviceChange(mobileDevice);
  },
  getSlideIndex : function(keyword){
    if (keyword==='position'){
      //return slide number from width position
      return Math.round( Math.abs(slideHolder.offset().left)  / eachSlide.outerWidth(true) );
    } else {
      //return slide number from hash
      var slideNum = 0;
      slideMap.forEach((info, i) => {
        if ( keyword===slideMap.get(i).hash ) { 
          slideNum = i;
        } else { };
      });
      return Number(slideNum);
    }
  },
  initSlideShow : function(){
    //SET CONTAINERS TO SLIDE, STATIC
    viewArea.parent().addClass('jsSlideShow');
    navHolder.addClass('jsNav');
    slideHolder.css({ position : 'relative' });
    //BUILD NAV AND SLIDE
    this.createSlideMap();
    this.createNav();
    this.resetCss( $(window).width(), $(window).height() );
    this.moveSlideBlock('jump', window.location.hash.substring(1) );
    this.showSubImgs(currIndex);

    $('.jsShow').show();
    $('.jsHide').hide();
    $('.jsGoBack.jsShow').css('opacity','0');
  },
  moveSlideBlock : function(direction, slideID){
    //direction options: next, back, jump
    //slideID can be index num or hash
    //reset height and show menu
    $("html, body").animate({ scrollTop: "0" }, 300);

    this.removeControls();
    var moveLength = eachSlide.outerWidth(true) + slideSpacing;
    //CHANGE SLIDEID FROM HASH TO INDEX
    if (typeof slideID === 'string'){ currIndex = this.getSlideIndex(slideID); };

    //MOVE SLIDES AND UPDATE CURRRENT INDEX
    switch(direction){
      case 'next':
          if(currIndex < slideMap.size-1){
            //MOVE SHOW FORWARD FOR ALL BUT LAST SLIDE
            slideHolder.animate({ left: '-='+ moveLength + 'px' }, anim, function() {
              currIndex++;
              MySlideShow.slideEnd(currIndex);
            });
          } else {
            //LOOP SHOW TO BEGINNING FROM LAST SLIDE
            slideHolder.animate({ left: 0 + 'px'}, anim*2.5, function() {
              currIndex = 0;
              MySlideShow.slideEnd(currIndex);
            });
          }
        break;
      case 'back':
          if(currIndex > 0.5){
            //MOVE BACK FOR ALL BUT FIRST SLIDE
            slideHolder.animate({ left: '+='+ moveLength + 'px' }, anim, function() {
              currIndex--;
              MySlideShow.slideEnd(currIndex);
            });
            if(currIndex < 1){ this.navToggle('show'); } else { this.navToggle('hide'); }
          } else {
            //LOOP SHOW TO END FROM FIRST SLIDE
            currIndex = slideMap.size-1;
            slideHolder.animate({left: (-1 * moveLength * currIndex) + 'px'}, anim*2, function(){
              MySlideShow.slideEnd(currIndex);
            });
          }
        break;
      case 'jump':
          //MOVE TO SLIDE ACCORDING TO WINDOW HASH
          slideHolder.animate({ left: '-' + (currIndex * moveLength) + 'px' }, anim, function() {
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
      $(navToggleElement).slideToggle(s2, function() {
        if( $(this).is(":visible")==true ) {
          $(navHolder).find('ul.m-only').addClass('selected');
        } else{
          $(navHolder).find('ul.m-only').removeClass('selected');
        }
      });
    }
    else { console.log('use only "show", "hide", or "toggle" for navToggle functions first property');}
  },
  resetCss : function(winWidth, winHeight){
    // CSS CHANGES
    var paneWidth = viewArea.outerWidth();
    var newslideHolderWidth = (paneWidth * slideMap.size) + ( slideSpacing * (slideMap.size -1) );
    var heightAdjustor = $('.' + navClass + ' ul:first-child').outerHeight(true);
    slideSpacing = parseInt(slideHolder.css('gap'));

    //RESET CONTAINER WIDTHS
    eachSlide.css({ 
      width : paneWidth + 'px' 
    });
    slideHolder.css({
      left : ( currIndex * (paneWidth + slideSpacing) *-1 ) +'px',
      width : newslideHolderWidth + 'px'
    });
    viewArea.css({
      'min-height' : winHeight - heightAdjustor -3 + 'px', //prevents height from being too short on little content
      height : eachSlide.eq(currIndex).outerHeight(true) + 'px'
    });
    if ( (winHeight - heightAdjustor) > eachSlide.eq(currIndex).outerHeight(true) ) {
      eachSlide.eq(currIndex).css({ 'min-height' : (winHeight - heightAdjustor -3) +'px' });
    } else { eachSlide.eq(currIndex).css({ 'min-height' : '90vh' }); };
  },
  setWindowHash : function(slideNum){
    var slideClass = slideMap.get(slideNum).hash;
    //SET WINDOW HASH
    window.location.hash = slideClass;
    //SET ACTIVE NAV
    navHolder.find('.selected').removeClass('selected');
    navHolder.find('.' + slideClass).addClass('selected');
    //SET ACTIVE SLIDE
    slideHolder.find('.piece').removeClass('selected');
    eachSlide.eq(slideNum).addClass('selected');
  },
  slideEnd : function(slideNum){
    //BACKBUTTON REFINEMENT
    if(slideNum == 0){ $(backControl).animate({opacity: 0}, anim/2 ); }
      else { $(backControl).removeAttr("style"); }; 
    //SCROLL HINT REFINEMENT
    if( slideNum == 1) { 
      scrollHint.animate({opacity:1}).delay(800).animate({ top : '-=1em'}, 400).animate({ top : '+=1em'}, 400).animate({ top : '-=1em'}, 400).animate({ top : '+=1em'}, 400);
      scrollHint.on('click', function(e){ $('html, body').animate({ scrollTop: 650 }); });
    } else if ( slideNum == 0 || slideNum == (slideMap.size-1) ) { 
      scrollHint.animate({opacity:0});
      scrollHint.off('click');
    } else { 
      scrollHint.animate({opacity:1}); 
      scrollHint.on('click', function(e){ $('html, body').animate({ scrollTop: 650 }); });
    };

    var heightAdjustor = $('.' + navClass + ' ul:first-child').outerHeight(true);
    this.navToggle("hide");
    this.setControls(slideNum);
    this.setWindowHash(slideNum);

    eachSlide.css('opacity', '.6');
    eachSlide.eq(slideNum).animate({opacity: 1}, anim/2 );
    viewArea.css({ height : eachSlide.eq(slideNum).outerHeight(true) +'px' });

    //NAV COUNTER
    /*$('nav.' + navClass + ' .count').html(currIndex);
    if (currIndex===0 || currIndex > (slideMap.size-2) ){ 
      $('nav.' + navClass + ' span').hide(); } else { 
      $('nav.' + navClass + ' span').show();
    };*/
  },
  setMobileSwipe : function (elm, callback) {
    let touchStartX, touchStartY, touchStartTime;
    elm.on('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = new Date();
    });
    elm.on('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = new Date();

      const distanceX = touchEndX - touchStartX;
      const distanceY = Math.abs(touchEndY - touchStartY);
      const duration = touchEndTime - touchStartTime;

      const speed = Math.abs(distanceX) / duration;

      if (Math.abs(distanceX) > 30 && duration < 500 && Math.abs(distanceY) < 50) {
        if (distanceX > 0) {
          callback('right', speed, distanceX, distanceY);
        } else {
          callback('left', speed, distanceX, distanceY);
        }
      }
    });
  },
  setControls : function(slideNum){
    //EVENT LISTENERS
    backControl.on('click', function(e){
      MySlideShow.moveSlideBlock('back', slideNum);
    });
    nextControl.on('click', function(e){
      MySlideShow.moveSlideBlock('next', slideNum);
    });
    //MOBILE SWIPE
    this.setMobileSwipe (eachSlide, (direction, speed, distanceX, distanceY) => {
      //console.log ( direction, speed, distanceX, distanceY );
      if ( speed >= 0.55 ){
        switch (direction) {
        case 'right':
          MySlideShow.moveSlideBlock('back', slideNum);
          return false;
          break;
        case 'left':
          MySlideShow.moveSlideBlock('next', slideNum);
          return false;
          break;
        }
      } else { };
    });

    $(document).on('keydown', function(e){
      switch (e.keyCode) {
        case 37:
          MySlideShow.moveSlideBlock('back', slideNum);
          return false;
          break;
        case 39:
          MySlideShow.moveSlideBlock('next', slideNum);
          return false;
          break;
        case 32:
          MySlideShow.moreInfo(eachSlide.eq(slideNum));
          return false;
          break;
      }
    });
  },
  removeControls : function(){
    nextControl.off('click');
    backControl.off('click');
    eachSlide.off('touchstart');
    $(document).off('keydown');
  },
  //IMG CLICK
  showSubImgs: function(slideNum) {
    //HIDE ALL IMAGES BUT FIRST CHILD AND EXTRA CONTENT
    imgHolder.children().hide();
    imgHolder.children(':first-child').show();
    imgHolderButtons.find('button').on('click', function() {
        var btnIndex = $(this).index();
        $(this).addClass('selected');
        $(this).siblings().removeClass('selected');
        eachSlide.eq(currIndex).children('.imgCase').children().hide();
        eachSlide.eq(currIndex).children('.imgCase').children().eq(btnIndex).show();
    });
  }
}

//BACK BUTTON AND RESIZE
$(window).on({
  /*'hashchange': function(e){
    MySlideShow.slideJump( window.location.hash.substring(1) );
  },*/
  'click': function(){
    //hide menu desktop above fold
    if( this.innerWidth > 900 && window.pageYOffset < 150 ) { 
      MySlideShow.navToggle('hide');
      event.stopPropagation;
    }
    else if( this.innerWidth > 900) { 
      MySlideShow.navToggle('show');
      event.stopPropagation;
    };
  },
  'resize': function(){
    MySlideShow.resetCss( $(this).width(), $(this).height() );
  },
  'scroll': function(){
    //hide scroll hint
    if( this.pageYOffset > 20 ){
      scrollHint.animate({opacity:0});
      scrollHint.off('click');
    }
    //show menu on desktop if scrolled down
    if( this.innerWidth > 900 && this.pageYOffset > 150 ){
      MySlideShow.navToggle('show');
      event.stopPropagation;
    } else { MySlideShow.navToggle('hide'); event.stopPropagation; }
  }
});

//KICK IT
$(document).ready(function(){
  MySlideShow.initSlideShow();
});


//PRELOADER
$(window).ready(function() {
  $('.curtainLoad').fadeOut(anim*1.2, function() {
    $('body').css('overflow','visible');
    $(this).remove();
    $('.jsNav .jsGoNext, button.slideNext.jsGoNext').delay(1200).fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
  });
});
