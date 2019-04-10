import React from "react";
import { StyleSheet } from "react-native";
import { AdMobBanner } from "expo";
import { AdUnitID } from "../constants";

const Ads = () => {
  return (
    <AdMobBanner
      style={styles.bottomBanner}
      bannerSize="smartBannerPortrait"
      adUnitID={AdUnitID} // Test ID, Replace with your-admob-unit-id
      testDeviceID="EMULATOR"
      onDidFailToReceiveAdWithError={this.bannerError}
    />
  );
};

const styles = StyleSheet.create({
  bottomBanner: {
    position: "absolute",
    bottom: 0
  }
});
export default Ads;
