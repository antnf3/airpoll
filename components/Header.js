import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { normalize } from "../utils";
import PropTypes from "prop-types";

const Header = ({ name, getGeolocation }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerItem}>
        {/* <MaterialCommunityIcons color="black" size={64} name={'menu'} /> */}
      </View>
      <View style={styles.headerTitle}>
        <Text style={{ fontSize: normalize(30) }}> {name} </Text>
      </View>
      <View style={styles.headerItem}>
        <TouchableOpacity onPressOut={getGeolocation}>
          <MaterialCommunityIcons
            color="black"
            size={normalize(32)}
            name={"refresh"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
Header.propTypes = {
  getGeolocation: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  header: {
    top: 10,
    width: "100%",
    height: 64,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  headerItem: {
    width: 72,
    height: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    width: 220,
    height: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default Header;
