const express = require('express');
const app = express();
const router = express.Router();
const axios = require('axios');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// //todo 고객 센터 크롤링
app.get('/api', async (req, res) => {
  const itemInfo = await axios({
    // 크롤링을 원하는 페이지 URL
    url: url,
    method: 'GET',
    responseType: 'arraybuffer',
  });
});

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log(`${process.env.PORT || 3000} 포트에 접속 되었습니다.`);
});
