// Quote Slideshow Manager
class QuoteSlideshow {
  constructor(quoteElement, articleElement) {
    this.quote = quoteElement;
    this.article = articleElement;
    this.slides = Array.from(this.quote.querySelectorAll('.quote-slide'));
    this.currentIndex = 0;
    this.interval = null;
    this.slideDuration = 4000; // 4 seconds
    this.timerStartTime = null;
    this.timerAnimationFrame = null;
    
    this.init();
  }
  
  init() {
    if (this.slides.length <= 1) {
      console.log('Quote has only', this.slides.length, 'slide(s), skipping slideshow');
      return;
    }
    
    console.log('Initializing slideshow with', this.slides.length, 'slides');
    
    // Prepare the quote container
    this.quote.style.position = 'relative';
    this.quote.style.width = '100%';
    
    // Create wrapper for slides
    this.slidesWrapper = document.createElement('div');
    this.slidesWrapper.className = 'quote-slides-wrapper';
    this.slidesWrapper.style.cssText = `
      position: relative;
      width: 100%;
      min-height: 100px;
    `;
    
    // Calculate max height and prepare slides
    let maxHeight = 0;
    this.slides.forEach((slide, index) => {
      const height = slide.offsetHeight;
      if (height > maxHeight) maxHeight = height;
      
      // Remove from parent temporarily
      this.quote.removeChild(slide);
      
      // Style the slide
      slide.style.position = 'absolute';
      slide.style.top = '0';
      slide.style.left = '0';
      slide.style.width = '100%';
      slide.style.opacity = index === 0 ? '1' : '0';
      slide.style.transition = 'opacity 0.5s ease-in-out';
      slide.style.pointerEvents = index === 0 ? 'auto' : 'none';
      
      // Add to wrapper
      this.slidesWrapper.appendChild(slide);
    });
    
    this.slidesWrapper.style.minHeight = maxHeight + 'px';
    
    // Insert wrapper before any existing controls or as first child
    this.quote.insertBefore(this.slidesWrapper, this.quote.firstChild);
    this.quote.style.paddingBottom = '60px'; // Space for controls
    
    // Create controls
    this.createControls();
    
    // Start if article is selected
    if (this.article.hasAttribute('selected')) {
      this.start();
    }
  }
  
  createControls() {
    // Controls wrapper - absolutely positioned, not part of slide flow
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
      z-index: 100;
      pointer-events: none;
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
      flex-shrink: 0;
      pointer-events: auto;
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
        pointer-events: auto;
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
    console.log('Starting slideshow');
    this.stop();
    this.resetTimer();
    this.interval = setInterval(() => this.next(), this.slideDuration);
  }
  
  stop() {
    console.log('Stopping slideshow');
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
  console.log('=== Initializing Quote Slideshows ===');
  
  // Find all articles
  const articles = document.querySelectorAll('article');
  console.log('Found', articles.length, 'articles');
  
  articles.forEach((article, articleIndex) => {
    // Look for .quote elements within this article
    const quoteElements = article.querySelectorAll('.quote');
    console.log('Article', articleIndex, 'has', quoteElements.length, 'quote element(s)');
    
    quoteElements.forEach((quote, quoteIndex) => {
      const slides = quote.querySelectorAll('.quote-slide');
      console.log('  Quote', quoteIndex, 'has', slides.length, 'slides');
      
      if (slides.length > 1) {
        const slideshow = new QuoteSlideshow(quote, article);
        quoteSlideshows.set(quote, slideshow);
      }
    });
  });
  
  console.log('Total slideshows created:', quoteSlideshows.size);
}

function updateSlideshowStates() {
  console.log('=== Updating Slideshow States ===');
  
  const articles = document.querySelectorAll('article');
  
  articles.forEach((article, index) => {
    const isSelected = article.hasAttribute('selected');
    console.log('Article', index, 'selected:', isSelected);
    
    // Find all slideshows in this article
    quoteSlideshows.forEach((slideshow, quoteElement) => {
      if (quoteElement.closest('article') === article) {
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
      console.log('Article selection changed');
      updateSlideshowStates();
    }
  });
});

// Initialize
function initialize() {
  console.log('DOM Ready - Initializing quote slideshows');
  initializeQuoteSlideshows();
  updateSlideshowStates();
  
  // Observe all articles for selection changes
  const articles = document.querySelectorAll('article');
  articles.forEach(article => {
    observer.observe(article, { attributes: true });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}