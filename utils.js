import { Dimensions, Platform, PixelRatio } from "react-native";

const { width } = Dimensions.get("window");

const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기1준점 Y좌표(GRID)

// 기상청 홈페이지에서 발췌한 변환 함수
// LCC DFS 좌표변환을 위한 기초 자료
// LCC DFS 좌표변환 ( code :
//          "toXY"(위경도->좌표, v1:위도, v2:경도),
//          "toLL"(좌표->위경도,v1:x, v2:y) )

export const dfs_xy_conv = (code, v1, v2) => {
  var DEGRAD = Math.PI / 180.0;
  var RADDEG = 180.0 / Math.PI;

  var re = RE / GRID;
  var slat1 = SLAT1 * DEGRAD;
  var slat2 = SLAT2 * DEGRAD;
  var olon = OLON * DEGRAD;
  var olat = OLAT * DEGRAD;

  var sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  var sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  var ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  var rs = {};
  if (code == "toXY") {
    rs["lat"] = v1;
    rs["lng"] = v2;
    var ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    var theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs["x"] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs["y"] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  } else {
    rs["x"] = v1;
    rs["y"] = v2;
    var xn = v1 - XO;
    var yn = ro - v2 + YO;
    ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) -ra;
    var alat = Math.pow((re * sf) / ra, 1.0 / sn);
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) -theta;
      } else theta = Math.atan2(xn, yn);
    }
    var alon = theta / sn + olon;
    rs["lat"] = alat * RADDEG;
    rs["lng"] = alon * RADDEG;
  }
  return rs;
};

// 날짜, 시간 가져오기
export const getTimeData = () => {
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  let date = today.getDate();
  let hours = today.getHours();
  let minutes = today.getMinutes();

  hours = hours === 0 ? 24 : hours;
  hours -= 1;
  if (minutes > 30) {
    minutes = 30;
  } else if (minutes < 30) {
    minutes = 30;
  }
  if (hours === 23) {
    today.setDate(today.getDate() - 1);
  }

  month = today.getMonth() + 1;
  date = today.getDate();

  month = month < 10 ? `0${month}` : month;
  date = date < 10 ? `0${date}` : date;
  hours = hours < 10 ? `0${hours}` : hours;

  return {
    yyyyMMdd: `${year}${month}${date}`,
    time: `${hours}${minutes}`
  };
};

// 초단기 실황 날짜, 시간 가져오기
export const getGribTimeData = () => {
  const today = new Date();
  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let date = today.getDate();
  let hours = today.getHours();
  let minutes = today.getMinutes();

  if (minutes < 25) {
    hours = hours === 0 ? 24 : hours;
    hours -= 1;
  }

  if (hours === 23 && minutes < 25) {
    today.setDate(today.getDate() - 1);
  }
  month = today.getMonth() + 1;
  date = today.getDate();

  month = month < 10 ? `0${month}` : month;
  date = date < 10 ? `0${date}` : date;
  hours = hours < 10 ? `0${hours}` : hours;

  return {
    yyyyMMdd: `${year}${month}${date}`,
    time: `${hours}00`
  };
};

// 동네예보조회
export const getSpaceTimeDate = () => {
  // 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
  const arrTime = [2, 5, 8, 11, 14, 17, 20, 23];
  const today = new Date();
  const hours = today.getHours();
  const minutes = today.getMinutes();
  let chagneHour;

  if (minutes < 10) {
    if (hours <= 2) {
      chagneHour = 23;
      today.setDate(today.getDate() - 1);
    } else {
      chagneHour = arrTime.filter(time => time < hours);
    }
  } else {
    if (hours <= 2) {
      today.setDate(today.getDate() - 1);
    }
    chagneHour = arrTime.filter(time => time <= hours);
  }
  chagneHour = chagneHour[chagneHour.length - 1] || 23;
  chagneHour = chagneHour < 10 ? `0${chagneHour}00` : `${chagneHour}00`;

  const year = today.getFullYear();
  let month = today.getMonth() + 1;
  let date = today.getDate();

  month = month < 10 ? `0${month}` : month;
  date = date < 10 ? `0${date}` : date;
  return {
    yyyyMMdd: `${year}${month}${date}`,
    time: chagneHour
  };
};

// based on iphone 5s's scale
const scale = width / 320;
export const normalize = size => {
  const newSize = size * scale;
  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 3;
  }
};

export const plusObj = (obj1, obj2, deli) => {
  return new Promise((resolve, reject) => {
    let vT1h = obj1[deli].reduce((acc, cur) => {
      acc.push({
        category: deli,
        fcstDate: cur.fcstDate,
        fcstTime: cur.fcstTime,
        fcstValue: cur.fcstValue
      });
      return acc;
    }, []);

    vT1h = obj2[deli].reduce((acc, cur) => {
      acc.push({
        category: deli,
        fcstDate: cur.fcstDate,
        fcstTime: cur.fcstTime,
        fcstValue: cur.fcstValue
      });
      return acc;
    }, vT1h);

    const abc = arrMerge(vT1h);

    resolve(abc);
  });
};

const arrMerge = arrObj => {
  const uniqArr = arrObj.reduce((acc, cur) => {
    let cnt = 0;
    for (let i = 0, len = acc.length; i < len; i++) {
      if (acc[i].fcstDate == cur.fcstDate && acc[i].fcstTime == cur.fcstTime) {
        cnt++;
      }
    }
    cnt < 1 ? acc.push(cur) : acc;
    return acc;
  }, []);
  return uniqArr;
};
