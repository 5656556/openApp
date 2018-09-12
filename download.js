import validateRules from './validateRules';  //常用的校验
import axios from 'utils/axios';  //axios请求
const ROOTPATH = process.env.apis.default.path; //请求后台的根路径
const GET_DOWNLOAD_URL =  `${ROOTPATH}/download/h5/v1/url`; //获取下载地址的接口
let androidDownloadUrl = '';  
let param = undefined;

/**
 * 尝试打开 APP, 如果失败就尝试下载
 * 会在完成后调用 callback, 并传递尝试结果
 * @param {function} callback
 * tryOpen(result=>console.log(result)
 */
function tryOpen (callback) {
  if(param){
    if (validateRules.isIOS()) {
      openApp(`com.finupgroup.finupplatform://${param}`, downloadApp);
    }
    if (validateRules.isAndroid()) {
      openApp(`open://com.finupgroup.platform/${param}`, downloadApp);
    }
  }
}

function openApp(openUrl, callback) {
  //检查app是否打开
  function checkOpen(cb) {
    let _clickTime = +(new Date());

    //是否打开
    function check(elsTime) {
      if (elsTime > 3000 || document.hidden || document.webkitHidden) {
        cb(1);
      } else {
        cb(0);
      }
    }
    //启动间隔20ms运行的定时器，并检测累计消耗时间是否超过3000ms，超过则结束
    let _count = 0, intHandle;
    intHandle = setInterval(function() {
      _count++;
      let elsTime = +(new Date()) - _clickTime;
      if (_count >= 100 || elsTime > 3000) {
        clearInterval(intHandle);
        check(elsTime);
      }
    }, 20);
  }

  //尝试唤醒app
  window.location.href = openUrl;
  if (callback) {
    //检查app是否打开，并且执行回调，一般回调都是下载app
    checkOpen(function(opened) {
      callback && callback(opened);
    });
  }
}

async function init(channel){
  let {code,result} = await axios.post(GET_DOWNLOAD_URL,{'UA':navigator.userAgent,channel:channel});
  if(code === '200'){
    androidDownloadUrl = result.downloadUrl;
    if(result.hasOwnProperty('jumpType')){
      let {jumpType,jumpPage,forwardUrl} = result;
      param = `{"jumpType":"${jumpType}","jumpId":"${jumpPage}","url":"${forwardUrl}"}`;
    }
    else {
      param = `{}`;
    }
  }
  else {
    androidDownloadUrl = `http://newbrand-image.finup-credit.com/newbrand/h5download/2018-05-23/app-release_aligned_signed_finupgroup.apk`;
  }

  return androidDownloadUrl;
}

function downloadApp() {
  if (validateRules.isIOS()) { //ios
    location.href = 'http://phobos.apple.com/WebObjects/MZStore.woa/wa/viewSoftware?mt=8&id=1289571562';
  }
  if (validateRules.isAndroid()) {
    if(androidDownloadUrl){
      window.location.href = androidDownloadUrl;
    }
  }
}

export {tryOpen,downloadApp,init};
