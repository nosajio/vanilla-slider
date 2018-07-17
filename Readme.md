# Vaniller JS Slider

A super simple dependency-free slideshow. Made for ease of use.


![Alt text](/examples/img/slide-gallery.gif?raw=true "Slideshow gallery example")


See examples directory for how to use.

## Events

```JS
  const gallery = new Slider(element);
  
  // Log the active slide on change
  gallery.on('change', e => console.log(e.element));

  // Pause all videos on slide interaction on touch
  gallery.on('touch', e => console.log(e.slides));
```
