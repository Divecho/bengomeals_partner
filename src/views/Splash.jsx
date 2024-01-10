import React, { useState, useEffect, Alert } from 'react';
import { StyleSheet, View, Text,  Image, ImageBackground ,StatusBar} from 'react-native';
import * as colors from '../assets/css/Colors';
import { app_name, light, regular, bold, logo_with_name, splash_image, api_url, settings} from '../config/Constants';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, {Importance} from "react-native-push-notification";
import { connect } from 'react-redux'; 
import { updatePartnerProfilePicture, updatePartnerOnlineStatus, updatePartnerName, updateAadharPicture, updateDrivingLicencePicture } from '../actions/PartnerRegisterActions';

const Splash = (props) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState('false');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      await app_settings(); 
    });
    return unsubscribe;
  },[]);

  const channel_create = () =>{
    PushNotification.createChannel(
    {
        channelId: "taxi_booking", // (required)
        channelName: "Booking", // (required)
        channelDescription: "Taxi Booking Solution", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "uber.mp3", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }

  const configure = () =>{
    PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: function (token) {
          console.log("TOKEN:", token.token);
          global.fcm_token = token.token;
        },

        // (required) Called when a remote is received or opened, or local notification is opened
        onNotification: function (notification) {
          console.log("NOTIFICATION:", notification);

          // process the notification

          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        },

        // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
        onAction: function (notification) {
          console.log("ACTION:", notification.action);
          console.log("NOTIFICATION:", notification);

          // process the action
        },

        // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
        onRegistrationError: function(err) {
          console.error(err.message, err);
        },

        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },

        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,

        /**
         * (optional) default: true
         * - Specified if permissions (ios) and token (android and ios) will requested or not,
         * - if not, you must call PushNotificationsHandler.requestPermissions() later
         * - if you are not using remote notification or do not have Firebase installed, use this:
         *     requestPermissions: Platform.OS === 'ios'
         */
        requestPermissions: true,
      });
  }

  const app_settings = async() => {
    axios({
    method: 'get', 
    url: api_url + settings,
    })
    .then(async response => {
      if(Platform.OS === "android"){
        await configure();
        await channel_create();
      }else{
        global.fcm_token = "TEST123";
      }
      saveData(response.data.result)
    })
    .catch(error => {
      alert('Sorry something went wrong')
    });
  }

  const saveData = async(data) =>{
    const id = await AsyncStorage.getItem('id');
    const delivery_boy_name = await AsyncStorage.getItem('delivery_boy_name');
    const phone_number = await AsyncStorage.getItem('phone_number');
    const phone_with_code = await AsyncStorage.getItem('phone_with_code');
    const email = await AsyncStorage.getItem('email');
    const profile_picture = await AsyncStorage.getItem('profile_picture');
    const aadhar_picture = await AsyncStorage.getItem('aadhar_picture');
    const driving_licence_picture = await AsyncStorage.getItem('driving_licence_picture');
    const online_status = await AsyncStorage.getItem('online_status');
    global.app_name = data.app_name;
    global.currency = data.default_currency;
    global.mode = await data.mode;
    
    if(id !== null){
      global.id = await id;
      global.delivery_boy_name = await delivery_boy_name;
      global.phone_number = await phone_number;
      global.phone_with_code = await phone_with_code;
      global.email = await email;
      await props.updatePartnerOnlineStatus(online_status);
      await props.updatePartnerProfilePicture(profile_picture);
      await props.updateAadharPicture(aadhar_picture);
      await props.updateDrivingLicencePicture(driving_licence_picture);
      await props.updatePartnerName(delivery_boy_name);
      navigate_home();
     }else{
      global.id = '';
      navigate_login();
     }
  }

  const navigate_home = async() => {
    navigation.dispatch(
         CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
        })
    );
  }

  const navigate_login = async() => {
    navigation.dispatch(
         CommonActions.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
        })
    );
  }

return (

  <View style={{justifyContent:'center', alignItems:'center', flex:1}}>
    <StatusBar backgroundColor={colors.theme_bg}/>
  <View style={styles.logo} >
    <Image style= {{ height: undefined,width: undefined,flex: 1 }} source={logo_with_name} />
  </View>
</View>
  )
}

const styles = StyleSheet.create({
 image_style: {
    height:'100%',
    width:'100%',
    alignItems: 'center',
    justifyContent:'center'
    
  },
  logo:{
    height:210, 
    width:200,
    
},
 
});

function mapStateToProps(state){
  return{
    partner_profile_picture : state.partner_register.partner_profile_picture,
    aadhar_picture : state.partner_register.aadhar_picture,
    driving_licence_picture : state.partner_register.driving_licence_picture,
    partner_online_status : state.partner_register.partner_online_status,
    partner_name : state.partner_register.partner_name, 
  };
}

const mapDispatchToProps = (dispatch) => ({
  updatePartnerProfilePicture: (data) => dispatch(updatePartnerProfilePicture(data)),
  updateAadharPicture: (data) => dispatch(updateAadharPicture(data)),
  updateDrivingLicencePicture: (data) => dispatch(updateDrivingLicencePicture(data)),
  updatePartnerOnlineStatus: (data) => dispatch(updatePartnerOnlineStatus(data)), 
  updatePartnerName: (data) => dispatch(updatePartnerName(data)),

});

export default connect(mapStateToProps,mapDispatchToProps)(Splash);
