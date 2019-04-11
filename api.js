import { SERVICE_KEY } from "./constants";
import XMLParser from "react-xml-parser";

// 날씨 API
const WEATHER_BASE_URL =
  "http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/";
// 장소 API
const SPACE_BASE_URL =
  "http://openapi.airkorea.or.kr/openapi/services/rest/MsrstnInfoInqireSvc/";
// 미세먼지 API
const AIRPOLL_BASE_URL =
  "http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/";

export const weather = {
  // 초단기실황조회
  getForecastGrib: (base_date, base_time, nx, ny) => {
    console.log(
      `${WEATHER_BASE_URL}ForecastGrib?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&pageNo=1&numOfRows=8&_type=json`
    );
    return fetch(
      `${WEATHER_BASE_URL}ForecastGrib?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&pageNo=1&numOfRows=8&_type=json`
    )
      .then(res => res.json())
      .then(json => {
        if (json.response.header.resultCode === "0000") {
          const items = json.response.body.items.item;
          const T1H = items.filter(item => {
            return item["category"] === "T1H"; // 기온
          });
          const RN1 = items.filter(item => {
            return item["category"] === "RN1"; // 1시간 강수량
          });
          const PTY = items.filter(item => {
            return item["category"] === "PTY"; // 강수형태
          });
          return { T1H, RN1, PTY };
        } else {
          return null;
        }
      })
      .catch(err => console.log(err));
  },
  // 초단기예보조회
  getForecastTimeData: (base_date, base_time, nx, ny) => {
    // console.log(
    //   `${WEATHER_BASE_URL}ForecastTimeData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&_type=json&numOfRows=40`
    // );
    return fetch(
      `${WEATHER_BASE_URL}ForecastTimeData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&_type=json&numOfRows=40`
    )
      .then(res => res.json())
      .then(json => {
        //console.log(json);
        if (json.response.header.resultCode === "0000") {
          const items = json.response.body.items.item;
          const T1H = items.filter(item => {
            return item["category"] === "T1H";
          });
          const SKY = items.filter(item => {
            return item["category"] === "SKY";
          });
          const RN1 = items.filter(item => {
            return item["category"] === "RN1";
          });
          const PTY = items.filter(item => {
            return item["category"] === "PTY";
          });
          // const LGT = items.filter(item => {
          //   return item["category"] === "LGT";
          // });
          return { T1H, SKY, PTY, RN1 };
        } else {
          return null;
        }
      })
      .catch(err => console.log(err));
  },

  // 동네예보조회
  getForecastSpaceData: (base_date, base_time, nx, ny) => {
    // console.log(
    //   `${WEATHER_BASE_URL}ForecastSpaceData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&numOfRows=60&_type=json`
    // );
    return fetch(`${WEATHER_BASE_URL}ForecastSpaceData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&numOfRows=60&_type=json
    `)
      .then(res => res.json())
      .then(json => {
        if (json.response.header.resultCode === "0000") {
          const items = json.response.body.items.item;
          const T1H = items.filter(item => {
            return item["category"] === "T3H"; // 기온
          });
          const SKY = items.filter(item => {
            return item["category"] === "SKY";
          });
          const PTY = items.filter(item => {
            return item["category"] === "PTY"; // 강수형태
          });
          return { T1H, SKY, PTY };
        } else {
          return null;
        }
      })
      .catch(err => console.log(err));
  },
  // 예보버전조회
  getForecastVersionCheck: () => console.log("예보버전조회")
};

export const airspace = {
  // TM 기준좌표 조회 측정소 정보 조회
  getTMStdrCrdnt: umdName => {
    // console.log(
    //   `${SPACE_BASE_URL}getTMStdrCrdnt?umdName=${umdName}&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}`
    // );
    return fetch(
      `${SPACE_BASE_URL}getTMStdrCrdnt?umdName=${umdName}&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}`
    )
      .then(res => res.text())
      .then(data => {
        const xml = new XMLParser().parseFromString(data); // Assume xmlText contains the example XML
        const len = xml.getElementsByTagName("item").length;
        let arrAddr = [];
        for (var i = 0; i < len; i++) {
          arrAddr.push({
            sidoName: xml.getElementsByTagName("item")[i].children[0].value,
            sggName: xml.getElementsByTagName("item")[i].children[1].value,
            umdName: xml.getElementsByTagName("item")[i].children[2].value,
            tmX: xml.getElementsByTagName("item")[i].children[3].value,
            tmY: xml.getElementsByTagName("item")[i].children[4].value
          });
        }
        return arrAddr;
      })
      .catch(err => console.log(err));
  },
  // 근접측정소 목록 조회(TM 좌표 이용)
  getNearbyMsrstnList: (tmX, tmY) =>
    fetch(
      `${SPACE_BASE_URL}getNearbyMsrstnList?tmX=${tmX}&tmY=${tmY}&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}`
    )
      .then(res => res.text())
      .then(data => {
        const xml = new XMLParser().parseFromString(data); // Assume xmlText contains the example XML
        const len = xml.getElementsByTagName("item").length;
        let arrAddr = [];
        for (var i = 0; i < len; i++) {
          arrAddr.push({
            stationName: xml.getElementsByTagName("item")[i].children[0].value,
            addr: xml.getElementsByTagName("item")[i].children[1].value,
            tm: xml.getElementsByTagName("item")[i].children[2].value
          });
        }
        return arrAddr;
      })
      .catch(err => console.log(err))
};

export const airpoll = {
  // 측정소별 실시간 측정정보 조회
  getMsrstnAcctoRltmMesureDnsty: stationName => {
    // console.log(
    //   `${AIRPOLL_BASE_URL}getMsrstnAcctoRltmMesureDnsty?stationName=${stationName}&dataTerm=daily&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}&ver=1.3`
    // );
    return fetch(
      `${AIRPOLL_BASE_URL}getMsrstnAcctoRltmMesureDnsty?stationName=${stationName}&dataTerm=daily&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}&ver=1.3`
    )
      .then(res => res.text())
      .then(data => {
        const xml = new XMLParser().parseFromString(data); // Assume xmlText contains the example XML
        const len = xml.getElementsByTagName("item").length;
        let arrAddr = [];
        for (var i = 0; i < len; i++) {
          arrAddr.push({
            dataTime: xml.getElementsByTagName("item")[i].children[0].value,
            pm10Value: xml.getElementsByTagName("item")[i].children[6].value,
            pm25Value: xml.getElementsByTagName("item")[i].children[8].value
          });
        }
        return arrAddr;
      })
      .catch(err => console.log(err));
  }
};
