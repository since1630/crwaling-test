const express = require('express');
const app = express();
const router = express.Router();
const axios = require('axios');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
// const { Items } = require('../models');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//todo 상품 크롤링
//todo 1.상품의 아이디 값을 동적 크롤링을 이용해 전부 배열로 받는다.
//todo 2.배열안에 있는 각 원소(상품 아이디)를 순회 하면서 crwaling 함수의 인자에 해당 원소를 넣어준다.
//todo 3.각 상품에 해당하는 데이터 목록들을 크롤링 하면서 객체 형태로 배열에 담아준다.
//todo 4.순회가 끝나면 배열에 각 상품에 대한 데이터들이 객체 형태로 있을 것이고 그걸 클라이언트 혹은 DB에 넘겨준다.

router.get('/', async (req, res) => {
  // //todo puppeteer + axios & cheerio 사용

  async function runCrawler() {
    async function getItemInfo(itemId) {
      //   console.log(itemId);
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
          let category = categoryHeader.find('a.link').text();
          category =
            category === '가구'
              ? 1
              : category === '패브릭'
              ? 2
              : category === '가전·디지털'
              ? 3
              : category === '주방용품'
              ? 4
              : 5;
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

          // console.log(itemInfo);

          return itemInfo;
        })
        // 실패했을 경우
        .catch((err) => {
          console.error(err);
        });

      return itemInfo;
    }

    //todo: 여기서 동적 크롤링 시작합니다.

    // 1. Chromium 브라우저를 엽니다.
    const browser = await puppeteer.launch({ headless: false }); // headless: true 면 브라우저를 열어서 크롤링한다는 뜻.

    // 2. 페이지를 엽니다.
    const page = await browser.newPage();

    const { category, id } = req.query;

    if (!category || !id) {
      return res
        .status(404)
        .json({ errMessage: '두 가지 쿼리 값 모두 필요합니다' });
    }

    const href = `https://ohou.se/store/category?category=${category}&order=popular&affect_type=StoreHomeCategory&affect_id=${id}`;

    // 3. 링크로 이동합니다.
    await page.goto(`${href}`);
    await page.waitForTimeout(1000); // 페이지 열리고 1초만 멈춰라

    //todo : 크롤링 로직 설명
    // 0.초기값 limit을 지정한다.
    // 1.previous카운트에 현재 article.production에 해당하는 html태그의 갯수(크롤링 데이터 갯수)를 담는다.
    // 2.puppeteer가 스크롤을 컨트롤 할 수 있게 evaluate 함수를 사용한다.
    // 3.스크롤을 내렸으니 무한 스크롤에 의해 새로운 html태그가 여러개 생겼을텐데 그 갯수를 current카운트에 담아준다. 이때, accElementsCount에도 누적합산한다
    // 4.새로운 태그가 갱신 되었으니 다시 3번 작업을 수행한다.
    // 5.누적합산이 초기값 limit과 일치하거나 클 경우 크롤링을 중단하고 브라우저를 닫는다.

    let idList = [];
    let limit = 50; // 원하는 크롤링 데이터 갯수 설정

    // let previousElementsCount = await page.$$eval(
    //   'article.production-item',
    //   (elements) => elements.length
    // );
    // console.log('previousElementsCount', previousElementsCount);

    // await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');  // 스크롤 크기값을 가져온다. 크기값을 변수에 담고 싶다면 let 변수 = await page.evaluate('window.scrollTo(0, document.body.scrollHeight)') 하면 된다.
    let accElementsCount = 0; // 누적된 크롤링 데이터 갯수

    while (true) {
      let ehList = await page.$$('article.production-item');
      for (let eh of ehList) {
        let id = await (await eh.getProperty('id')).jsonValue();
        if (id === '') continue; // article.production-item 이 위에도 있는데 얘네는 크롤링 안할거다
        id = id.replace(/product-/g, ''); // 모든 태그가 id = product-2345232 이런식으로 되어있는데 숫자만 쓰고 싶으니 replace 함수 적용
        idList.push(id);
      }
      // console.log(idList);

      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)'); // 페이지가 JS를 사용할 수 있게 한다. 즉, 브라우저가 스크롤을 제어할 수 있게 하는 코드
      await page.waitForTimeout(1000); // 로딩하고 1초 기다리는 코드인데 얘 더이상 작동 안한댄다. 그래서 바로 밑에 await new Promise 로 변경했다.
      await new Promise((resolve) => setTimeout(resolve, 1000)).catch((err) =>
        console.error(err)
      );

      let currentElementsCount = await page.$$eval(
        'article.production-item',
        (elements) => elements.length
      );
      accElementsCount += currentElementsCount; // 크롤링 데이터 갯수 누적 합산

      console.log('currentElementsCount:', currentElementsCount);
      console.log('accElementsCount:', accElementsCount);
      if (
        // currentElementsCount === previousElementsCount ||
        idList.length >= limit // accElementsCount >= limit로 설정했는데 currentElementsCount 값이 실행할 때마다 바뀌기 때문에 idList.length >= 50 으로 설정 변경
      ) {
        break;
      }
      previousElementsCount = currentElementsCount;
    }

    // console.log('idList.length:', idList.length);
    // console.log('accElementsCount:', accElementsCount);

    // * 위에서 받은 리스트의 원소를 하나 씩 getItemInfo에 삽입 -> Promise.all 처리
    const itemInfoResults = await Promise.all(
      idList.map(async (itemId) => {
        const itemInfo = await getItemInfo(itemId);

        console.log(itemInfo);
        return itemInfo; // DB 에 저장하는 과정 없이 곧바로 클라이언트에게 반환하는 경우 주석 해제한 후 이 코드 사용

        // 만약 DB에 저장 할거라면? 위의 return itemInfo; 코드라인을 주석 처리하고 아래의 코드를 주석 해제한 후 실행하면 된다.
        // return await Items.create({
        //   itemName: itemInfo.itemName,
        //   category: itemInfo.category,
        //   coverImage: JSON.stringify(itemInfo.coverImage), // DB의 coverImage 데이터 타입이 String이므로 문자열로 변환해줘야함.
        //   brand: itemInfo.brand,
        //   price: itemInfo.price,
        //   content: JSON.stringify(itemInfo.content),
        // });
      })
    );
    // console.log(idList);
    await page.close(); // 페이지 닫기. (불필요한 메모리 낭비 방지)
    await browser.close(); // 브라우저 닫기.(불필요한 메모리 낭비 방지)

    return res.status(200).json(itemInfoResults); // DB 없이 클라이언트에 반환하는 경우
  }

  runCrawler().catch((err) => {
    console.error(err);
  });
});

