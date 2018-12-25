const puppeteer = require('puppeteer');

const delay = (milliseconds) => {
    return new Promise(_resolve => setTimeout(_resolve, milliseconds));
}

// adClick은 무조건 PC버전에서만 실행
// 기본 뷰포트에서
// x : 40, y : 257 지점부터
// x : 340, y : 507 지점까지 광고 있음.

const adClick = async (url, userAgent, count) => {
  await delay(50000 * count - 1);       // 너무 빨리 요청이 발생하지 않도록
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await browser.userAgent(userAgent);
  await page.setUserAgent(userAgent);
  await page.goto(url);
  await delay(5000);
  await page.mouse.click(40 + parseInt(Math.random()*300), 257 + parseInt(Math.random()*250));
  await browser.close();
};

module.exports = {
    adClick: adClick
}