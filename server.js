var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    xlsx = require('node-xlsx'),
    eventproxy = require('eventproxy'),
    fs = require('fs');

require('superagent-proxy')(superagent);

var ep = new eventproxy();

var catchFirstUrl = 'http://www.tianyancha.com/search/',
    infoArray = [],
    infoUrls = [],
    pageUrls = [],
    tasks = [],
    startDate = new Date(),
    endDate = null,
    pageCount = 0,
    pageNum = 5;

var proxy = 'http://114.215.103.121:8081';

var header = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
  'Host': 'www.dianping.com',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
};

for (var i = 1; i <= pageNum; i++) {
  pageUrls.push(`${catchFirstUrl}p${i}`);
}

function unique(val, arr) {
  for (var i = 0; i < arr.length; i++) {
    if (val[0] == arr[0]) {
      return
    }
  }
  arr.push(val)
}

var firstTask = function (cb) {
  console.log(pageUrls[pageCount])
  superagent.get(pageUrls[pageCount])
      .end(function (err, pres) {
        console.log('fetch ' + pageUrls[pageCount] + ' successful');
        if (err) {
          console.error(err);
        }

        var $ = cheerio.load(pres.text);
        var curPageUrls = $('.query_name');
        for (var i = 0; i < curPageUrls.length; i++) {
          var infoUrl = curPageUrls.eq(i).attr('href');
          infoUrls.push(infoUrl);
        }
        cb(null, ++pageCount)
      })
};

var restTask = function (pageCount, cb) {
  console.log(pageUrls[pageCount])
  console.log('---------------')
  superagent.get(pageUrls[pageCount])
      .end(function (err, pres) {
        console.log('fetch ' + pageUrls[pageCount] + ' successful');
        if (err) {
          console.error(err);
        }

        var $ = cheerio.load(pres.text);
        var curPageUrls = $('.query_name');
        for (var i = 0; i < curPageUrls.length; i++) {
          var infoUrl = curPageUrls.eq(i).attr('href');
          infoUrls.push(infoUrl);
        }
        cb(null, ++pageCount)
      })
};

tasks.push(firstTask);

for (var i = 0; i < pageUrls.length - 1; i++) {
  tasks.push(restTask)
}

console.log(tasks)

async.waterfall(tasks, function (err, result) {
  if (err) {
    console.error(err)
  }
  console.log('0000000000000000000000000000')
  console.log(infoUrls)
});

// ep.after('FetchContent', pageUrls.length * 20, function (infoUrls) {
//   console.log('-----------------------------------------------------------------------------------')
//   var concurrencyCount = 0;
//
//   var fetchInfo = function (url, callback) {
//     var delay = parseInt((Math.random() * 10000000) % 2000, 10);
//     concurrencyCount++;
//     console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
//
//     superagent.get(url)
//         .end(function (err, sres) {
//           // 常规的错误处理
//           if (err) {
//             console.error(err);
//             return;
//           }
//
//           var $ = cheerio.load(sres.text);
//
//           var nameWrapper = $('.f18.in-block.vertival-middle');
//           var telWrapper = $('.in-block.vertical-top.overflow-width.mr20').eq(0).children().eq(1);
//           var emailWrapper = $('.in-block.vertical-top.overflow-width.emailWidth').eq(0);
//           var hrefWrapper = $('.in-block.vertical-top.overflow-width.mr20').eq(1).children().eq(1);
//           var addressWrapper = $('.in-block.vertical-top.overflow-width.emailWidth').eq(1);
//
//           var name = nameWrapper.text()
//           var tel = telWrapper.text()
//           var email = emailWrapper.text()
//           var href = hrefWrapper.text()
//           var address = addressWrapper.text()
//
//           var row = [];
//           row.push(name);
//           row.push(tel);
//           row.push(email);
//           row.push(href);
//           row.push(address);
//
//           unique(row, infoArray);
//         });
//
//     setTimeout(function () {
//       concurrencyCount--;
//       callback(null, url + ' Call back content');
//     }, delay);
//   };
//
//   async.mapLimit(infoUrls, 1, function (url, callback) {
//     fetchInfo(url, callback)
//   }, function (err, result) {
//     if (err) {
//       console.error(err)
//     } else {
//       console.log('final:');
//       console.log(result);
//       console.log(infoArray);
//       endDate = new Date();
//       infoArray.unshift(['公司名', '电话', '邮箱', '网址', '地址'])
//       var buffer = xlsx.build([{name: "companyInfo", data: infoArray}]);
//       fs.writeFileSync('./file/company_info.xlsx', buffer);
//       console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
//       console.log('爬虫统计结果')
//       console.log('1、爬虫开始时间：' + startDate)
//       console.log('2、爬虫结束时间：' + endDate)
//       console.log('3、耗时：' + (endDate - startDate) + 'ms' + ' --> ' + (Math.round((endDate - startDate) / 1000 / 60 * 100) / 100) + 'min')
//       console.log('4、爬虫遍历的企业数目：' + (infoArray.length - 1))
//       console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++')
//     }
//   })
// });

// pageUrls.forEach(function (pageUrl) {
//   superagent.get(pageUrl)
//       .end(function (err, pres) {
//         console.log('fetch ' + pageUrl + ' successful');
//         if (err) {
//           console.error(err);
//         }
//
//         var $ = cheerio.load(pres.text);
//         var curPageUrls = $('.query_name');
//         for (var i = 0; i < curPageUrls.length; i++) {
//           var infoUrl = curPageUrls.eq(i).attr('href');
//           ep.emit('FetchContent', infoUrl);
//         }
//       })
// });



