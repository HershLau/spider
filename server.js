var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    eventproxy = require('eventproxy');

require('superagent-proxy')(superagent);

var ep = new eventproxy();

var catchFirstUrl = 'http://www.tianyancha.com/search/',
    urlsArray = [],
    pageUrls = [],
    pageNum = 1

var proxy = 'http://114.215.103.121:8081';

var header = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
  'Host': 'www.dianping.com',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Mobile Safari/537.36',
  'Cache-Control': 'max-age=0',
  'Connection': 'keep-alive'
};

for(var i=1 ; i<= pageNum ; i++){
  pageUrls.push(`${catchFirstUrl}p${i}`);
}

// 主start程序
function start(){
  function onRequest(req, res){

    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});

    pageUrls.forEach(function(pageUrl){
      superagent.get(pageUrl)
          .end(function(err,pres){
            console.log('fetch ' + pageUrl + ' successful');
            if (err) {
              console.log(err);
            }

            var $ = cheerio.load(pres.text);
            var curPageUrls = $('.query_name');
            for(var i = 0 ; i < curPageUrls.length ; i++){
              var articleUrl = curPageUrls.eq(i).attr('href');
              urlsArray.push(articleUrl);
            }
            console.log('---------------------------')
            console.log(urlsArray)
            console.log(urlsArray[Math.floor(Math.random()*urlsArray.length)])

            superagent.get(urlsArray[Math.floor(Math.random()*urlsArray.length)])
                .end(function(err,sres){
                  // 常规的错误处理
                  if (err) {
                    console.log(err);
                    return;
                  }

                  var $ = cheerio.load(sres.text);

                  var nameWrapper = $('.f18.in-block.vertival-middle');
                  var telWrapper = $('.in-block.vertical-top.overflow-width.mr20').eq(0).children().eq(1);
                  var emailWrapper = $('.in-block.vertical-top.overflow-width.emailWidth').eq(0);
                  var hrefWrapper = $('.in-block.vertical-top.overflow-width.mr20').eq(1).children().eq(1);
                  var addressWrapper = $('.in-block.vertical-top.overflow-width.emailWidth').eq(1);

                  var name = nameWrapper.text()
                  var tel = telWrapper.text()
                  var email = emailWrapper.text()
                  var href = hrefWrapper.text()
                  var address = addressWrapper.text()

                  console.log('===========================================================================')
                  console.log(name)
                  console.log(tel)
                  console.log(email)
                  console.log(href)
                  console.log(address)

                });
          })
    })
  }

  http.createServer(onRequest).listen(3000);
}

function start2() {
  function onRequest(req, res){

    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});

    superagent.get('http://www.tianyancha.com/company/22822')
        .set('header', header)
        .proxy(proxy)
        .end(function(err,sres){
          if (err) {
            console.log(err)
          } else {
            var $ = cheerio.load(sres.text);

            var curPageUrls = $('.query_name');
            for(var i = 0 ; i < curPageUrls.length ; i++){
              var articleUrl = curPageUrls.eq(i).attr('href');
              urlsArray.push(articleUrl);
            }

            console.log(urlsArray)

            // var nameWrapper = $('.f18.in-block.vertival-middle');
            // var telWrapper = $('.in-block.vertical-top.overflow-width.mr20').eq(0).children().eq(1);
            // var emailWrapper = $('.in-block.vertical-top.overflow-width.emailWidth').eq(0);
            // var hrefWrapper = $('.in-block.vertical-top.overflow-width.mr20').eq(1).children().eq(1);
            // var addressWrapper = $('.in-block.vertical-top.overflow-width.emailWidth').eq(1);
            //
            // var name = nameWrapper.text()
            // var tel = telWrapper.text()
            // var email = emailWrapper.text()
            // var href = hrefWrapper.text()
            // var address = addressWrapper.text()
            //
            // console.log('===========================================================================')
            // console.log(name)
            // console.log(tel)
            // console.log(email)
            // console.log(href)
            // console.log(address)
          }
        })
  }
  http.createServer(onRequest).listen(3000);
}

exports.start= start;
exports.start2= start2;
