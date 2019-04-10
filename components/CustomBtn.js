import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import PropTypes from "prop-types";
import { normalize } from "../utils";
const CustomBtn = ({ subject, leftPoint, txtColor }) => {
  return (
    <View style={[styles.content, { left: `${leftPoint}%` }]}>
      <Text style={[styles.txtContent, { color: txtColor }]}>{subject}</Text>
    </View>
  );
};

CustomBtn.propTypes = {
  subject: PropTypes.string.isRequired,
  leftPoint: PropTypes.number.isRequired,
  txtColor: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  content: {
    backgroundColor: "white",
    width: 44,
    height: 20,
    zIndex: 998,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -13,
    borderRadius: 10
  },
  txtContent: {
    fontSize: normalize(10),
    fontWeight: "800"
  }
});
export default CustomBtn;
