var http = require("http"),
    url = require("url"),
    superagent = require("superagent"),
    cheerio = require("cheerio"),
    async = require("async"),
    eventproxy = require('eventproxy');

var ep = new eventproxy();

var catchFirstUrl = 'https://www.tianyancha.com/search/',
    deleteRepeat = {},
    urlsArray = [],
    catchDate = [],
    pageUrls = [],
    pageNum = 2,
    startDate = new Date(),
    endDate = false;

for(var i=1 ; i<= pageNum ; i++){
  pageUrls.push(`${catchFirstUrl}p${i}`);
}

// 主start程序
function start(){
  function onRequest(req, res){
    // 设置字符编码(去掉中文会乱码)
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
    // 当所有 'BlogArticleHtml' 事件完成后的回调触发下面事件
    ep.after('BlogArticleHtml',pageUrls.length,function(articleUrls){

      // 获取 BlogPageUrl 页面内所有文章链接
      for(var i = 0 ; i < articleUrls.length ; i++){
        res.write(articleUrls[i] +'<br/>');
      }

      //控制并发数
      var curCount = 0;
      var reptileMove = function(url,callback){
        //延迟毫秒数
        var delay = parseInt((Math.random() * 30000000) % 1000, 10);
        curCount++;
        console.log('现在的并发数是', curCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');

        superagent.get(url)
            .end(function(err,sres){
              // 常规的错误处理
              if (err) {
                console.log(err);
                return;
              }

              //sres.text 里面存储着请求返回的 html 内容
              var $ = cheerio.load(sres.text);
              var companyInfoDiv = $('.company_header_width');
              console.log('--------------------')
              console.log(companyInfoDiv)


            });

        setTimeout(function() {
          curCount--;
          callback(null,url +'Call back content');
        }, delay);
      };

      // 使用async控制异步抓取
      // mapLimit(arr, limit, iterator, [callback])
      // 异步回调
      async.mapLimit(articleUrls, 5 ,function (url, callback) {
        reptileMove(url, callback);
      }, function (err,result) {
        endDate = new Date();

        console.log('final:');
        console.log(result);
      });
    });

    // 轮询 所有文章列表页
    pageUrls.forEach(function(pageUrl){
      superagent.get(pageUrl)
          .end(function(err,pres){
            console.log('fetch ' + pageUrl + ' successful');
            res.write('fetch ' + pageUrl + ' successful<br/>');
            // 常规的错误处理
            if (err) {
              console.log(err);
            }
            // pres.text 里面存储着请求返回的 html 内容，将它传给 cheerio.load 之后
            // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
            // 剩下就都是 jquery 的内容了
            var $ = cheerio.load(pres.text);
            var curPageUrls = $('.query_name');
            for(var i = 0 ; i < curPageUrls.length ; i++){
              var articleUrl = curPageUrls.eq(i).attr('href');
              urlsArray.push(articleUrl);
              // 相当于一个计数器
              ep.emit('BlogArticleHtml', articleUrl);
            }
          })
    })
  }

  http.createServer(onRequest).listen(3000);
}

function start2() {
  function onRequest(req, res){

    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});

    superagent.get('http://www.tianyancha.com/company/22822')
        .end(function(err,pres){
          res.write('fetch successful<br/>');
          // 常规的错误处理
          if (err) {
            console.log(err);
          }
          var $ = cheerio.load(pres.text);

          var nameWrapper = $('.f18.in-block.vertival-middle');
          var telWrapper = $('.in-block.vertical-top.overflow-width.mr20');
          var emailWrapper = $('.in-block.vertical-top.overflow-width.emailWidth');
          // var hrefWrapper = $('.in-block.vertical-top.overflow-width.mr20')[1].children()[1];
          // var addressWrapper = $('.in-block.vertical-top.overflow-width.emailWidth')[1];

          var name = nameWrapper.text()
          var tel = telWrapper.text()
          var email = emailWrapper.text()
          // var href = hrefWrapper.text()
          // var address = addressWrapper.text()

          console.log(name)
          console.log(tel)
          console.log(email)
          // console.log(address)
        })
  }
  http.createServer(onRequest).listen(3000);
}

exports.start= start;
exports.start2= start2;
