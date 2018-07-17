import Slider from '../slider.js';

window.onload = () => {
  // Instantiate the slider on the gallery-container__content element. This will be 
  // used as the parent element that the slider class can apply transforms on.
  const parent = document.querySelector('.gallery-container__content');
  const gallery = new Slider(parent);
  console.log(gallery)
}
