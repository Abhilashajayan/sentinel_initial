import {
  Dimensions,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  Vibration,
} from "react-native";
import React, { useState, useEffect } from "react";
import { sos_Api } from "../axios/axiosConfig";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { Accelerometer } from "expo-sensors";
import { useSelector } from "react-redux";

export default function CarCrash() {
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sound, setSound] = useState();
  const userData = useSelector((state) => state.auth.user);

  console.log(userData);
  useEffect(() => {
    let interval;

    async function playSound() {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/audio/carcrash.mp3")
      );
      setSound(sound);

      sound.setIsLoopingAsync(true);
      await sound.playAsync();
    }

    if (isTimerRunning) {
      Vibration.vibrate([200, 1000], true);
      playSound();

      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0) {
            clearInterval(interval);
            Vibration.cancel();
            setIsTimerRunning(false);
            if (sound) {
              sound.stopAsync();
            }
            const handleSOSRequest = async () => {
              try {
                const response = await sos_Api({
                  address: userData.address,
                  allergies: userData.allergyNotes,
                  bloodType: userData.bloodType,
                });
                console.log(response);
              } catch (error) {
                console.error("Error in SOS API:", error);
              }
            };

            handleSOSRequest();
            return 15;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else {
      setTimer(15);
      Vibration.cancel();
      if (sound) {
        sound.stopAsync();
      }
    }

    return async () => {
      clearInterval(interval);
      Vibration.cancel();
      if (sound) {
        await sound.unloadAsync();
      }
    };
  }, [isTimerRunning]);

  const handleStartStop = () => {
    setIsTimerRunning((prevIsTimerRunning) => !prevIsTimerRunning);
  };

  useEffect(() => {
    const tiltThreshold = 2;

    const subscription = Accelerometer.addListener((accelerometerData) => {
      const { x, y, z } = accelerometerData;

      // Check if the phone is tilted to the left or right
      if (
        x < -tiltThreshold ||
        x > tiltThreshold ||
        y < -tiltThreshold ||
        y > tiltThreshold ||
        z < -tiltThreshold ||
        z > tiltThreshold
      ) {
        // Start the timer if not already running
        if (!isTimerRunning) {
          handleStartStop();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isTimerRunning]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.head}>Try a demo</Text>
        <Text style={styles.information}>
          See what happens when your phone detects a car crash
        </Text>
      </View>
      <View style={styles.phoneContainer}>
        <ImageBackground
          source={require("../assets/images/pixel8.png")}
          style={styles.pixel8}
        >
          {isTimerRunning && (
            <View style={styles.timerContainer}>
              <Text>Respond within</Text>
              <Text style={styles.timer}>{timer} seconds</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.touchableOpacity}
            onPress={handleStartStop}
          >
            <Text style={styles.button}>
              {isTimerRunning ? "Stop" : "Start"}
            </Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginLeft: 20,
  },
  head: {
    fontSize: 35,
    marginVertical: 10,
  },
  information: {
    fontSize: 16,
    marginVertical: 10,
  },
  phoneContainer: {
    marginTop: Dimensions.get("window").height / 15,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  pixel8: {
    height: 620,
    width: 300,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  timer: {
    fontSize: 20,
    color: "black",
    marginBottom: 10,
  },
  touchableOpacity: {
    backgroundColor: "red",
    padding: 12,
    borderRadius: 15,
    width: "30%",
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  button: {
    fontSize: 18,
    textAlign: "center",
    color: "black",
  },
  tiltDetectionContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  tiltDetectionText: {
    fontSize: 16,
    color: "black",
  },
});
