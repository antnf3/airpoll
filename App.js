import React from "react";
import {
  StyleSheet,
  StatusBar,
  ScrollView,
  RefreshControl,
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ToastAndroid
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  plusObj,
  normalize
} from "./utils";

const objErrMsg = {
  E_LOCATION_UNAUTHORIZED:
    "위치 서비스를 사용할 권한이 없습니다. \n\t\t\t권한 변경 후 다시 시도해 주세요",
  E_LOCATION_TIMEOUT:
    "위치 요청 시간이 초과되었습니다. \n\t\t다시 시도해 주세요",
  "Network request failed":
    "네트워크 연결이 원할하지 않습니다.\n다시 시도해 주세요"
};

let virtualState = {};
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButton.bind(this);
  }
  state = {
    isLoaded: false,
    isError: false,
    isWeatherError: false,
    isAirpollError: false,
    errorCd: "",
    errorMsg: "",
    temperature: 0,
    name: "...",
    pm10: 0,
    pm25: 0,
    pm10text: "",
    pm25text: "",
    stationName: "",
    refreshing: false
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this._getGeolocation();
  }

  // 이벤트 해제
  componentWillUnmount() {
    this.exitApp = false;
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  // 이벤트 동작
  handleBackButton = () => {
    // 2000(2초) 안에 back 버튼을 한번 더 클릭 할 경우 앱 종료
    if (this.exitApp == undefined || !this.exitApp) {
      ToastAndroid.show("한번 더 누르시면 종료됩니다.", ToastAndroid.SHORT);
      this.exitApp = true;

      this.timeout = setTimeout(
        () => {
          this.exitApp = false;
        },
        2000 // 2초
      );
    } else {
      clearTimeout(this.timeout);

      BackHandler.exitApp(); // 앱 종료
    }
    return true;
  };

  // 위치정보
  _getGeolocation = () => {
    this.setState({ refreshing: true });
    navigator.geolocation.getCurrentPosition(
      position => {
        this._getWeather(position.coords.latitude, position.coords.longitude);
      },
      error => {
        this.setState({
          isError: true,
          errorCd: error.code,
          errorMsg:
            objErrMsg[error.code] || "현재 서비스를 이용 할 수 없습니다."
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
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
      const addrNm = await airspace.getCoord2address(lon, lat);

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

      let cntT1h;
      let cntSky;
      let cntPty;
      // 날씨정보 api 에러일때...
      let isWeatherError = false;
      if (objGrib === null || arrTimeData === null || objSpaceData === null) {
        isWeatherError = true;
      } else {
        cntT1h = await plusObj(arrTimeData, objSpaceData, "T1H");
        cntSky = await plusObj(arrTimeData, objSpaceData, "SKY");
        cntPty = await plusObj(arrTimeData, objSpaceData, "PTY");
      }

      // TM 기준좌표 조회 측정소 정보 조회 => 오래걸림
      //const arrTmSpace = await airspace.getTMStdrCrdnt(selMap);
      const arrTmSpace =
        (await airspace.getTMStdrCrdnt(addrNm[0])) ||
        (await airspace.getTMStdrCrdnt(addrNm[1])) ||
        (await airspace.getTMStdrCrdnt(addrNm[2])) ||
        (await airspace.getTMStdrCrdnt(selMap));

      // 근접측정소 목록 조회(TM 좌표 이용)
      const arrNearMsrs =
        arrTmSpace &&
        (await airspace.getNearbyMsrstnList(
          arrTmSpace[0].tmX,
          arrTmSpace[0].tmY
        ));

      // 측정소별 실시간 측정정보 조회
      const arrRealMesure =
        arrNearMsrs &&
        (await airpoll.getMsrstnAcctoRltmMesureDnsty(
          arrNearMsrs[0].stationName
        ));

      // 미세먼지 api 오류 일때...
      let isAirpollError = false;
      if (
        arrTmSpace === null ||
        arrNearMsrs === null ||
        arrRealMesure === null
      ) {
        isAirpollError = true;
      }

      virtualState = {
        isLoaded: true,
        isError: false,
        isWeatherError: isWeatherError,
        isAirpollError: isAirpollError,
        errorCd: "",
        errorMsg: "",
        t1h: objGrib ? objGrib.T1H[0].obsrValue : 0,
        skyStatus: arrTimeData
          ? spaceMap.getSkyStatus(arrTimeData.SKY[0].fcstValue)
          : {},
        rainStatus: arrTimeData
          ? spaceMap.getPtyStatus(arrTimeData.PTY[0].fcstValue)
          : {},
        name: addrNm[0] || addrNm[1] || addrNm[2],
        content2: { SKY: cntSky, PTY: cntPty, T1H: cntT1h },
        pm10: arrRealMesure ? arrRealMesure[0].pm10Value : "0",
        pm25: arrRealMesure ? arrRealMesure[0].pm25Value : "0",
        refreshing: false
      };
      this._setState(virtualState);
    } catch (error) {
      //console.log(error);
      //console.log(error.code);
      this.setState({
        isError: true,
        errorCd: error.code,
        errorMsg:
          "네트워크 연결이 원할 하지 않습니다. 잠시 후 다시 시도해주세요."
      });
    }
  };

  _setState = virtualState => {
    this.setState(virtualState);
  };

  _onRefresh() {
    this.setState({ refreshing: true });
    this._getGeolocation();
  }

  render() {
    const {
      isLoaded,
      isError,
      isWeatherError,
      isAirpollError,
      errorCd,
      errorMsg,
      t1h,
      name,
      pm10,
      pm25,
      skyStatus,
      rainStatus,
      content2
    } = this.state;

    if (isError) {
      return (
        <>
          <View
            style={{
              flex: 1,
              marginTop: 140,
              alignItems: "center",
              justifyContent: "flex-start"
            }}
          >
            {/* <Text>{`${errorCd}: `}</Text> */}
            <Text style={{ color: "gray" }}>{errorMsg}</Text>
            <TouchableOpacity onPressOut={this._getGeolocation}>
              <MaterialCommunityIcons
                color="blue"
                size={normalize(40)}
                name={"refresh"}
              />
            </TouchableOpacity>
          </View>
          <Ads />
        </>
      );
    } else if (!isLoaded) {
      return (
        <>
          <LinearGradient
            colors={["#89EAF1", "#BDCDD9"]}
            style={styles.loading}
          >
            <Loading />
          </LinearGradient>
          <Ads />
        </>
      );
    } else {
      return (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh.bind(this)}
                progressViewOffset={200}
              />
            }
          >
            <StatusBar barStyle={"light-content"} />
            <LinearGradient
              colors={["#89EAF1", "#BDCDD9"]}
              style={styles.container}
            >
              {!isWeatherError ? (
                <>
                  <Header name={name} getGeolocation={this._getGeolocation} />
                  <Title
                    t1h={t1h}
                    skyStatus={skyStatus}
                    rainStatus={rainStatus}
                  />
                  <Content content2={content2} />
                </>
              ) : (
                <>
                  <Header name={""} getGeolocation={this._getGeolocation} />
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Text style={{ color: "gray" }}>
                      날씨정보를 가져 올 수 없습니다. 다시 시도해 주세요
                    </Text>
                  </View>
                </>
              )}

              {!isAirpollError ? (
                <Airpollution pm10={pm10} pm25={pm25} />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={{ color: "gray" }}>
                    미세먼지 정보를 가져 올 수 없습니다. 다시 시도해 주세요
                  </Text>
                </View>
              )}
            </LinearGradient>
          </ScrollView>
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
  },
  scrollContent: {
    flex: 1
  }
});
