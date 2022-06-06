import captureWebsite from 'capture-website';
import fs, { readFileSync } from 'fs';
import path from 'path';
import { resourceUsage } from 'process';
import SiteMapGenerator from 'sitemap-generator';
import { BreakPoint } from '../constants/breakpoint.mjs';
import { convertXMLToJs } from '../helpers/convertXMLToJs.mjs';
import { sitemapReduce } from '../helpers/sitemapReduce.mjs';
class MainController {
    async getSiteMap(req, res) {
        const { stable, current } = req.body;
        if ((stable || current) === undefined)
            return res.status(400).end('Error params!');
        let siteFinish = 0;
        let currentSitemapReduce;
        let stableSitemapReduce;

        const stableSiteGenerator = SiteMapGenerator(stable, {
            stripQuerystring: false,
            filepath: 'stable-sitemap.xml',
        });
        const currentSiteGenerator = SiteMapGenerator(current, {
            stripQuerystring: false,
            filepath: 'current-sitemap.xml',
        });

        stableSiteGenerator.on('done', () => {
            const fileDir = `${process.cwd()}/stable-sitemap.xml`;
            const siteMapJS = convertXMLToJs(fileDir);
            stableSitemapReduce = sitemapReduce(siteMapJS.urlset.url);
            const siteMapJson = JSON.stringify(stableSitemapReduce, null, 4);
            fs.writeFile(
                process.cwd() + '/src/captures/documents/stable-sitemap.json',
                siteMapJson,
                (err) => {
                    if (err)
                        return res
                            .status(500)
                            .end('server error when generate sitemaps!');
                    if (siteFinish + 1 === 2) {
                        res.status(200).json(currentSitemapReduce);
                    }
                    siteFinish += 1;
                }
            );
        });

        currentSiteGenerator.on('done', () => {
            const fileDir = `${process.cwd()}/current-sitemap.xml`;
            const siteMapJS = convertXMLToJs(fileDir);
            currentSitemapReduce = sitemapReduce(siteMapJS.urlset.url);
            const siteMapJson = JSON.stringify(currentSitemapReduce, null, 4);
            fs.writeFile(
                process.cwd() + '/src/captures/documents/current-sitemap.json',
                siteMapJson,
                (err) => {
                    if (err)
                        return res
                            .status(500)
                            .end('server error when generate sitemaps!');
                    if (siteFinish + 1 === 2) {
                        res.status(200).json(currentSitemapReduce);
                    }
                    siteFinish += 1;
                }
            );
        });

        stableSiteGenerator.start();
        currentSiteGenerator.start();
    }

    async captureSite(req, res) {
        const { key = null } = req.body.data;
        if (key === null)
            return res.status(400).end('Please provide require params!');

        const stableSiteMapJson = path.join(
            process.cwd(),
            '/src/captures/documents/stable-sitemap.json'
        );
        const stable = JSON.parse(
            readFileSync(stableSiteMapJson, { encoding: 'utf-8' })
        );
        const currentSiteMapJson = path.join(
            process.cwd(),
            '/src/captures/documents/current-sitemap.json'
        );
        const current = JSON.parse(
            readFileSync(currentSiteMapJson, { encoding: 'utf-8' })
        );
        const stableTransformData = stable.reduce((prev, curr) => {
            return { ...prev, [curr.id]: curr };
        }, {});
        const currentTransformData = current.reduce((prev, curr) => {
            return { ...prev, [curr.id]: curr };
        }, {});

        const capturedSite = {
            stable: [],
            current: [],
        };

        const handleCaptureWebsite = async (key, site) => {
            try {
                console.log(req.get('origin'));
                const origin = `http://${req.get('host')}`;
                const siteUrl =
                    site === 'stable'
                        ? stableTransformData[key].url
                        : currentTransformData[key].url;
                console.log(
                    '🚀 ~ file: index.mjs ~ line 109 ~ MainController ~ handleCaptureWebsite ~ siteUrl',
                    siteUrl
                );

                await Promise.all(
                    BreakPoint.map(async (entity) => {
                        const filePath = `${process.cwd()}/src/captures/media/${site}/${key}-${entity}.webp`;
                        fs.readFile(filePath, {}, (err, file) => {
                            if (err) return;
                            file &&
                                fs.rm(filePath, (err) => {
                                    return;
                                });
                        });
                        await captureWebsite.file(siteUrl, filePath, {
                            width: entity,
                            fullPage: true,
                            timeout: 300000,
                        });
                        capturedSite[site].push({
                            breakPoint: entity,
                            url: `${origin}/media/${site}/${key}-${entity}.webp`,
                        });
                    })
                );
                return Promise.resolve();
            } catch (error) {
                return Promise.reject(error);
            }
        };
        try {
            await handleCaptureWebsite(key, 'stable');
            await handleCaptureWebsite(key, 'current');
            const currentSorted = capturedSite.current.sort(
                (a, b) => a.breakPoint - b.breakPoint
            );
            const stableSorted = capturedSite.stable.sort(
                (a, b) => a.breakPoint - b.breakPoint
            );
            res.status(200).json({
                stable: stableSorted,
                current: currentSorted,
            });
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

export default new MainController();
