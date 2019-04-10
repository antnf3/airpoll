import React from "react";
import { StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo";

import Loading from "./components/Loading";
import Header from "./components/Header";
import Title from "./components/Title";
import Content from "./components/Content";
import Airpollution from "./components/Airpollution";
import Ads from "./components/Ads";

import { weather, airspace, airpoll } from "./api";
import spaceMap from "./spaceMap";
import {
  dfs_xy_conv,
  getTimeData,
  getGribTimeData,
  getSpaceTimeDate,
  plusObj
} from "./utils";

let virtualState = {};
export default class App extends React.Component {
  state = {
    isLoaded: false,
    error: null,
    temperature: 0,
    name: "...",
    pm10: 0,
    pm25: 0,
    pm10text: "",
    pm25text: "",
    stationName: ""
  };

  componentDidMount() {
    this._getGeolocation();
  }

  // 위치정보
  _getGeolocation = () => {
    this.setState({
      isLoaded: false
    });

    navigator.geolocation.getCurrentPosition(
      position => {
        this._getWeather(position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.log(error);
        this.setState({
          error: error
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      }
    );
  };

  _getWeather = async (lat, lon) => {
    const xy = dfs_xy_conv("toXY", lat, lon);
    const selMap = spaceMap.getSpaceName(xy.x, xy.y);
    const timeData = getTimeData();
    const gribTimeData = getGribTimeData();
    const spaceTimeDate = getSpaceTimeDate();

    try {
      // 초단기실황조회 10분마다 갱신
      const objGrib = await weather.getForecastGrib(
        gribTimeData.yyyyMMdd,
        gribTimeData.time,
        xy.x,
        xy.y
      );

      // 초단기예보조회
      const arrTimeData = await weather.getForecastTimeData(
        timeData.yyyyMMdd,
        timeData.time,
        xy.x,
        xy.y
      );

      //동네예보조회 3시간 간격
      const objSpaceData = await weather.getForecastSpaceData(
        spaceTimeDate.yyyyMMdd,
        spaceTimeDate.time,
        xy.x,
        xy.y
      );

      //let cntT1h = plusObj(arrTimeData, objSpaceData, "T1H");
      let vT1h = arrTimeData.T1H.reduce((acc, cur) => {
        acc.push({
          category: "T1H",
          fcstDate: cur.fcstDate,
          fcstTime: cur.fcstTime,
          fcstValue: cur.fcstValue
        });
        return acc;
      }, []);

      vT1h = objSpaceData.T1H.reduce((acc, cur) => {
        acc.push({
          category: "T1H",
          fcstDate: cur.fcstDate,
          fcstTime: cur.fcstTime,
          fcstValue: cur.fcstValue
        });
        return acc;
      }, vT1h);

      let cntT1h = vT1h.reduce((acc, cur) => {
        let cnt = 0;
        for (let i = 0, len = acc.length; i < len; i++) {
          if (
            acc[i].fcstDate == cur.fcstDate &&
            acc[i].fcstTime == cur.fcstTime
          ) {
            cnt++;
          }
        }
        cnt < 1 ? acc.push(cur) : acc;
        return acc;
      }, []);

      //
      //let cntSky = plusObj(arrTimeData, objSpaceData, "SKY");

      let vSky = arrTimeData.SKY.reduce((acc, cur) => {
        acc.push({
          category: "SKY",
          fcstDate: cur.fcstDate,
          fcstTime: cur.fcstTime,
          fcstValue: cur.fcstValue
        });
        return acc;
      }, []);
      vSky = objSpaceData.SKY.reduce((acc, cur) => {
        acc.push({
          category: "SKY",
          fcstDate: cur.fcstDate,
          fcstTime: cur.fcstTime,
          fcstValue: cur.fcstValue
        });
        return acc;
      }, vSky);

      let cntSky = vSky.reduce((acc, cur) => {
        let cnt = 0;
        for (let i = 0, len = acc.length; i < len; i++) {
          if (
            acc[i].fcstDate == cur.fcstDate &&
            acc[i].fcstTime == cur.fcstTime
          ) {
            cnt++;
          }
        }
        cnt < 1 ? acc.push(cur) : acc;
        return acc;
      }, []);

      //
      //let cntPty = plusObj(arrTimeData, objSpaceData, "PTY");
      let vPty = arrTimeData.PTY.reduce((acc, cur) => {
        acc.push({
          category: "PTY",
          fcstDate: cur.fcstDate,
          fcstTime: cur.fcstTime,
          fcstValue: cur.fcstValue
        });
        return acc;
      }, []);
      vPty = objSpaceData.PTY.reduce((acc, cur) => {
        acc.push({
          category: "PTY",
          fcstDate: cur.fcstDate,
          fcstTime: cur.fcstTime,
          fcstValue: cur.fcstValue
        });
        return acc;
      }, vPty);

      let cntPty = vPty.reduce((acc, cur) => {
        let cnt = 0;
        for (let i = 0, len = acc.length; i < len; i++) {
          if (
            acc[i].fcstDate == cur.fcstDate &&
            acc[i].fcstTime == cur.fcstTime
          ) {
            cnt++;
          }
        }
        cnt < 1 ? acc.push(cur) : acc;
        return acc;
      }, []);

      // TM 기준좌표 조회 측정소 정보 조회 => 오래걸림
      const arrTmSpace = await airspace.getTMStdrCrdnt(selMap);

      // 근접측정소 목록 조회(TM 좌표 이용)
      const arrNearMsrs = await airspace.getNearbyMsrstnList(
        arrTmSpace[0].tmX,
        arrTmSpace[0].tmY
      );

      // 측정소별 실시간 측정정보 조회
      const arrRealMesure = await airpoll.getMsrstnAcctoRltmMesureDnsty(
        arrNearMsrs[0].stationName
      );

      virtualState = {
        isLoaded: true,
        t1h: objGrib.T1H[0].obsrValue,
        sky: arrTimeData.SKY[0].fcstValue,
        rn1: arrTimeData.RN1[0].fcstValue,
        skyStatus: spaceMap.getSkyStatus(arrTimeData.SKY[0].fcstValue),
        rainStatus: spaceMap.getPtyStatus(arrTimeData.PTY[0].fcstValue),
        name: selMap,
        content2: { SKY: cntSky, PTY: cntPty, T1H: cntT1h },
        pm10: arrRealMesure[0].pm10Value,
        pm25: arrRealMesure[0].pm25Value,
        error: null
      };
      this._setState(virtualState);
    } catch (e) {
      console.log(e);
    }
  };

  _setState = virtualState => {
    this.setState(virtualState);
  };

  render() {
    const {
      isLoaded,
      t1h,
      name,
      pm10,
      pm25,
      skyStatus,
      rainStatus,
      content2
    } = this.state;

    if (!isLoaded) {
      return (
        <LinearGradient colors={["#89EAF1", "#BDCDD9"]} style={styles.loading}>
          <Loading />
        </LinearGradient>
      );
    } else {
      return (
        <>
          <LinearGradient
            colors={["#89EAF1", "#BDCDD9"]}
            style={styles.container}
          >
            <StatusBar barStyle={"light-content"} />
            <Header
              isLoaded={isLoaded}
              name={name}
              getGeolocation={this._getGeolocation}
            />
            <Title t1h={t1h} skyStatus={skyStatus} rainStatus={rainStatus} />
            <Content isLoaded={isLoaded} content2={content2} />

            <Airpollution pm10={pm10} pm25={pm25} />
          </LinearGradient>
          <Ads />
        </>
      );
    }
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: "white"
  }
});
