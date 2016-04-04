
/**
 * returns image data with the alpha channel removed
 * @param   {Object} png  an instance of pngjs
 * @returns {Buffer}      image data
 */
function removeAlpha(png) {
  const data = new Buffer(png.width * png.height * 3);
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const srcIdx = (png.width * y + x) << 2;
      const targetIdx = (png.width * y + x) * 3;
      data[targetIdx] = png.data[srcIdx];
      data[targetIdx + 1] = png.data[srcIdx + 1];
      data[targetIdx + 2] = png.data[srcIdx + 2];
    }
  }
  return data;
}

/**
 * returns only the alpha channel
 * @param   {Object} png  an instance of pngjs
 * @returns {Buffer}      image data
 */
function extractAlpha(png) {
  const data = new Buffer(png.width * png.height);
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const srcIdx = (png.width * y + x) << 2;
      const targetIdx = (png.width * y + x); // * 3;
      data[targetIdx] = png.data[srcIdx + 3];
    }
  }
  return data;
}

/**
 * returns image data and alpha channel data in separate buffers
 * @param   {Object} png  an instance of pngjs
 * @returns {Object} obj
 * @returns {Buffer} obj.image  image data
 * @returns {Buffer} obj.alpha  alpha channel data
 */
function splitAlpha(png) {
  const image = new Buffer(png.width * png.height * 3);
  let alpha = new Buffer(png.width * png.height);
  let hasAlpha = false;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const srcIdx = (png.width * y + x) << 2;
      const targetIdx = (png.width * y + x) * 3;
      const alphaTargetIdx = (png.width * y + x);
      image[targetIdx] = png.data[srcIdx];
      image[targetIdx + 1] = png.data[srcIdx + 1];
      image[targetIdx + 2] = png.data[srcIdx + 2];
      alpha[alphaTargetIdx] = png.data[srcIdx + 3];
      if (alpha[alphaTargetIdx] < 255) hasAlpha = true;
    }
  }
  if (!hasAlpha) alpha = null;
  return { image, alpha };
}


function colors(colorType) {
  return [1, null, 3, 1, 2, null, 4][colorType];
};

function extractAlphaFromPalette(png) {
  const data = new Buffer(png.width * png.height);
  forEach(png.palette, (value, idx) => data[idx] = value[3]);
  return data;
}

export { splitAlpha, removeAlpha, extractAlpha, extractAlphaFromPalette };
