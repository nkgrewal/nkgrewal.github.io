(function($) {
  'use strict';

  // Slideshow class
  function QuoteSlideshow($article) {
    this.$article = $article;
    this.$wrapper = $article.find('.quote');
    this.$track = $article.find('.quoteTrack');
    this.$slides = $article.find('.quoteSlide');
    this.slideCount = this.$slides.length;
    this.currentSlide = 0;
    this.autoplayInterval = null;
    this.timerInterval = null;
    this.autoplayDuration = 5000; // 5 seconds
    this.timerProgress = 0;
    
    this.init();
  }

  QuoteSlideshow.prototype = {
    init: function() {
      if (this.slideCount <= 1) return;
      
      this.createControls();
      this.attachEvents();
      
      if (this.$article.hasClass('selected')) {
        this.startAutoplay();
      }
    },

    createControls: function() {
      var dotsHtml = '';
      for (var i = 0; i < this.slideCount; i++) {
        dotsHtml += '<button class="nav-dot' + (i === 0 ? ' active' : '') + '" data-slide="' + i + '"></button>';
      }

      var controlsHtml = 
        '<div class="slideshow-controls">' +
          '<div class="timer-container">' +
            '<svg class="timer-svg" viewBox="0 0 50 50">' +
              '<circle class="timer-circle-bg" cx="25" cy="25" r="22"></circle>' +
              '<circle class="timer-circle" cx="25" cy="25" r="22" ' +
                'stroke-dasharray="138.23" stroke-dashoffset="138.23"></circle>' +
            '</svg>' +
          '</div>' +
          '<button class="arrow arrow-prev" aria-label="Previous slide"></button>' +
          '<div class="nav-dots">' + dotsHtml + '</div>' +
          '<button class="arrow arrow-next" aria-label="Next slide"></button>' +
        '</div>';

      this.$wrapper.append(controlsHtml);
      this.$wrapper.addClass('active');
      
      this.$controls = this.$wrapper.find('.slideshow-controls');
      this.$dots = this.$controls.find('.nav-dot');
      this.$timerCircle = this.$controls.find('.timer-circle');
    },

    attachEvents: function() {
      var self = this;

      // Arrow navigation
      this.$controls.find('.arrow-prev').on('click', function() {
        self.goToSlide(self.currentSlide - 1);
        self.resetAutoplay();
      });

      this.$controls.find('.arrow-next').on('click', function() {
        self.goToSlide(self.currentSlide + 1);
        self.resetAutoplay();
      });

      // Dot navigation
      this.$dots.on('click', function() {
        var slideIndex = $(this).data('slide');
        self.goToSlide(slideIndex);
        self.resetAutoplay();
      });

      // Monitor selected class changes
      this.observeSelectedClass();
    },

    goToSlide: function(index) {
      // Wrap around
      if (index < 0) {
        index = this.slideCount - 1;
      } else if (index >= this.slideCount) {
        index = 0;
      }

      this.currentSlide = index;
      
      // Animate track
      var translateX = -(index * 100);
      this.$track.css('transform', 'translateX(' + translateX + '%)');

      // Update dots
      this.$dots.removeClass('active');
      this.$dots.eq(index).addClass('active');

      // Reset timer
      this.timerProgress = 0;
      this.updateTimer();
    },

    startAutoplay: function() {
      var self = this;
      
      this.stopAutoplay();
      
      // Start timer animation
      this.timerInterval = setInterval(function() {
        self.timerProgress += 100;
        self.updateTimer();
        
        if (self.timerProgress >= self.autoplayDuration) {
          self.goToSlide(self.currentSlide + 1);
          self.timerProgress = 0;
        }
      }, 100);
    },

    stopAutoplay: function() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.timerProgress = 0;
      this.updateTimer();
    },

    resetAutoplay: function() {
      if (this.$article.hasClass('selected')) {
        this.startAutoplay();
      }
    },

    updateTimer: function() {
      var circumference = 138.23;
      var progress = this.timerProgress / this.autoplayDuration;
      var offset = circumference - (progress * circumference);
      this.$timerCircle.css('stroke-dashoffset', offset);
    },

    observeSelectedClass: function() {
      var self = this;
      
      // Use MutationObserver if available
      if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
          mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
              self.handleSelectedChange();
            }
          });
        });

        observer.observe(this.$article[0], {
          attributes: true,
          attributeFilter: ['class']
        });
      }

      // Fallback: check periodically
      setInterval(function() {
        self.handleSelectedChange();
      }, 500);
    },

    handleSelectedChange: function() {
      if (this.$article.hasClass('selected')) {
        if (!this.timerInterval) {
          this.startAutoplay();
        }
      } else {
        this.stopAutoplay();
      }
    },

    destroy: function() {
      this.stopAutoplay();
      this.$controls.remove();
    }
  };

  // Initialize all slideshows
  function initSlideshows() {
    $('article[data-slideshow="true"]').each(function() {
      var $article = $(this);
      if (!$article.data('slideshow-instance')) {
        var slideshow = new QuoteSlideshow($article);
        $article.data('slideshow-instance', slideshow);
      }
    });
  }

  // Initialize on DOM ready
  $(document).ready(function() {
    initSlideshows();

    // Demo: Toggle selected class
    $('#toggleSelected').on('click', function() {
      $('article[data-slideshow="true"]').toggleClass('selected');
    });
  });

})(jQuery);