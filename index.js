const request = require('request');
const cheerio = require('cheerio');
const headless = require('./headless');

const getBooleanByPercentage = (percentage) => {
    return Math.random()<percentage?true:false;
}

const getOneToHundred = () => {
    return parseInt(Math.random() * 100);
}

const delay = (milliseconds) => {
    return new Promise(_resolve => setTimeout(_resolve, milliseconds));
}

let requestObjArr = new Array(); // url, maxDepth, referer, delay, device, isLike, isAd

let postObjArr = new Array();
let refererArray = new Array();

const crawlData = async (tistoryUrl) => {
    let lastPageNumber = 0;

    await request(tistoryUrl + '?page=9999', (err, res, body) => {
        if(err) return console.log(err);
        const $ = cheerio.load(body);
        lastPageNumber = parseInt($('.selected')[0].children[0].data);
    });

    await delay(5000);

    for(let i = 1; i <= lastPageNumber; i++) {
        await request(tistoryUrl + `?page=${i}`, (err, res, body) => {
            if(err) return console.log(err);
            const $ = cheerio.load(body);
            for(let i = 0; i < $('.post-item').length; i++) {
                let obj = {}
                obj.url = $('.post-item a')[i].attribs.href;
                obj.title = $('.post-item .title')[i].children[0].data;
                if($('.post-item .excerpt')[i].children[0] === undefined)
                    obj.excerpt = '';
                else
                    obj.excerpt = $('.post-item .excerpt')[i].children[0].data;
                // console.log(obj);
                postObjArr.push(obj);
            }
        });
    }
    // await request(tistoryUrl + `?page=1`, (err, res, body) => {
    //     if(err) return console.log(err);
    //     const $ = cheerio.load(body);
    //     // console.log($('.post-item a')[0].attribs.href);    // URL
    //     // console.log($('.post-item .title')[0].children[0].data);    // TITLE
    //     // console.log($('.post-item .excerpt')[0].children[0].data);    // EXCERPT
    // });
}

const startFraud = () => {
    for(let i = 0; i < postObjArr.length; i++) {
        requestObjArr.push({
            url:`https://iwantadmin.tistory.com${postObjArr[i].url}`, 
            maxDepth:1,
            referer:"https://www.google.com/",
            delay:60000 + (getOneToHundred() * 100),
            device:null,
            isLike:getBooleanByPercentage(0.03),
            isAd:getBooleanByPercentage(0.01)
        });
        // console.log(requestObjArr[i]);
    }
    
    headless.requestPost(requestObjArr);
}

const main = async (tistoryUrl) => {    // like "http://iwantadmin.tistory.com"
    await crawlData(tistoryUrl);
    await delay(5000);
    await startFraud();
};

main("http://iwantadmin.tistory.com");