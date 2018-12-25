const HCCrawler = require('headless-chrome-crawler');

const fiveLike = async (url) => {
  const crawler = await HCCrawler.launch({
    // Function to be evaluated in browsers
    evaluatePage: (() => ({
        like: $('.uoc-icon').click(),
    })),
    // Function to be called with evaluated results from browsers
    onSuccess: (result => {
      console.log(result.response.url);
    }),
    maxConcurrency: 1
  });
  // Queue a request
  await crawler.queue({url:url});
  await crawler.onIdle(); // Resolved when no queue is left
  await crawler.close(); // Close the crawler
};

fiveLike("http://iwantadmin.tistory.com/253");