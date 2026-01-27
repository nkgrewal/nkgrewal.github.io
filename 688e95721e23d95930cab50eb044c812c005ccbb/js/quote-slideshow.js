<<<<<<< HEAD
// Quote Slideshow Manager
class QuoteSlideshow {
  constructor(quoteElement, articleElement) {
    this.quote = quoteElement;
    this.article = articleElement;
    this.slides = Array.from(this.quote.children);
    this.currentIndex = 0;
    this.interval = null;
    this.slideDuration = 4000; // 4 seconds
    this.timerStartTime = null;
    this.timerAnimationFrame = null;
    
    this.init();
  }
  
  init() {
    if (this.slides.length <= 1) return;
    
    // Create wrapper for slides to maintain height
    this.slidesWrapper = document.createElement('div');
    this.slidesWrapper.className = 'quote-slides-wrapper';
    this.slidesWrapper.style.cssText = `
      position: relative;
      width: 100%;
      min-height: 100px;
    `;
    
    // Calculate max height of all slides
    let maxHeight = 0;
    this.slides.forEach(slide => {
      const height = slide.offsetHeight;
      if (height > maxHeight) maxHeight = height;
    });
    
    // Move slides into wrapper
    const parent = this.quote;
    this.slides.forEach((slide, index) => {
      parent.removeChild(slide);
      slide.style.position = 'absolute';
      slide.style.top = '0';
      slide.style.left = '0';
      slide.style.width = '100%';
      slide.style.opacity = index === 0 ? '1' : '0';
      slide.style.transition = 'opacity 0.5s ease-in-out';
      slide.style.pointerEvents = index === 0 ? 'auto' : 'none';
      this.slidesWrapper.appendChild(slide);
    });
    
    this.slidesWrapper.style.minHeight = maxHeight + 'px';
    parent.insertBefore(this.slidesWrapper, parent.firstChild);
    
    // Make quote container maintain full width
    this.quote.style.position = 'relative';
    this.quote.style.width = '100%';
    this.quote.style.paddingBottom = '60px'; // Space for controls
    
    // Create controls container
    this.createControls();
    
    // Start if article is selected
    if (this.article.hasAttribute('selected')) {
      this.start();
    }
  }
  
