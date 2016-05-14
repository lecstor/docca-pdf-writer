import _forEach from 'lodash/forEach';

export default function ImageManager(writer) {
  return {
    images: {},
    imageCount: 0,

    addImagesToPdf(images) {
      _forEach(images, img => {
        const handle = `img${++this.imageCount}`;
        this.images[img] = {
          handle,
          image: writer.addImage({ handle, file: img }),
        };
      });
    },
  };
}
