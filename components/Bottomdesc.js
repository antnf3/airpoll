import React from "react";
import { StyleSheet, View, Text } from "react-native";
import CustomBtn from "./CustomBtn";
import PropTypes from "prop-types";
import { normalize } from "../utils";

const cWidth = Math.floor(100 / 6);
const FooterBottomCol = ({ txt, color, num }) => {
  return (
    <View style={styles.footerBottomCol}>
      <View style={[styles.bottomView, { backgroundColor: color }]} />
      <View style={styles.bottomTextLine}>
        <Text style={styles.bottomText}>{txt}</Text>
        <Text style={styles.bottomText}>{num === 999 ? "-" : num}</Text>
      </View>
    </View>
  );
};
const Bottomdesc = ({ title, idx, txtSubject, leftPoint }) => {
  return (
    <View style={styles.content}>
      <View style={styles.txtStyle}>
        <Text style={styles.footerTitle}>{title}</Text>
        {title === "미세먼지" ? (
          <Text style={{ fontSize: normalize(9), color: "gray" }}>
            제공 환경부/한국환경공단
          </Text>
        ) : (
          <Text />
        )}
      </View>
      <View>
        <CustomBtn
          subject={txtSubject}
          leftPoint={leftPoint}
          txtColor={"#2C77B8"}
        />
        <View style={styles.footerBottomDesc}>
          <FooterBottomCol txt={"좋음"} color={"#2C77B8"} num={idx[0]} />
          <FooterBottomCol txt={"보통"} color={"#2DE15D"} num={idx[1]} />
          <FooterBottomCol txt={"약간나쁨"} color={"#D6E952"} num={idx[2]} />
          <FooterBottomCol txt={"나쁨"} color={"#ECB533"} num={idx[3]} />
          <FooterBottomCol txt={"매우나쁨"} color={"#E51A1A"} num={idx[4]} />
          <FooterBottomCol txt={"위험"} color={"#FE09E5"} num={999} />
        </View>
      </View>
    </View>
  );
};

Bottomdesc.propTypes = {
  title: PropTypes.string.isRequired,
  idx: PropTypes.array.isRequired,
  leftPoint: PropTypes.number.isRequired,
  txtSubject: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  content: {
    height: normalize(80),
    marginTop: 10,
    justifyContent: "space-between",
    backgroundColor: "transparent"
  },
  txtStyle: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  footerBottomDesc: {
    height: 25,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "transparent",
    justifyContent: "center"
  },
  footerBottomCol: {
    width: `${cWidth}%`,
    height: "100%",
    alignItems: "center"
  },
  bottomView: {
    height: 10,
    width: "100%",
    marginRight: -5
  },
  bottomTextLine: {
    width: "100%",
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  bottomText: {
    fontSize: normalize(10)
  },
  footerTitle: {
    fontSize: normalize(10),
    fontWeight: "600",
    color: "gray"
  }
});
export default Bottomdesc;
