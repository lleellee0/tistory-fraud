const request = require('request');
const cheerio = require('cheerio');
const headless = require('./headless');

const getBooleanByPercentage = (percentage) => {
    return Math.random()<percentage?true:false;
}

const getOneToHundred = () => {
    return parseInt(Math.random() * 100);
}

const getRandomArrayIndex = (arrayLength) => {
    return parseInt(Math.random() * arrayLength);
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

const getKeywordByTitle = (title, excerpt) => {
    let str = title.replace("[", "").replace("]", "").replace("(", "").replace(")", "").split(" ");

    if(str.length < 2) {    // 제목이 너무 짧은경우
        str = excerpt.split(" ");
        if(str.length < 2)  // 내용도 짧은 경우
            return title;   // 그냥 제목을 리턴함.
        else
            return str[getRandomArrayIndex(str.length)] + " " + str[getRandomArrayIndex(str.length)]  // 내용중에 단어 2개 결합
    } else {             // 제목이 2단어 이상인 경우
        let randomNumber = getRandomArrayIndex(str.length - 1);
        return str[randomNumber] + " " + str[randomNumber + 1];       // 제목에서 단어를 N N+1 로 결합하여 키워드 선정
    }
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

const startFraud = (isMobile, delay) => {
    for(let i = 0; i < postObjArr.length; i++) {
        requestObjArr.push({
            url:`http://iwantadmin.tistory.com${postObjArr[i].url}`, 
            maxDepth:1,
            extraHeaders: {'Referer':getReferer(getKeywordByTitle(postObjArr[i].title, postObjArr[i].excerpt)), 'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"},
            delay:delay + (getOneToHundred() * 100),
            device:null,
            isLike:getBooleanByPercentage(0.03),
            isAd:getBooleanByPercentage(0.01)
        });
        console.log(`${requestObjArr[i].url}\t${requestObjArr[i].extraHeaders.Referer}\t${requestObjArr[i].delay}\t${requestObjArr[i].isLike}\t${requestObjArr[i].isAd}`);
    }

    console.log(`isMobile : ${isMobile}, delay : ${delay}`);
    
    headless.requestPost(requestObjArr, isMobile);
}

const main = async (tistoryUrl, isMobile, delay_) => {    // like "http://iwantadmin.tistory.com"
    await crawlData(tistoryUrl);
    await delay(10000);
    await startFraud(isMobile, delay_);
};

let isMobile;

const argsCheck = () => {
    if(process.argv.length === 4) {
        if(process.argv[2] === "true" || process.argv[2] === "false") {
            if(process.argv[2] === "true")
                isMobile = true;
            else
                isMobile = false;
            return 0;
        }
    }
    console.log("invalid command.");
    console.log("node index.js isMobile delay");
    console.log("isMobile : true or false");
    console.log("delay : request delay(millisecond) recommand >= 30000");
    console.log("ex)");
    console.log("\t\tnode index.js false 30000");
    return 1;
}

if(argsCheck() === 0)
    main("http://iwantadmin.tistory.com", isMobile, parseInt(process.argv[3]));