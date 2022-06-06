import jsCrc from 'js-crc';

export const generateKey = (url, sliceLength = 3) => {
  const urlSlice = url.split('/').slice(sliceLength).join('/');
  return jsCrc.crc32(urlSlice);
};
