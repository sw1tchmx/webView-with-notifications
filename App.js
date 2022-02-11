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

  const onMessage = (payload) => {
    console.log('localStorage data', payload);
  };

  const WEBVIEW = useRef()

  const [loading, setLoading] = useState(true)
  const [backButtonEnabled, setBackButtonEnabled] = useState(false)
  const [isConnected, setConnected] = useState(true)

  const INJECTED_JAVASCRIPT = `(function() {
    const emailLocalStorage = window.localStorage.getItem('userEmail');
    const nameLocalStorage = window.localStorage.getItem('userName');
    const userIdLocalStorage = window.localStorage.getItem('userId');
    const tokenLocalStorage = window.localStorage.getItem('token');
    window.ReactNativeWebView.postMessage(tokenLocalStorage);
    window.ReactNativeWebView.postMessage(emailLocalStorage);
    window.ReactNativeWebView.postMessage(nameLocalStorage);
    window.ReactNativeWebView.postMessage(userIdLocalStorage);
  })();`;

  // Webview content loaded
  function webViewLoaded() {
    setLoading(false)
  };

  // Webview navigation state change
  function onNavigationStateChange(navState) {
    setBackButtonEnabled(navState.canGoBack)
  };

  useEffect(() => {
    // Handle back event
    function backHandler() {
      if (backButtonEnabled) {
        WEBVIEW.current.goBack();
        return true;
      }
    };

    // Subscribe to back state vent
    BackHandler.addEventListener("hardwareBackPress", backHandler);

    // Unsubscribe
    return () => BackHandler.removeEventListener("hardwareBackPress", backHandler);
  }, [backButtonEnabled])

  useEffect(() => {
    // Subscribe for net state
    const netInfroSubscribe = NetInfo.addEventListener((state) => {
      setConnected(state.isConnected)
      if (!state.isConnected) {
       /* alert('sin conexión');*/
      } 
    });

    // Clean up
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
          injectedJavaScript={INJECTED_JAVASCRIPT}
          onMessage={onMessage}
          ref={WEBVIEW}
          useWebKit={true}
          onNavigationStateChange={onNavigationStateChange}
          source={{ uri: "https://venka.app/" }}
        />
      )}
    </SafeAreaView>
  );
}