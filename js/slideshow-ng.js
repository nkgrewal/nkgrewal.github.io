/*
options to pass through :
  - slide container name, controls(back, forward, more info, keystrokes), navigation, slidePane, sections (imageCase, details)
  - 

- resize holder
- get direct children of holder
- hide all but first child in multi img

set per assumptions:
page wrapped in "container" class
elements as : "ng-slides" > div > article > header > "imgCase"
article class name "piece" for portfolio pieces
has an "imgCase" class for images container
has "goBack" and "goNext" class btns


SLIDE BY HOLDER POSITION
( Math.abs(holder.offset().left) + pfPiece.outerWidth(true) ) / pfPiece.outerWidth(true)
*/
var preload = $('.preloader');
var navHolder = $('.container');
var slidePane = $('.ng-slidePane');

var holder;
var articles = $('.ng-slidePane article');
var pfPiece = $('.ng-slidePane .piece');

var nextControl = $('.ng-goNext');
var backControl = $('.ng-goBack');

var anim = 800;
var currSlide = 0;



var MySlideShow = {
  createNav : function(){
    var navStr = '<nav class="slidesNav"><ul>';

    $.each(pfPiece, function(index, thisBlock){
      var name = $(this).find('h2:first-of-type').html();
      if(name!==null){
        var newClass = name.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-').toLowerCase(); //clean string
        $(this).addClass(newClass);                                   //add class name to portfolio piece
        navStr += '<li class="'+ newClass +'">' + name + '</li>';     //create li for nav w/ class name
      } else {
        navStr +='<li class="blank"></li>';
      }
    });
    navStr += '<span class="count">0</span><span class="total"> / ' + (pfPiece.length-1) + '</span>';
    navStr += '</ul></nav>';
    
    $(navStr).prependTo(navHolder);

    //set icon hovers
    var imgParent = $('.ng-slidePane .imgCase');
    var icons = $('.ng-slidePane .icons').children();
    var img = $('.ng-slidePane .mainImg').children('img');

    img.hide();
    img.eq(0).show();
    icons.on('click mouseover', function(){
      var linkNum = $(this).index();
      $(this).parents(imgParent).find(img).hide();
      $(this).parents(imgParent).find(img).eq(linkNum).show();
    });  
  },
  getSlideNum : function(){
    return Math.round( Math.abs(holder.offset().left) / articles.outerWidth(true) );
  },
  insertHolder : function(){
    slidePane.wrapInner( '<div class="holder floatBox"></div>' );
    holder = $('.holder');
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
    holder.animate({ left: '-' + (slideNum * articles.outerWidth(true)) - slidePane.offset().left + 'px' }, anim, function() {
      MySlideShow.slideFinish(); //finish animation and reset controls etc
    });
  },
  nextSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currSlide<articles.length-1){
      moveBlock.animate({ left: '-='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideFinish();
      });
    } else {
      moveBlock.animate({ left: 0 - slidePane.offset().left +'px'}, anim*2, function() {
        MySlideShow.slideFinish();
      });
    }
  },
  prevSlide : function(moveBlock,slideWidth){
    this.removeControls();
    if(currSlide>0.5){
      moveBlock.animate({ left: '+='+ slideWidth + 'px' }, anim, function() {
        MySlideShow.slideFinish();
      });
      //if(currSlide < 1.5){ $('nav.slideNav ul').slideDown(); } else { $('nav.slideNav ul').slideUp(); }
    } else {
      moveBlock.animate({left: (slideWidth * (articles.length-1) * -1)-slidePane.offset().left + 'px'}, anim*2, function(){
        MySlideShow.slideFinish();
      });
    }
  },
  removeControls : function(){
    nextControl.off('click');
    backControl.off('click');
    $(document).off('keydown');
  },
  setControls : function(){
    //EVENT LISTENERS
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
  setCss : function(winWidth){
    // adjust to window
    var spacing = articles.outerWidth(true)-articles.width();
    var leftSpace = slidePane.offset().left;
    
    articles.css({ width : winWidth - spacing + 'px' });
    holder.css({
      left : currSlide * winWidth * -1 - leftSpace +'px',
      width : (winWidth + spacing) * articles.length + 'px'
    });
  },
  setHash : function(slideNum){
    slideClass = articles.eq(slideNum).attr('class').replace('piece ','');
    window.location.hash = slideClass;
  },
  slideFinish : function(){
    MySlideShow.setControls();
    currSlide = MySlideShow.getSlideNum();
    this.setHash(currSlide);
  },
  initSlideShow : function(){
    this.createNav();
    this.insertHolder();
    this.setCss($(window).width());

    this.jumpToSlide(window.location.hash.substring(1));

    //HIDE ALL IMAGES BUT FIRST CHILD AND EXTRA CONTENT
    

    $('.jsHide').show();
  },
}

//WINDOW RESIZE
$(window).resize( function(){
  var winWidth = $(this).width();
  MySlideShow.setCss(winWidth);
});

$(document).ready(function(){
  MySlideShow.initSlideShow();
});

$(window).ready(function() {
  preload.fadeOut(900, function() {
    //$('body').css('overflow','visible');
    $(this).remove();
  });
});