  createControls() {
    // Controls wrapper
    const controls = document.createElement('div');
    controls.className = 'quote-controls';
    controls.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      padding: 0 20px;
    `;
    
    // Left arrow
    const leftArrow = document.createElement('button');
    leftArrow.className = 'quote-arrow quote-arrow-left';
    leftArrow.innerHTML = '←';
    leftArrow.style.cssText = `
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s;
    `;
    leftArrow.addEventListener('click', () => this.prev());
    leftArrow.addEventListener('mouseenter', () => {
      leftArrow.style.background = 'rgba(0, 0, 0, 0.7)';
    });
    leftArrow.addEventListener('mouseleave', () => {
      leftArrow.style.background = 'rgba(0, 0, 0, 0.5)';
    });
    
    // Dots container
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'quote-dots';
    dotsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      align-items: center;
    `;
    
    // Create dots
    this.dots = [];
    this.slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = 'quote-dot';
      dot.style.cssText = `
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid rgba(0, 0, 0, 0.5);
        background: ${index === 0 ? 'rgba(0, 0, 0, 0.7)' : 'transparent'};
        cursor: pointer;
        padding: 0;
        transition: all 0.3s;
      `;
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dots.push(dot);
      dotsContainer.appendChild(dot);
    });
    
    // Right arrow
    const rightArrow = document.createElement('button');
    rightArrow.className = 'quote-arrow quote-arrow-right';
    rightArrow.innerHTML = '→';
    rightArrow.style.cssText = leftArrow.style.cssText;
    rightArrow.addEventListener('click', () => this.next());
    rightArrow.addEventListener('mouseenter', () => {
      rightArrow.style.background = 'rgba(0, 0, 0, 0.7)';
    });
    rightArrow.addEventListener('mouseleave', () => {
      rightArrow.style.background = 'rgba(0, 0, 0, 0.5)';
    });
    
    // Timer circle
    const timerContainer = document.createElement('div');
    timerContainer.className = 'quote-timer';
    timerContainer.style.cssText = `
      position: absolute;
      right: 20px;
      width: 30px;
      height: 30px;
    `;
    
    const timerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    timerSvg.setAttribute('width', '30');
    timerSvg.setAttribute('height', '30');
    timerSvg.style.cssText = `
      transform: rotate(-90deg);
    `;
    
    const timerCircleBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    timerCircleBg.setAttribute('cx', '15');
    timerCircleBg.setAttribute('cy', '15');
    timerCircleBg.setAttribute('r', '12');
    timerCircleBg.setAttribute('fill', 'none');
    timerCircleBg.setAttribute('stroke', 'rgba(0, 0, 0, 0.2)');
    timerCircleBg.setAttribute('stroke-width', '3');
    
    this.timerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.timerCircle.setAttribute('cx', '15');
    this.timerCircle.setAttribute('cy', '15');
    this.timerCircle.setAttribute('r', '12');
    this.timerCircle.setAttribute('fill', 'none');
    this.timerCircle.setAttribute('stroke', 'rgba(0, 0, 0, 0.7)');
    this.timerCircle.setAttribute('stroke-width', '3');
    this.timerCircle.setAttribute('stroke-dasharray', '75.4');
    this.timerCircle.setAttribute('stroke-dashoffset', '75.4');
    this.timerCircle.style.transition = 'none';
    
    timerSvg.appendChild(timerCircleBg);
    timerSvg.appendChild(this.timerCircle);
    timerContainer.appendChild(timerSvg);
    
    // Assemble controls
    controls.appendChild(leftArrow);
    controls.appendChild(dotsContainer);
    controls.appendChild(rightArrow);
    controls.appendChild(timerContainer);
    
    this.quote.appendChild(controls);
  }
  
  updateDots() {
    this.dots.forEach((dot, index) => {
      dot.style.background = index === this.currentIndex 
        ? 'rgba(0, 0, 0, 0.7)' 
        : 'transparent';
    });
  }
  
  goToSlide(index) {
    if (index === this.currentIndex) return;
    
    // Hide current slide
    this.slides[this.currentIndex].style.opacity = '0';
    this.slides[this.currentIndex].style.pointerEvents = 'none';
    
    // Show new slide
    this.currentIndex = index;
    this.slides[this.currentIndex].style.opacity = '1';
    this.slides[this.currentIndex].style.pointerEvents = 'auto';
    
    this.updateDots();
    this.resetTimer();
  }
  
  next() {
    const nextIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }
  
  prev() {
    const prevIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }
  
  updateTimer() {
    if (!this.timerStartTime || !this.article.hasAttribute('selected')) return;
    
    const elapsed = Date.now() - this.timerStartTime;
    const progress = Math.min(elapsed / this.slideDuration, 1);
    const circumference = 75.4;
    const offset = circumference * (1 - progress);
    
    this.timerCircle.setAttribute('stroke-dashoffset', offset.toString());
    
    if (progress < 1) {
      this.timerAnimationFrame = requestAnimationFrame(() => this.updateTimer());
    }
  }
  
  resetTimer() {
    if (this.timerAnimationFrame) {
      cancelAnimationFrame(this.timerAnimationFrame);
    }
    this.timerStartTime = Date.now();
    this.timerCircle.setAttribute('stroke-dashoffset', '75.4');
    
    if (this.article.hasAttribute('selected')) {
      this.updateTimer();
    }
  }
  
  start() {
    this.stop();
    this.resetTimer();
    this.interval = setInterval(() => this.next(), this.slideDuration);
  }
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    if (this.timerAnimationFrame) {
      cancelAnimationFrame(this.timerAnimationFrame);
      this.timerAnimationFrame = null;
    }
    this.timerCircle.setAttribute('stroke-dashoffset', '75.4');
  }
}

// Global slideshow manager
const quoteSlideshows = new Map();

function initializeQuoteSlideshows() {
  // Find all articles with quote divs
  const articles = document.querySelectorAll('article');
  
  articles.forEach(article => {
    // Look for blockquote elements (common quote container)
    const quotes = article.querySelectorAll('blockquote');
    
    quotes.forEach(quote => {
      // Only initialize if there are multiple direct children (slides)
      const directChildren = Array.from(quote.children).filter(child => {
        return child.tagName === 'BLOCKQUOTE' || child.tagName === 'P' || child.tagName === 'DIV';
      });
      
      if (directChildren.length > 1) {
        const slideshow = new QuoteSlideshow(quote, article);
        quoteSlideshows.set(quote, slideshow);
      }
    });
  });
}

function updateSlideshowStates() {
  const articles = document.querySelectorAll('article');
  
  articles.forEach(article => {
    const isSelected = article.hasAttribute('selected');
    
    // Find all slideshows in this article
    quoteSlideshows.forEach((slideshow, quote) => {
      if (quote.closest('article') === article) {
        if (isSelected) {
          slideshow.start();
        } else {
          slideshow.stop();
        }
      }
    });
  });
}

// Observer for article selection changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'selected') {
      updateSlideshowStates();
    }
  });
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeQuoteSlideshows();
    updateSlideshowStates();
    
    // Observe all articles for selection changes
    const articles = document.querySelectorAll('article');
    articles.forEach(article => {
      observer.observe(article, { attributes: true });
    });
  });
} else {
  initializeQuoteSlideshows();
  updateSlideshowStates();
  
  // Observe all articles for selection changes
  const articles = document.querySelectorAll('article');
  articles.forEach(article => {
    observer.observe(article, { attributes: true });
  });
}
=======
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
>>>>>>> new-content
