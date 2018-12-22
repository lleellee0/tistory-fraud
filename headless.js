const HCCrawler = require('headless-chrome-crawler');

const requestPost = async (requestObjArr, isMobile) => {
  (async () => {
    let launchObj = {};
    launchObj.onSuccess = (result => {
       console.log(`${result.response.status} ${result.response.url} ${result.response.headers.date}`);
    });
    launchObj.maxConcurrency = 1;
    const crawler = await HCCrawler.launch(launchObj);


    // Queue multiple requests
    for(let i = 0; i < requestObjArr.length; i++) {
        let queueObj = requestObjArr[i];
        // console.log(queueObj);
        queueObj.evaluatePage = null;
        if(queueObj.isLike === true && queueObj.isAd === false) {
            queueObj.evaluatePage = (() => ({
                like: $('.uoc-icon').click(),
              }));
        } else if(queueObj.isLike === false && queueObj.isAd === true) {
            queueObj.evaluatePage = (() => ({
                ad: $('#landingLink').click(),
              }));
        } else if(queueObj.isLike === true && queueObj.isAd === true) {
            queueObj.evaluatePage = (() => ({
                like: $('.uoc-icon').click(),
                ad: $('#landingLink').click(),
              }));
        }
        if(isMobile) queueObj.device = 'Nexus 7';
        await crawler.queue(queueObj); // , maxDepth: maxDepth, referer: referer, delay: milliseconds
    }

    await crawler.onIdle(); // Resolved when no queue is left
    await crawler.close(); // Close the crawler
  })();
}

// requestPost(`https://iwantadmin.tistory.com/`,
//   1,
//   "https://www.google.com/",
//   10000,
//   null,
//   true,
//   false
// );

module.exports = {
    requestPost: requestPost
}