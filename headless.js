const HCCrawler = require('headless-chrome-crawler');
const adClick = require('./adclick');

const requestPost = async (requestObjArr, isMobile) => {
  (async () => {
    let launchObj = {};
    launchObj.onSuccess = (result => {
        if(result.options.extraHeaders.Referer === undefined)
        result.options.extraHeaders.Referer = null; // null이 들어가는게 좀 더 명시적인 느낌이라 변경.
        
       console.log(`${result.response.status} ${result.response.url} ${result.response.headers.date} referer:${result.options.extraHeaders.Referer} like:${result.options.isLike} ad:${result.options.isAd}`);
    });
    launchObj.maxConcurrency = 1;
    const crawler = await HCCrawler.launch(launchObj);


    // Queue multiple requests
    for(let i = 0, count = 1; i < requestObjArr.length; i++) {
        // referer 없는 요청이 날아가지 않는 버그 수정
        if(requestObjArr[i].extraHeaders.Referer === null)
            delete requestObjArr[i].extraHeaders.Referer;

        let queueObj = requestObjArr[i];

        queueObj.evaluatePage = null;
        if(queueObj.isLike === true && queueObj.isAd === false) {
            queueObj.evaluatePage = (() => ({
                like: $('.uoc-icon').click(),
              }));
        } else if(queueObj.isLike === false && queueObj.isAd === true) {
              adClick.adClick(queueObj.url, queueObj.extraHeaders['User-Agent'], count++);
        } else if(queueObj.isLike === true && queueObj.isAd === true) {
            queueObj.evaluatePage = (() => ({
                like: $('.uoc-icon').click(),
              }));
              adClick.adClick(queueObj.url, queueObj.extraHeaders['User-Agent'], count++);
        }
        if(isMobile) {
            delete requestObjArr[i].extraHeaders['User-Agent'];
            queueObj.device = 'Nexus 7';
        }
        await crawler.queue(queueObj); // , maxDepth: maxDepth, delay: milliseconds
    }

    await crawler.onIdle(); // Resolved when no queue is left
    await crawler.close(); // Close the crawler
  })();
}

module.exports = {
    requestPost: requestPost
}