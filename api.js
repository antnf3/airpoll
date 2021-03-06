import { SERVICE_KEY, KAKAO_REST_KEY } from "./constants";
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

const IS_DEBUG = false;
export const weather = {
  // 초단기실황조회
  getForecastGrib: (base_date, base_time, nx, ny) => {
    if (IS_DEBUG) {
      console.log(
        `${WEATHER_BASE_URL}ForecastGrib?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&pageNo=1&numOfRows=8&_type=json`
      );
    }
    return fetch(
      `${WEATHER_BASE_URL}ForecastGrib?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&pageNo=1&numOfRows=8&_type=json`
    )
      .then(res => res.json())
      .then(json => {
        if (json.response.header.resultCode === "0000") {
          const items = json.response.body.items.item;
          if (items.length > 0) {
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
        } else {
          return null;
        }
      })
      .catch(err => console.log(err));
  },
  // 초단기예보조회
  getForecastTimeData: (base_date, base_time, nx, ny) => {
    if (IS_DEBUG) {
      console.log(
        `${WEATHER_BASE_URL}ForecastTimeData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&_type=json&numOfRows=40`
      );
    }
    return fetch(
      `${WEATHER_BASE_URL}ForecastTimeData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&_type=json&numOfRows=40`
    )
      .then(res => res.json())
      .then(json => {
        if (json.response.header.resultCode === "0000") {
          const items = json.response.body.items.item;
          if (items.length > 0) {
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
        } else {
          return null;
        }
      })
      .catch(err => console.log(err));
  },

  // 동네예보조회
  getForecastSpaceData: (base_date, base_time, nx, ny) => {
    if (IS_DEBUG) {
      console.log(
        `${WEATHER_BASE_URL}ForecastSpaceData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&numOfRows=60&_type=json`
      );
    }
    return fetch(`${WEATHER_BASE_URL}ForecastSpaceData?ServiceKey=${SERVICE_KEY}&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}&numOfRows=60&_type=json
    `)
      .then(res => res.json())
      .then(json => {
        if (json.response.header.resultCode === "0000") {
          const items = json.response.body.items.item;
          if (items.length > 0) {
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
  getCoord2address: (lon, lat) => {
    return fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lon}&y=${lat}&input_coord=WGS84`,
      {
        headers: new Headers({
          Authorization: `KakaoAK ${KAKAO_REST_KEY}`
        })
      }
    )
      .then(res => res.json())
      .then(json => {
        const { documents, meta } = json;
        if (meta.total_count === 1) {
          // console.log(documents[0].road_address); // 도로명주소(신)
          // console.log(documents[0].address);  // 지번주소(구)
          const {
            region_1depth_name,
            region_2depth_name,
            region_3depth_name
          } = documents[0].address;
          return [region_3depth_name, region_2depth_name, region_1depth_name];
        } else {
          return null;
        }
      })
      .catch(err => {
        console.error(err);
        return null;
      });
  },

  // TM 기준좌표 조회 측정소 정보 조회
  getTMStdrCrdnt: umdName => {
    if (IS_DEBUG) {
      console.log(
        `${SPACE_BASE_URL}getTMStdrCrdnt?umdName=${umdName}&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}`
      );
    }
    return fetch(
      `${SPACE_BASE_URL}getTMStdrCrdnt?umdName=${umdName}&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}`
    )
      .then(res => res.text())
      .then(data => {
        const xml = new XMLParser().parseFromString(data); // Assume xmlText contains the example XML
        const resultCode = xml.getElementsByTagName("resultCode")[0].value;
        const len = xml.getElementsByTagName("item").length;

        if (resultCode === "00" && len > 0) {
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
        } else {
          return null;
        }
      })
      .catch(err => {
        throw err;
      });
  },
  // 근접측정소 목록 조회(TM 좌표 이용)
  getNearbyMsrstnList: (tmX, tmY) => {
    if (IS_DEBUG) {
      console.log(
        `${SPACE_BASE_URL}getNearbyMsrstnList?tmX=${tmX}&tmY=${tmY}&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}`
      );
    }
    return fetch(
      `${SPACE_BASE_URL}getNearbyMsrstnList?tmX=${tmX}&tmY=${tmY}&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}`
    )
      .then(res => res.text())
      .then(data => {
        const xml = new XMLParser().parseFromString(data); // Assume xmlText contains the example XML
        const resultCode = xml.getElementsByTagName("resultCode")[0].value;
        const len = xml.getElementsByTagName("item").length;

        if (resultCode === "00" && len > 0) {
          let arrAddr = [];
          for (var i = 0; i < len; i++) {
            arrAddr.push({
              stationName: xml.getElementsByTagName("item")[i].children[0]
                .value,
              addr: xml.getElementsByTagName("item")[i].children[1].value,
              tm: xml.getElementsByTagName("item")[i].children[2].value
            });
          }
          return arrAddr;
        } else {
          return null;
        }
      })
      .catch(err => console.log(err));
  }
};

export const airpoll = {
  // 측정소별 실시간 측정정보 조회
  getMsrstnAcctoRltmMesureDnsty: stationName => {
    if (IS_DEBUG) {
      console.log(
        `${AIRPOLL_BASE_URL}getMsrstnAcctoRltmMesureDnsty?stationName=${stationName}&dataTerm=daily&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}&ver=1.3`
      );
    }
    return fetch(
      `${AIRPOLL_BASE_URL}getMsrstnAcctoRltmMesureDnsty?stationName=${stationName}&dataTerm=daily&pageNo=1&numOfRows=10&ServiceKey=${SERVICE_KEY}&ver=1.3`
    )
      .then(res => res.text())
      .then(data => {
        const xml = new XMLParser().parseFromString(data); // Assume xmlText contains the example XML
        const resultCode = xml.getElementsByTagName("resultCode")[0].value;
        const len = xml.getElementsByTagName("item").length;

        if (resultCode === "00" && len > 0) {
          let arrAddr = [];
          for (var i = 0; i < len; i++) {
            arrAddr.push({
              dataTime: xml.getElementsByTagName("item")[i].children[0].value,
              pm10Value: xml.getElementsByTagName("item")[i].children[6].value,
              pm25Value: xml.getElementsByTagName("item")[i].children[8].value
            });
          }
          return arrAddr;
        } else {
          return null;
        }
      })
      .catch(err => console.log(err));
  }
};
