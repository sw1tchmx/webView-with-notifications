import React, { useEffect, useState, useRef } from "react";
import {
  Platform,
  BackHandler,
  Dimensions,
  SafeAreaView,
  View,
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import NetInfo from "@react-native-community/netinfo";

const BACKGROUND_COLOR = "#74b841";
const DEVICE_WIDTH = Dimensions.get("window").width;
const DEVICE_HEIGHT = Dimensions.get("window").height;
const ANDROID_BAR_HEIGHT = Platform.OS === "android" ? Constants.statusBarHeight : 0;

export default function App(props) {
  const WEBVIEW = useRef()
  const [loading, setLoading] = useState(true)
  const [backButtonEnabled, setBackButtonEnabled] = useState(false)
  const [isConnected, setConnected] = useState(true)

  function webViewLoaded() {
    setLoading(false)
  };

  function onNavigationStateChange(navState) {
    setBackButtonEnabled(navState.canGoBack)
  };

  useEffect(() => {
    function backHandler() {
      if (backButtonEnabled) {
        WEBVIEW.current.goBack();
        return true;
      }
    };
    BackHandler.addEventListener("hardwareBackPress", backHandler);
    return () => BackHandler.removeEventListener("hardwareBackPress", backHandler);
  }, [backButtonEnabled])

  useEffect(() => {
    
    const netInfroSubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected)
      if (!state.isConnected) {
      } 
    });
    return netInfroSubscribe
  }, [])

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
      }}
    >
      <View
        style={{
          height: ANDROID_BAR_HEIGHT,
          backgroundColor: BACKGROUND_COLOR,
        }}
      ></View>
      {(loading || !isConnected) && (
        <View
          style={{
            backgroundColor: BACKGROUND_COLOR,
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            width: DEVICE_WIDTH,
            height: DEVICE_HEIGHT + ANDROID_BAR_HEIGHT,
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image 
          source={require("./assets/splash.png")}
          style={{ height: DEVICE_HEIGHT, flex:1, width: DEVICE_WIDTH}}
          resizeMode="contain"
          ></Image>
        </View>
      )}
      {isConnected && (
        <WebView
          onLoad={webViewLoaded}
          ref={WEBVIEW}
          useWebKit={true}
          onNavigationStateChange={onNavigationStateChange}
          source={{ uri: "https://venka.app/" }}
        />
      )}
    </SafeAreaView>
  );
}