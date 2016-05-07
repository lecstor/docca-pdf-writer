import {
  line,
  circleCurveCPD,
  circleTopRight, circleBottomRight, circleBottomLeft, circleTopLeft,
} from './';

export default function({ x, y, width, height, cornerRadius = 0 }) {
  const ay = y - height;
  if (!cornerRadius) return `${x} ${ay} ${width} ${height} re`;

  const cR = cornerRadius;
  const d = circleCurveCPD(cR);
  const markup = [];
  const corner = { r: cR, d };

  markup.push(`${x + cR} ${ay} m`);
  markup.push(circleBottomLeft({ x: x + cR, y: ay + cR, ...corner }));
  markup.push(line({ x2: x, y2: ay + height - cR }));
  markup.push(circleTopLeft({ x: x + cR, y: ay + height - cR, ...corner }));
  markup.push(line({ x2: x + width - cR, y2: ay + height }));
  markup.push(circleTopRight({ x: x + width - cR, y: ay + height - cR, ...corner }));
  markup.push(line({ x2: x + width, y2: ay + cR }));
  markup.push(circleBottomRight({ x: x + width - cR, y: ay + cR, ...corner }));
  markup.push(line({ x2: x + cR, y2: ay }));
  return markup.join('\n');
}
