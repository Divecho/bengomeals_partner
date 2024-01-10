import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Dimensions, Text } from 'react-native';
import { Colors, Fonts, Sizes } from "../assets/css/Colors";
import Icon, { Icons } from './Icons';
import * as ImagePicker from "react-native-image-picker";
import ImgToBase64 from 'react-native-image-base64';
const { width, height } = Dimensions.get('window');

const options = {
    title: 'Select a photo',
    takePhotoButtonTitle: 'Take a photo',
    chooseFromLibraryButtonTitle: 'Choose from gallery',
    base64: true,
    quality: 1,
    maxWidth: 500,
    maxHeight: 500,
};

const CertificateUpload = (props) => {
    const [profile_image, setProfileImage] = useState("");
    const [profile_timer, setProfileTimer] = useState(true);
    //console.log("profile_image ", profile_image)
    const select_photo = async () => {
        if (profile_timer) {
            ImagePicker.launchImageLibrary(options, async (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                } else {
                    const source = await response.assets[0];
                    //await props.onPress(source);
                    await ImgToBase64.getBase64String(response.assets[0].uri)
                        .then(async base64String => {
                            await props.onPress({ data: response.assets[0], base64: base64String });
                            //await profileimageupdate(base64String);
                            await setProfileImage(response.assets[0].uri);
                        }
                        )
                        .catch(err => console.log(err));
                }
            });
        } else {
            alert('Please try after 20 seconds');
        }
    }

    return (
        <>
            <View style={{ margin: 5 }} />
            <TouchableOpacity onPress={select_photo.bind(this)} style={styles.box}>
                <View onPress={select_photo.bind(this)} style={styles.profile} >
                    {!profile_image && !props.image ?
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 15,
                            borderRadius: 5,
                            backgroundColor: Colors.whiteColor,
                        }}>
                            <View style={{
                                paddingHorizontal: Sizes.fixPadding,
                                paddingVertical: Sizes.fixPadding * 2
                            }}>
                                <Icon type={Icons.MaterialIcons} name="add-a-photo" color={Colors.blackColor} />
                            </View>
                            <Text style={{ ...Fonts.blackColor14SemiBold }}>{props.title}</Text>
                        </View>
                        :
                        <>
                            <Text style={{ ...Fonts.blackColor14SemiBold, marginBottom: Sizes.fixPadding}}>{props.title}</Text>
                            <Image style={{ height: 200, width: '100%', flex: 1, borderRadius: 50 }} source={{ uri: profile_image ? profile_image : props.image }} />
                        </>
                    }
                </View>
            </TouchableOpacity>
        </>
    );
}

const styles = StyleSheet.create({
    // box: {
    //     width: 100,
    //     borderRadius: 60
    // },
    // profile: {
    //     marginTop: Sizes.fixPadding,
    //     width: width * 0.18,
    //     height: height * 0.09,
    //     backgroundColor: Colors.whiteColor,
    //     borderRadius: Sizes.fixPadding - 5.0,
    //     elevation: 4.0,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // }
});

export default CertificateUpload;
