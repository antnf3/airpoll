import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import PropTypes from "prop-types";
import { normalize } from "../utils";

const { width } = Dimensions.get("window");

const Title = ({ t1h, skyStatus, rainStatus }) => {
  return (
    <View style={styles.title}>
      <View style={styles.titleColmLeft} />
      <View style={styles.titleColmCenter}>
        <Text style={{ fontSize: normalize(32) }}>{`${t1h}º`}</Text>
      </View>
      <View style={styles.titleColmRight}>
        <Text style={styles.titleTemp}>{skyStatus}</Text>
        <Text style={styles.titleTemp}>
          {rainStatus !== "없음" ? rainStatus : ""}
        </Text>
      </View>
    </View>
  );
};
Title.propTypes = {
  t1h: PropTypes.number.isRequired
};

const styles = StyleSheet.create({
  title: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "transparent",
    alignItems: "center"
  },
  titleTemp: {
    fontSize: normalize(12),
    fontWeight: "400"
  },
  titleColmLeft: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    width: width / 3,
    height: "100%"
  },
  titleColmCenter: {
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    width: width / 3,
    height: "100%"
  },
  titleColmRight: {
    backgroundColor: "transparent",
    alignItems: "flex-start",
    justifyContent: "center",
    width: width / 3,
    height: "100%"
  }
});

export default Title;
