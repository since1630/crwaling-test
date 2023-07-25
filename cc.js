const express = require('express');
const app = express();
const router = express.Router();
const axios = require('axios');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// //todo 고객 센터 크롤링 API
// app.get('/api', async (req, res) => {
//   //todo : puppeteer 로 크롤링
//   // 1. 크로미움 브라우저를 엽니다.
//   const browser = await puppeteer.launch({ headless: true }); // -> 여러 가지 옵션을 설정할 수 있습니다.

//   // 2. 페이지를 엽니다.
//   const page = await browser.newPage();
//   // 브라우저 크기 설정
//   await page.setViewport({
//     width: 1920,
//     height: 1080,
//   });
//   const href = 'https://ohou.se/customer_center';

//   await page.goto(`${href}`);

//   let resultsList = [];

//   let ehList = await page.$$('#contact-us > div > nav'); // nav 탭 선택하기
//   for (let eh of ehList) {
//     await eh.click(); // nav탭 안에 있는 요소 선택
//     //   console.log(eh);
//     let qnaCatecory = await eh.$eval('label.css-10kphwv', (e) => {
//       return e.getAttribute('for');
//     });

//     let ulhList = await page.$$('li.css-1r412mj.e1u1v8kh3'); // nav 탭 안에 있는 요소를 선택한 상태에서 ul 클래스 선택
//     for (let ulh of ulhList) {
//       let question = await ulh.$eval('span.question-text', (e) => {
//         return e.innerText;
//       });
//       let answer = await ulh.$eval('div.css-1nxzveq.e1u1v8kh0 p', (e) => {
//         return e.innerText;
//       });

//       let qnaCategoryObj = {
//         question: question,
//         category: qnaCatecory,
//         answer: answer,
//       };
//       resultsList.push(qnaCategoryObj);
//     }
//   }

//   let etcList = await page.$$('label.css-1d73fhs'); // nav 탭 선택하기
//   for (let eh of etcList) {
//     console.log(eh);
//     console.log(await eh.click()); // nav탭 안에 있는 요소 선택
//     console.log(await (await eh.getProperty('for')).jsonValue()); //! 얘가 왜 undefined 가 나오지...?
//     //  await (await eh.getProperty('for')).jsonValue(); 로 쓰면 undefined 가 나오던데...?
//     let qnaCategory = await eh.evaluate((e) => {
//       return e.getAttribute('for');
//     });

//     let ulhList = await page.$$('li.css-1r412mj.e1u1v8kh3'); // nav 탭 안에 있는 요소를 선택한 상태에서 ul 클래스 선택
//     for (let ulh of ulhList) {
//       let question = await ulh.$eval('span.question-text', (e) => {
//         return e.innerText;
//       });
//       let answer = await ulh.$eval('div.css-1nxzveq.e1u1v8kh0 p', (e) => {
//         return e.innerText;
//       });

//       let qnaCategoryObj = {
//         question: question,
//         category: qnaCategory,
//         answer: answer,
//       };
//       resultsList.push(qnaCategoryObj);
//     }
//   }
//   console.log(resultsList);
// });

// //todo 고객 센터 크롤링 함수
const crwaling = async () => {
  //todo : puppeteer 로 크롤링
  // 1. 크로미움 브라우저를 엽니다.
  const browser = await puppeteer.launch({ headless: true }); // -> 여러 가지 옵션을 설정할 수 있습니다.

  // 2. 페이지를 엽니다.
  const page = await browser.newPage();
  // 브라우저 크기 설정
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  const href = 'https://ohou.se/customer_center';

  await page.goto(`${href}`);

  let resultsList = [];

  let ehList = await page.$$('#contact-us > div > nav'); // nav 탭 선택하기
  for (let eh of ehList) {
    await eh.click(); // nav탭 안에 있는 요소 선택
    //   console.log(eh);
    let qnaCatecory = await eh.$eval('label.css-10kphwv', (e) => {
      return e.getAttribute('for');
    });

    let ulhList = await page.$$('li.css-1r412mj.e1u1v8kh3'); // nav 탭 안에 있는 요소를 선택한 상태에서 ul 클래스 선택
    for (let ulh of ulhList) {
      let question = await ulh.$eval('span.question-text', (e) => {
        return e.innerText;
      });
      let answer = await ulh.$eval('div.css-1nxzveq.e1u1v8kh0 p', (e) => {
        return e.innerText;
      });

      let qnaCategoryObj = {
        question: question,
        category: qnaCatecory,
        answer: answer,
      };
      resultsList.push(qnaCategoryObj);
    }
  }

  let etcList = await page.$$('label.css-1d73fhs'); // nav 탭 선택하기
  for (let eh of etcList) {
    console.log(eh);
    console.log(await eh.click()); // nav탭 안에 있는 요소 선택
    console.log(await (await eh.getProperty('for')).jsonValue()); //! 얘가 왜 undefined 가 나오지...?
    //  await (await eh.getProperty('for')).jsonValue(); 로 쓰면 undefined 가 나오던데...?
    let qnaCategory = await eh.evaluate((e) => {
      return e.getAttribute('for');
    });

    let ulhList = await page.$$('li.css-1r412mj.e1u1v8kh3'); // nav 탭 안에 있는 요소를 선택한 상태에서 ul 클래스 선택
    for (let ulh of ulhList) {
      let question = await ulh.$eval('span.question-text', (e) => {
        return e.innerText;
      });
      let answer = await ulh.$eval('div.css-1nxzveq.e1u1v8kh0 p', (e) => {
        return e.innerText;
      });

      let qnaCategoryObj = {
        question: question,
        category: qnaCategory,
        answer: answer,
      };
      resultsList.push(qnaCategoryObj); // 여기선 리스트에 넣지만 실제 서비스는 DB로 바로 들어감. 이땐 이 코드를 주석처리 하고 밑에 161번 코드라인을 실행하면 된다.
    }
  }
  console.log(resultsList);

  //   //* 만약 DB가 생긴다면 이 코드 실행하기
  //     await Promise.all(resultsList.map(results => {
  //         return await Help.create(results)
  //     }))
};

// //! 크롤링 코드 실행 하기
// crwaling();

//   //todo : cheerio로 크롤링
//   const qna = await axios({
//     // 크롤링을 원하는 페이지 URL

//     url: 'https://ohou.se/customer_center',
//     method: 'GET',
//     responseType: 'arraybuffer',
//   }) // 성공했을 경우
//     .then((response) => {
//       // 만약 content가 정상적으로 출력되지 않는다면, arraybuffer 타입으로 되어있기 때문일 수 있다.
//       // 현재는 string으로 반환되지만, 만약 다르게 출력된다면 뒤에 .toString() 메서드를 호출하면 된다.
//       let qnaList = [];
//       let qna = {};
//       const content = iconv.decode(response.data, 'UTF-8');
//       const $ = cheerio.load(content);
//       const divHeader = $('#question_list_section > ul > li');
//       $(divHeader).each((i, elem) => {
//         // console.log(elem);
//         const question = $(elem).find('.question-text').text();
//         console.log(question);

//         const answer = $(elem).find('.css-1nxzveq.e1u1v8kh0 p').text();
//         console.log(answer);
//         qna = {
//           question: question,
//           answer: answer,
//         };
//         qnaList.push(qna);
//       });
//       return qnaList;
//     });
//   res.status(200).json(qna);

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log(`${process.env.PORT || 3000} 포트에 접속 되었습니다.`);
});
