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
// url 인코딩 : encodeURI(uri);
// 네이버 : https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=IPFS+-+%ED%8C%8C%EC%9D%BC%2F%EB%94%94%EB%A0%89%ED%86%A0%EB%A6%AC+%EC%97%85%EB%A1%9C%EB%93%9C
// 다음 : https://search.daum.net/search?w=tot&DA=YZR&t__nil_searchbox=btn&sug=&sugo=&q=IPFS+-+%ED%8C%8C%EC%9D%BC%2F%EB%94%94%EB%A0%89%ED%86%A0%EB%A6%AC+%EC%97%85%EB%A1%9C%EB%93%9C
// 구글 : https://www.google.com/
// 네이버 다음 구글 비율 : 1 : 2 : 7 => 4 : 8 : 28
// 검색유입 직접유입 비율 : 40 : 60
// 0~4 네이버
// 4~12 다음
// 12~40 구글
// 40~100 직접유입

const getReferer = (keyword) => {
    let dice = getOneToHundred();
    if(dice < 4) return "https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=" + encodeURI(keyword);
    else if(dice < 12) return "https://search.daum.net/search?w=tot&DA=YZR&t__nil_searchbox=btn&sug=&sugo=&q=" + encodeURI(keyword);
    else if(dice < 40) return "https://www.google.com/";
    else if(dice < 100) return null;
}


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

const startFraud = (isMobile) => {
    for(let i = 0; i < postObjArr.length; i++) {
        requestObjArr.push({
            url:`https://iwantadmin.tistory.com${postObjArr[i].url}`, 
            maxDepth:1,
            referer:getReferer(postObjArr[i].title),
            delay:70000 + (getOneToHundred() * 100),
            device:null,
            isLike:getBooleanByPercentage(0.03),
            isAd:getBooleanByPercentage(0.01)
        });
        console.log(`${requestObjArr[i].url}\t${requestObjArr[i].referer}\t${requestObjArr[i].delay}\t${requestObjArr[i].isLike}\t${requestObjArr[i].isAd}`);
    }
    
    headless.requestPost(requestObjArr, isMobile);
}

const main = async (tistoryUrl, isMobile) => {    // like "http://iwantadmin.tistory.com"
    await crawlData(tistoryUrl);
    await delay(5000);
    await startFraud(isMobile);
};

main("http://iwantadmin.tistory.com", false);