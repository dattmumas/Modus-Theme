/**
 * Hero 3D Scroll Component
 * - Page is scroll-locked
 * - Wheel input drives animation (model left, then content right)
 * - After animation, right column scrolls internally
 */

class Hero3DScrollComponent extends HTMLElement {
  constructor() {
    super();
    this.section = null;
    this.modelViewer = null;
    this.scrollContainer = null;
    this.modelReady = false;

    // Animation state
    this.progress = 0;
    this.targetProgress = 0;
    this.animationDone = false;
    this.sensitivity = 0.001;
    this.smoothing = 0.12; // Lower = smoother but slower

    // Model rotation
    this.targetRotation = 0;
    this.initialOrbit = { theta: 0, phi: 75, radius: 'auto' };

    // Animation loop
    this.isAnimating = false;
  }

  connectedCallback() {
    this.section = this.closest('.hero-3d-scroll');
    if (!this.section) return;

    this.scrollContainer = this.section.querySelector('.hero-3d-scroll__scroll-container');
    this.targetRotation = parseFloat(this.dataset.targetRotation) || 0;

    this.init();
  }

  init() {
    // Lock page scroll
    document.body.style.overflow = 'hidden';

    // Position section to fill viewport (accounting for header)
    const header = document.querySelector('header, .header, .shopify-section-header');
    const headerHeight = header ? header.offsetHeight : 0;

    this.section.style.position = 'fixed';
    this.section.style.top = headerHeight + 'px';
    this.section.style.left = '0';
    this.section.style.width = '100vw';
    this.section.style.height = `calc(100vh - ${headerHeight}px)`;
    this.section.style.zIndex = '5';

    // Add animated class
    this.section.classList.add('hero-3d-scroll--animated');

    // Wheel handler
    this.onWheel = this.handleWheel.bind(this);
    window.addEventListener('wheel', this.onWheel, { passive: false });

    // Touch handlers
    this.onTouchStart = (e) => { this.touchY = e.touches[0].clientY; };
    this.onTouchMove = this.handleTouch.bind(this);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });

    // Setup model
    this.setupModel();

    // Initial render
    this.render();
  }

  setupModel() {
    customElements.whenDefined('model-viewer').then(() => {
      this.modelViewer = this.querySelector('model-viewer');
      if (!this.modelViewer) return;

      const onLoad = () => {
        this.modelReady = true;
        try {
          const orbit = this.modelViewer.getCameraOrbit();
          this.initialOrbit = {
            theta: orbit.theta * (180 / Math.PI),
            phi: orbit.phi * (180 / Math.PI),
            radius: orbit.radius
          };
        } catch (e) {
          this.initialOrbit = { theta: 0, phi: 75, radius: 'auto' };
        }
      };

      this.modelViewer.addEventListener('load', onLoad);
      if (this.modelViewer.loaded) onLoad();
    });
  }

  handleWheel(e) {
    e.preventDefault();

    if (!this.animationDone) {
      // Drive animation with wheel
      this.targetProgress += e.deltaY * this.sensitivity;
      this.targetProgress = Math.max(0, Math.min(1, this.targetProgress));
      this.startAnimationLoop();
    } else {
      // Animation done - scroll content or reverse
      if (this.scrollContainer) {
        if (e.deltaY < 0 && this.scrollContainer.scrollTop <= 0) {
          // Scrolling up at top - reverse animation
          this.targetProgress += e.deltaY * this.sensitivity;
          this.targetProgress = Math.max(0, Math.min(1, this.targetProgress));
          this.startAnimationLoop();
        } else {
          // Scroll the content
          this.scrollContainer.scrollTop += e.deltaY;
        }
      }
    }
  }

  startAnimationLoop() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animationLoop();
  }

  animationLoop() {
    // Lerp progress towards target
    const diff = this.targetProgress - this.progress;
    this.progress += diff * this.smoothing;

    // Snap if very close
    if (Math.abs(diff) < 0.001) {
      this.progress = this.targetProgress;
    }

    // Update animation complete state
    if (this.progress >= 0.999 && !this.animationDone) {
      this.animationDone = true;
      this.section.classList.add('hero-3d-scroll--animation-complete');
    } else if (this.progress < 0.999 && this.animationDone) {
      this.animationDone = false;
      this.section.classList.remove('hero-3d-scroll--animation-complete');
    }

    this.render();

    // Continue loop if not at target
    if (Math.abs(this.targetProgress - this.progress) > 0.001) {
      requestAnimationFrame(() => this.animationLoop());
    } else {
      this.isAnimating = false;
    }
  }

  handleTouch(e) {
    const y = e.touches[0].clientY;
    const delta = this.touchY - y;
    this.touchY = y;

    // Fake wheel event
    this.handleWheel({ deltaY: delta * 2, preventDefault: () => e.preventDefault() });
  }

  render() {
    if (!this.section) return;

    // Update CSS variable
    this.section.style.setProperty('--scroll-progress', this.progress.toFixed(4));

    // Rotate model
    if (this.modelViewer && this.modelReady) {
      const rotation = this.initialOrbit.theta + (this.progress * this.targetRotation);
      const radius = typeof this.initialOrbit.radius === 'number'
        ? this.initialOrbit.radius + 'm'
        : 'auto';
      this.modelViewer.cameraOrbit = `${rotation}deg ${this.initialOrbit.phi}deg ${radius}`;
    }
  }

  disconnectedCallback() {
    document.body.style.overflow = '';

    if (this.onWheel) window.removeEventListener('wheel', this.onWheel);
    if (this.onTouchStart) window.removeEventListener('touchstart', this.onTouchStart);
    if (this.onTouchMove) window.removeEventListener('touchmove', this.onTouchMove);

    if (this.section) {
      this.section.classList.remove('hero-3d-scroll--animated');
      this.section.style.cssText = '';
    }
  }
}

if (!customElements.get('hero-3d-scroll-component')) {
  customElements.define('hero-3d-scroll-component', Hero3DScrollComponent);
}
