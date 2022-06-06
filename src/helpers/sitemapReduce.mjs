import { generateKey } from './generateKey.mjs';

export const sitemapReduce = (url) => {
    const sitemap = url.reduce((prev, curr) => {
        const url = curr.loc._text;
        return [
            ...prev,
            {
                id: generateKey(url),
                url,
            },
        ];
    }, []);
    return sitemap;
};
