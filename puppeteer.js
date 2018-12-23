const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
//   const browser = await puppeteer.launch({defaultViewport:{width: 1024, height: 1366, isMobile: true}});
  const page = await browser.newPage();
    
//   for(let i = 3; i <= 250; i++) {
//     try{
//         await page.goto(`https://iwantadmin.tistory.com/${i}`, {referer : 'https://www.google.com/'});
//         // await page.setViewport({width: 1024, height: 1366, isMobile: true});
//         await page.evaluate(() => {
//             document.querySelector('.uoc-icon').click();
//         });
//         }catch(e){
//         console.log(e);
//         continue;
//     }
//     console.log(`https://iwantadmin.tistory.com/${i}`);
//     await delay(0);
//   }
await page.goto(`https://iwantadmin.tistory.com/3`, {referer : 'https://search.naver.com/search.naver?sm=top_hty&fbm=0&ie=utf8&query=%EB%8B%AC%EA%B3%A0%EB%82%98+PDF'});
await page.goto(`https://iwantadmin.tistory.com/3`, {referer : 'https://search.daum.net/search?w=tot&DA=YZR&t__nil_searchbox=btn&sug=&sugo=&q=%EB%8B%AC%EA%B3%A0%EB%82%98+PDF'});

  await browser.close();
})();

const delay = (milliseconds) => {
    return new Promise(_resolve => setTimeout(_resolve, milliseconds));
}