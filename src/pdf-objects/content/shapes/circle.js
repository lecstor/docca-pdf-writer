
/**
 * get the distance to place the control points of a cubic bazier curve from the endpoints in
 * order to create a quarter circle curve.
 * @param   {Number} radius      The radius of the circle to be drawn
 * @param   {Number} [curves=4]  The number of curves which will be used to make the circle.
 * @returns {Number}             The distance
 */
function circleCurveCPD(radius, curves = 4) {
  return radius * (4 / 3) * Math.tan(Math.PI / (2 * curves));
}

function circleTopRight({ x, y, r, d }) {
  return `${x + d} ${y + r} ${x + r} ${y + d} ${x + r} ${y} c`;
}

function circleBottomRight({ x, y, r, d }) {
  return `${x + r} ${y - d} ${x + d} ${y - r} ${x} ${y - r} c`;
}

function circleBottomLeft({ x, y, r, d }) {
  return `${x - d} ${y - r} ${x - r} ${y - d} ${x - r} ${y} c`;
}

function circleTopLeft({ x, y, r, d }) {
  return `${x - r} ${y + d} ${x - d} ${y + r} ${x} ${y + r} c`;
}

/**
 * get markup to draw a circle around x,y with radius
 * @param   {Number} options.x       horizontal position of circle centre
 * @param   {Number} options.y       vertical position of circle centre
 * @param   {Number} options.radius  radius of circle
 * @returns {String}                 PDF markup
 */
export default function ({ x, y, radius }) {
  const d = circleCurveCPD(radius);
  const r = radius;
  return `
${x} ${y + r} m
${circleTopRight({ x, y, r, d })}
${circleBottomRight({ x, y, r, d })}
${circleBottomLeft({ x, y, r, d })}
${circleTopLeft({ x, y, r, d })}
`;
}


// export default function({ x, y, radius }) {
//   const d = circleCurveCPD(radius);
//   const r = radius;
//   return `
// ${x} ${y + r} m
// ${x + d} ${y + r} ${x + r} ${y + d} ${x + r} ${y} c
// ${x + r} ${y - d} ${x + d} ${y - r} ${x} ${y - r} c
// ${x - d} ${y - r} ${x - r} ${y - d} ${x - r} ${y} c
// ${x - r} ${y + d} ${x - d} ${y + r} ${x} ${y + r} c
// `;
// }

export { circleCurveCPD, circleTopRight, circleBottomRight, circleBottomLeft, circleTopLeft };
