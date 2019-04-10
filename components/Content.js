import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import spaceMap from "../spaceMap";
import PropTypes from "prop-types";
import { normalize } from "../utils";

const { width } = Dimensions.get("window");

const TopViewContent = ({ date, skyIcon, skyStatus, pty }) => {
  date = String(date);
  date = date.substring(0, 2);
  return (
    <View style={styles.topViewContent}>
      <Text style={{ fontSize: normalize(10) }}>{`${date}시`}</Text>
      <MaterialCommunityIcons
        color="black"
        size={normalize(38)}
        name={skyIcon}
      />
      <Text style={{ fontSize: normalize(10) }}>
        {pty !== "없음" ? pty : skyStatus}
      </Text>
    </View>
  );
};

const BottomViewContent = ({ height }) => {
  return (
    <View style={styles.bottomViewContent}>
      <Text style={{ fontSize: normalize(10) }}>{`${height}º`}</Text>
      <View style={[styles.bottomColumn, { height }]} />
    </View>
  );
};
const BottomViewContent2 = ({ height }) => {
  return (
    <View style={styles.bottomViewContent}>
      <View style={[styles.bottomColumn, { height }]} />
    </View>
  );
};

const Content = ({ isLoaded, content2 }) => {
  const sky = content2.SKY;
  const pty = content2.PTY;
  const t1h = content2.T1H;
  return (
    <ScrollView
      style={styles.scrollContent}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      {isLoaded ? (
        <View style={styles.content}>
          <View style={styles.topContent}>
            {sky.map((content, i) => (
              <TopViewContent
                key={i}
                date={content.fcstTime}
                skyIcon={spaceMap.getSkyIcon(
                  content.fcstValue,
                  pty[i].fcstValue
                )}
                pty={spaceMap.getPtyStatus(pty[i].fcstValue)}
                skyStatus={spaceMap.getSkyStatus(content.fcstValue)}
              />
            ))}
          </View>
          <View style={styles.bottomContent}>
            {t1h.map((content, i) => {
              let cnt = content.fcstValue >= 0 ? content.fcstValue : 0;
              return <BottomViewContent key={i} height={cnt} />;
            })}
          </View>
          <View style={styles.bottomContent2}>
            {t1h.map((content, i) => {
              let cnt = content.fcstValue < 0 ? content.fcstValue * -1 : 0;
              return <BottomViewContent2 key={i} height={cnt} />;
            })}
          </View>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </ScrollView>
  );
};

Content.propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  content2: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1
  },
  content: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderBottomColor: "#bbb",
    width: "100%",
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  topContent: {
    height: normalize(90),
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  bottomContent: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    alignItems: "flex-end"
  },
  bottomContent2: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    alignItems: "flex-start"
  },
  topViewContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: width / 5
  },
  bottomViewContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: width / 5
  },
  bottomColumn: {
    width: 20,
    backgroundColor: "#e17055"
  }
});

export default Content;
