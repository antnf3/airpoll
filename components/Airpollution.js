import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Bottomdesc from "./Bottomdesc";
import PropTypes from "prop-types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { normalize } from "../utils";

const arrPm10 = [20, 35, 50, 70, 100, 999]; // 미세먼지
const arrPm25 = [10, 17, 25, 35, 50, 999]; // 초미세먼지
const arrTxt = ["좋음", "보통", "약간나쁨", "나쁨", "매우나쁨", "위험"];

const getLeftPoint = (pm10Point, pm25Point) => {
  return {
    lPm10: arrPm10.filter(point => point < pm10Point),
    lPm25: arrPm25.filter(point => point < pm25Point)
  };
};

const Airpollution = ({ pm10, pm25 }) => {
  pm10 = pm10 === "-" ? "0" : pm10;
  pm25 = pm25 === "-" ? "0" : pm25;
  pm10 = Number(pm10);
  pm25 = Number(pm25);

  const pm24Width = pm25 > 40 ? 65 : 60;
  const { lPm10, lPm25 } = getLeftPoint(pm10, pm25);

  pm10 = pm10 > 108 ? 108 : pm10;
  pm25 = pm25 > 58 ? 58 : pm25;

  pm10 = (pm10 * 100) / 120;
  pm25 = (pm25 * 100) / pm24Width;

  return (
    <View style={styles.footerContainer}>
      <Bottomdesc
        title={"미세먼지"}
        idx={arrPm10}
        txtSubject={arrTxt[lPm10.length]}
        leftPoint={pm10}
        lPm={lPm10}
      />
      <Bottomdesc
        title={"초미세먼지"}
        idx={arrPm25}
        txtSubject={arrTxt[lPm25.length]}
        leftPoint={pm25}
        lPm={lPm25}
      />
      <View style={styles.information}>
        <MaterialCommunityIcons
          color="black"
          size={normalize(12)}
          name={"information-outline"}
        />
        <Text style={{ fontSize: normalize(10), color: "gray" }}>
          실시간 관측된 자료이며 현지사정이나 수신 상태에 의해 차이가 발생 할 수
          있습니다.
        </Text>
      </View>
    </View>
  );
};

Airpollution.propTypes = {
  pm10: PropTypes.string.isRequired,
  pm25: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  footerContainer: {
    flex: 2,
    backgroundColor: "transparent"
  },
  information: {
    flexDirection: "row",
    marginTop: 10
  }
});

export default Airpollution;