// 서버 가동 코드
app.listen(process.env.PORT || 3000, (req, res) => {
  console.log(`${process.env.PORT || 3000} 포트에 접속 되었습니다.`);
});

module.exports = router;

//? 여기 부턴 일기장

//   //todo 헤더 리스트에서 한 개의 항목에 대한 브랜드명, 제목, 가격을 추출
//   let ehList = await page.$$(
//     'body > div.page > div > div > div.production-feed.container > div:nth-child(4) > div'
//   );
//   try {
//     for (eh of ehList) {
//       let coverImage = await eh.$eval(
//         'article.production-item > div.production-item-image.production-item__image img.image',
//         function (e) {
//           return e.getAttribute('src');
//         }
//       );
//       let brand = await eh.$eval(
//         'span.production-item__header__brand',
//         function (e) {
//           return e.innerText;
//         }
//       );
//       let title = await eh.$eval(
//         'span.production-item__header__name',
//         function (e) {
//           return e.innerText;
//         }
//       );
//       console.log(coverImage);
//       console.log(title);
//       console.log(brand);
//     }
//   } catch (err) {
//     console.error(err);
//   }

// 4. HTML 정보를 가져옵니다.
// const content = await page.content();

//   // 5. 페이지와 브라우저를 닫습니다.
//   await page.close();
//   await browser.close();

// runCrawler().catch((err) => {
//   console.error(err);
// });
