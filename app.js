const express = require('express');
const app = express();
const router = express.Router();
const axios = require('axios');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//todo 상품 크롤링
//todo 1.상품의 아이디 값을 전부 배열로 받는다.
//todo 2.배열안에 있는 각 원소(상품 아이디)를 순회 하면서 crwaling 함수의 인자에 해당 원소를 넣어준다.
//todo 3.각 상품에 해당하는 데이터 목록들을 크롤링 하면서 객체 형태로 배열에 담아준다.
//todo 4.순회가 끝나면 배열에 각 상품에 대한 데이터들이 객체 형태로 있을 것이고 그걸 클라이언트에게 넘겨준다.

app.get('/api', async (req, res) => {
  const { itemId } = req.query;
  const url = `https://ohou.se/productions/${itemId}/selling?affect_id=1&affect_type=StoreSearchResult`;

  const itemInfo = await axios({
    // 크롤링을 원하는 페이지 URL
    url: url,
    method: 'GET',
    responseType: 'arraybuffer',
  })
    // 성공했을 경우
    .then((response) => {
      // 만약 content가 정상적으로 출력되지 않는다면, arraybuffer 타입으로 되어있기 때문일 수 있다.
      // 현재는 string으로 반환되지만, 만약 다르게 출력된다면 뒤에 .toString() 메서드를 호출하면 된다.
      const content = iconv.decode(response.data, 'UTF-8');
      const $ = cheerio.load(content);
      // 사이드 커버 이미지 1개 선택
      const sideCoverImage = $(
        'body > div.page > div > div > div.production-selling > div.production-selling-overview.container > div > div.production-selling-overview__cover-image-wrap.col-12.col-md-6.col-lg-7 > div > div.carousel.production-selling-cover-image.production-selling-overview__cover-image > ul'
      ).children();

      let sideCoverImageArr = [];
      // 사이드 커버 이미지 7개 출력
      $(sideCoverImage).each((i, elem) => {
        const img = $(elem).find('img.image').attr('src');
        sideCoverImageArr.push(img);
      });

      //판매가 헤더
      const sellingHeader = $(
        'body > div.page > div > div > div.production-selling > div.production-selling-overview.container > div > div.production-selling-overview__content.col-12.col-md-6.col-lg-5 > div.production-selling-header'
      );
      const brand = sellingHeader
        .find('a.production-selling-header__title__brand')
        .text();
      const itemName = sellingHeader
        .find('span.production-selling-header__title__name')
        .text();
      // 가격 헤더
      const priceHeader = $(
        'body > div.page > div > div > div.production-selling > div.production-selling-overview.container > div > div.production-selling-overview__content.col-12.col-md-6.col-lg-5 > div.production-selling-header > div.production-selling-header__content > div.production-selling-header__price > span > div > div.production-selling-header__price__price'
      );
      const price = priceHeader.find('span.number').text();
      // 카테고리 헤더
      const categoryHeader = $(
        'body > div.page > div > div > div.production-selling > div.production-selling-overview.container > nav > ol > li:nth-child(1)'
      );
      const category = categoryHeader.find('a.link').text();

      // 내용 사진 헤더
      const contentHeader = $(
        'div.production-selling-description__content img'
      );

      // 내용 사진 출력
      let contentArr = [];
      $(contentHeader).each((i, elem) => {
        const img = $(elem).attr('src');
        contentArr.push(img);
      });

      let itemInfo = {
        itemName: itemName,
        category: category,
        coverImage: sideCoverImageArr,
        brand: brand,
        price: price,
        content: contentArr,
      };
      return res.status(200).json(itemInfo);
    })
    // 실패했을 경우
    .catch((err) => {
      console.error(err);
    });
});

// //todo puppeteer 사용

async function runCrawler() {
  // 1. 크로미움 브라우저를 엽니다.
  const browser = await puppeteer.launch(); // -> 여러 가지 옵션을 설정할 수 있습니다.

  // 2. 페이지를 엽니다.
  const page = await browser.newPage();

  const href =
    'https://ohou.se/productions/feed?type=store&query=%EC%B9%A8%EB%8C%80&input_source=integrated';

  // 3. 링크로 이동합니다.
  await page.goto(`${href}`);

  // 4. HTML 정보를 가져옵니다.
  const content = await page.content();

  // 5. 페이지와 브라우저를 닫습니다.
  await page.close();
  await browser.close();
}

runCrawler().catch((err) => {
  console.error(err);
});

// app.get('/api/puppe', async (req, res) => {

// })

// //todo 고객 센터 크롤링

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log(`${process.env.PORT || 3000} 포트에 접속 되었습니다.`);
});
