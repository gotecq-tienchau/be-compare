import convert from 'xml-js';
import fs from 'fs';

export const convertXMLToJs = (path) => {
  const siteMapJS = convert.xml2js(
    fs.readFileSync(path, { encoding: 'utf-8' }),
    {
      compact: true,
      spaces: 4,
    }
  );
  return siteMapJS;
};
