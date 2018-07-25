import EventEmitter from 'events';
import {
  diffCoords,
  originForIndex,
  changeSlide,
  addRemoveCssClass
} from './util';

/**
 * Slider 
 * 
 * Pass a parent element and it will be converted into a interactive slider. 
 * The passed element's children will be treated as the slides.
 * 
 * parent
 * +---------------+
 * | +-----------+ | +-----------+ +-----------+
 * | |           | | |           | |           |
 * | | slide     | | | slide     | | slide     |
 * | |           | | |           | |           |
 * | +-----------+ | +-----------+ +-----------+
 * +---------------+
 * 
 * ~ Events
 * 'update'   - emits after the active slide is changed.
 * 'touch'    - emits when the gallery is being interacted with.
 * 'init'     - emits after the gallery has finished initialising.
 */

export default class Slider extends EventEmitter {

  constructor(el) {
    super();
    
    // Keep a ref to the slides container
    this.el = el;
    
    // Setup the internal state
    this.touchDown = false;
    this.state = {
      slidesCount: el.children.length,
      active:      0,                     // Index of the slide that is in view
      diffX:       0,                     // How far has the slide been dragged from it's origin?
    }

    // Set the width of the slides to be exactly the width of the body
    this._setSlideWidths(el);
    
    // Add the interactivity to the slideshow
    this._attachMoveEvents();
    this._attachWindowEvents();
    
    // Set the first slide to be the one that's active
    this._cssActiveClass(0)
    this.updateIndex(0);

    // Manually emit the initialised event. Pass the first child 
    this.emit('init', { element: el.children[0], index: 0 });
  }


  /**
   * Safely update the active state without going outside the limits
   * @param {Number} n The next index
   */
  updateIndex(n) {
    // When at the start or the end, don't advance into the darkness
    if (n < 0 || n >= this.state.slidesCount) {
      return;
    }
    this.state.active = n;
    this.emit('change', { index: n, element: this.el.children[n] });
  }


  _setSlideWidths(el) {
    const parentWidth = this.el.parentElement.getBoundingClientRect().width;
    Array.from(el.children).forEach(slide => {
      slide.style.width = `${parentWidth}px`;
    });
  }


  /**
   * Add a class when touch is in progress so that conflicting effects can be
   * paused until touch has ended.
   * @param {Boolean} add true to add the classname, false to remove it
   */
  _cssTouchClass(add=false) {
    addRemoveCssClass(this.el, 'touch', add)
  }


  /**
   * Add / remove class on slide item depending on if it's in view or not
   * @param {Number} index The index of the active item
   * @param {Boolean} add 
   */
  _cssActiveClass(index) {
    if (this.touchDown) return;
    const inactiveClassName = 'not-in-view';
    const activeClassName = 'in-view';

    const active = el => {
      addRemoveCssClass(el, inactiveClassName, false);
      addRemoveCssClass(el, activeClassName, true);
    }

    const inactive = el => {
      addRemoveCssClass(el, inactiveClassName, true);
      addRemoveCssClass(el, activeClassName, false);
    }
    
    Array.from(this.el.children).forEach((el, i) => {
      index === i ? active(el) : inactive(el);
    });
  }


  /**
   * Move slide on the X axis
   * @param {Number} by How many pixels to move the slide
   */
  _translateSlide(by) {
    this.el.style.transform = `translateX(${by}px)`;
  }


  /**
   * The same as _translateSlide but moves the slide from an origin position
   * @param {Number} index 
   * @param {Number} by 
   */
  _translateFromOrigin(index, by) {
    const originX = originForIndex(index, this.el.parentElement);
    this._translateSlide(by + originX);
  }


  /**
   * Translate the slides to the origin based on the active index
   */
  _returnToOrigin() {
    const { active } = this.state;
    const origin = originForIndex(active, this.el.parentElement);
    this._translateSlide(origin);
  }

  
  _attachWindowEvents() {
    const handleResize = event => {
      this._setSlideWidths(this.el);
    }
    
    window.addEventListener('resize', handleResize);
  }
  

  /**
   * Configure and attach all the mouse and touch events needed to interract
   * with the slideshow.
   */
  _attachMoveEvents() {
    let touchOrigin = [0, 0];
    
    // All the event handlers
    const handleTouchStart = event => {
      this.touchDown = true;
      touchOrigin = event.touches ? [event.touches[0].clientX, event.touches[0].clientY] : [event.clientX, event.clientY];
      this._cssTouchClass(true);
      this.emit('touch', { 
        index: this.state.active,
        slides: this.el.children, 
        element: this.el.children[this.state.active] 
      });
    }

    const handleTouchEnd = event => {
      // Decide whether to advance the slideshow or return to original position
      const changeWeight = changeSlide(this.state.diffX, this.el.parentElement);
      this.updateIndex(this.state.active + changeWeight);
      this._cssTouchClass(false);
      this._returnToOrigin();
      // Wait for the transition to complete + a delay to wait for further 
      // user input, before switching to the active class
      setTimeout(() => this._cssActiveClass(this.state.active), 300 + 100);
      // Reset transient state items
      this.touchDown = false;
      this.state.diffX = 0;
    }

    const handleTouchMove = event => {
      if (! this.touchDown) return;
      // Calculate how much to move the slide based on cursor movement
      const movedTo = event.touches ? [event.touches[0].clientX, event.touches[0].clientY] : [event.clientX, event.clientY];
      const [diffX] = diffCoords(touchOrigin, movedTo);
      this.state.diffX = diffX;
      // In the unlikely event that there was no movement, just return
      if (diffX === 0) return;
      // Do the moving 
      this._translateFromOrigin(this.state.active, diffX);
    }

    const hasTouch = ('ontouchstart' in window);
    
    // Use built in touch events when possible
    this.el.addEventListener(hasTouch ? 'touchstart'  : 'mousedown', handleTouchStart, true);
    this.el.addEventListener(hasTouch ? 'touchend'    : 'mouseup',  handleTouchEnd, true);
    this.el.addEventListener(hasTouch ? 'touchmove'   : 'mousemove', handleTouchMove, true);
    this.el.addEventListener(hasTouch ? 'touchcancel' : 'mouseleave', handleTouchEnd, true);
  }
}
