// How far has the mouse moved from given coords
export const diffCoords = (a, b) => ([
  (a[0] - b[0]) * -1,
  (a[1] - b[1]) * -1
]);

// Return the X value to bring a certain slide index into view
export const originForIndex = (n, parentElement) => {
  if (n === 0) return 0;
  const totalWidth = parentElement.getBoundingClientRect().width;
  return -1 * totalWidth * n;
}

// Return integer value to either...
// go back (-1)
// stay (0)
// move ahead (1)
export const changeSlide = (xDiff, parentElement) => {
  if (xDiff === 0) return 0;
  let isNegative = xDiff < 0;
  // Tolerance fraction sets how far items must be dragged relative to the width
  // of the screen before a move should be triggered
  const toleranceFr = 0.33;

  const totalWidth = parentElement.getBoundingClientRect().width;
  const tolerance = totalWidth * toleranceFr;
  const overTolerance = tolerance - Math.abs(xDiff) <= 0;

  // The tolerance hasn't been passed, so stay put this time
  if (! overTolerance) return 0;
  // ...otherwise decide which way to move based on the value of the diff
  return isNegative ? 1 : -1;
}

export const addRemoveCssClass = (el, className, add=false) => 
  add ? el.classList.add(className) : el.classList.remove(className);