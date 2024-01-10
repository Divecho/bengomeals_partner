import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, Switch, PermissionsAndroid, Platform } from 'react-native';
import * as colors from '../assets/css/Colors';
import { regular, bold, restaurant, change_online_status, api_url, dashboard, GOOGLE_KEY, LATITUDE_DELTA, LONGITUDE_DELTA, app_name, online_lottie, offline_lottie } from '../config/Constants';
import LottieView from 'lottie-react-native';
import axios from 'axios';
import { Loader } from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import FusedLocation from 'react-native-fused-location';
import Geolocation from '@react-native-community/geolocation';
import { connect } from 'react-redux';
import { updatePartnerLat, updatePartnerLng, updatePartnerOnlineStatus } from '../actions/PartnerRegisterActions';

const Home = (props) => {
  const navigation = useNavigation();
  const [switch_value, setSwitchValue] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dashboard_value, setDashboardValue] = useState("");
  const mapRef = useRef(null);
  const [mapRegion, setmapRegion] = useState(null);

  const ref_variable = async () => {
    await setTimeout(() => {
      mapRef.current.focus();
    }, 200);
  }

  useEffect(() => {
    const onValueChange = database()
      .ref(`/delivery_partners/${global.id}`)
      .on('value', snapshot => {
        console.log("snapshot", snapshot);
        if (snapshot.val().on_stat == 1 && snapshot.val().o_stat == 1) {
          sync(snapshot.val().o_id);
        }
      });
    //onValueChange();
    if (props.partner_online_status == 1) {
      setSwitchValue(true);
    } else {
      setSwitchValue(false);
    }
    const unsubscribe = navigation.addListener('focus', async () => {
      await get_location();
      await call_dashboard();
      await online_status(props.partner_online_status);
    });
    return unsubscribe;
  }, []);

  const sync = (order_id) => {
    navigation.navigate("OrderRequest", { order_id: order_id });
  }

  const get_location = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
        title: 'Location Access Required',
        message: app_name + ' needs to Access your location for tracking'
      }
      );
      
      if (granted) {
        FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);

        // Get location once.
        const location = await FusedLocation.getFusedLocation();
        await props.updatePartnerLat(location.latitude);
        await props.updatePartnerLng(location.longitude);

        // Set options.
        FusedLocation.setLocationPriority(FusedLocation.Constants.BALANCED);
        FusedLocation.setLocationInterval(5000);
        FusedLocation.setFastestLocationInterval(5000);
        FusedLocation.setSmallestDisplacement(10);


        // Keep getting updated location.
        FusedLocation.startLocationUpdates();

        // Place listeners.
        const subscription = FusedLocation.on('fusedLocation', location => {

          let region = {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }

          let marker = {
            latitude: location.latitude,
            longitude: location.longitude,
          }

          let lat = location.latitude;
          let lng = location.longitude;

          database().ref('/delivery_partners/' + global.id).update({
            lat: lat,
            lng: lng,
            bearing: location.bearing
          });

        });
      }
    } else {
      database().ref('/delivery_partners/' + global.id).update({
        lat: 9.9081015593355,
        lng: 78.090738002211,
        bearing: 90
      });
    }
  }

  const toggleSwitch = async (value) => {
    if (value) {
      await setSwitchValue(value);
      await online_status(1);
      await saveData(1);
    } else {
      await setSwitchValue(value);
      await online_status(0);
      await saveData(0);
    }
  }

  const online_status = async (status) => {
    console.log({ id: global.id, online_status: status })
    setLoading(true);
    await axios({
      method: 'post',
      url: api_url + change_online_status,
      data: { id: global.id, online_status: status }
    })
      .then(async response => {
        setLoading(false);
      })
      .catch(error => {
        alert('Sorry something went wrong')
        setLoading(false);
      });
  }

  const saveData = async (status) => {
    try {
      await AsyncStorage.setItem('online_status', status.toString());
      await props.updatePartnerOnlineStatus(status);

    } catch (e) {
    }
  }

  const call_dashboard = async () => {
    setLoading(true);
    await axios({
      method: 'post',
      url: api_url + dashboard,
      data: { delivery_boy_id: global.id }
    })
      .then(async response => {
        setLoading(false);
        setDashboardValue(response.data.result);
      })
      .catch(error => {
        setLoading(false);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Loader visible={loading} />
        <View style={styles.header}>
          <TouchableOpacity style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <Switch
              trackColor={{ false: "#767577", true: colors.theme_bg }}
              thumbColor={switch_value ? "#f4f3f4" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={switch_value}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.light_grey, padding: 10, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ borderWidth: 1, borderColor: colors.regular_grey, padding: 10, fontFamily: regular, borderRadius: 10, width: '30%', padding: 2, flexDirection: 'column' }}>
            <Text style={{ fontSize: 14, color: colors.theme_fg_two, textAlign: 'center' }}>Pending</Text>
            <View style={{ margin: 2 }} />
            <Text style={{ fontSize: 14, color: colors.theme_fg_two, textAlign: 'center' }}>({dashboard_value.pending})</Text>
          </View>
          <View style={{ margin: 5 }} />
          <View style={{ borderWidth: 1, borderColor: colors.regular_grey, padding: 10, fontFamily: regular, borderRadius: 10, width: '30%', padding: 2, flexDirection: 'column' }}>
            <Text style={{ fontSize: 14, color: colors.theme_fg_two, textAlign: 'center' }}>Picked Up</Text>
            <View style={{ margin: 2 }} />
            <Text style={{ fontSize: 14, color: colors.theme_fg_two, textAlign: 'center' }}>({dashboard_value.picked_up})</Text>
          </View>
          <View style={{ margin: 5 }} />
          <View style={{ borderWidth: 1, borderColor: colors.regular_grey, padding: 10, fontFamily: regular, borderRadius: 10, width: '30%', padding: 2, flexDirection: 'column' }}>
            <Text style={{ fontSize: 14, color: colors.theme_fg_two, textAlign: 'center' }}>Completed</Text>
            <View style={{ margin: 2 }} />
            <Text style={{ fontSize: 14, color: colors.theme_fg_two, textAlign: 'center' }}>({dashboard_value.completed})</Text>
          </View>
        </View>
        <View style={styles.imageView}>
          <Image style={{ height: undefined, width: undefined, flex: 1, borderRadius: 10 }} source={restaurant} />
        </View>
        {props.partner_online_status == 1 ?
          <View>
            <View style={{ margin: '15%' }}>
              <View style={{ height: 150 }}>
                <LottieView source={online_lottie} autoPlay loop />
              </View>
            </View>
            <Text style={{ alignSelf: 'center', fontFamily: bold, justifyContent: 'center', color: colors.green, fontSize: 16 }}>Be ready, will receive your delivery orders.</Text>
          </View>
          :
          <View>
            <View style={{ margin: '15%' }}>
              <View style={{ height: 150 }}>
                <LottieView source={offline_lottie} autoPlay loop />
              </View>
            </View>
            <Text style={{ alignSelf: 'center', fontFamily: bold, justifyContent: 'center', color: colors.theme_fg_four, fontSize: 12 }}>Make online to receive your delivery orders.</Text>
          </View>
        }
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.theme_bg_three,
  },
  header: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#ccc',
    padding: 10
  },
  imageView: {
    width: '100%',
    height: 180,
    padding: 10,

  },

});

function mapStateToProps(state) {
  return {
    partner_lat: state.partner_register.partner_lat,
    partner_lng: state.partner_register.partner_lng,
    partner_online_status: state.partner_register.partner_online_status,
  };
}

const mapDispatchToProps = (dispatch) => ({
  updatePartnerLat: (data) => dispatch(updatePartnerLat(data)),
  updatePartnerLng: (data) => dispatch(updatePartnerLng(data)),
  updatePartnerOnlineStatus: (data) => dispatch(updatePartnerOnlineStatus(data)),

});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
