import { useEffect, useRef, useState, useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Input, Button, Icon } from 'react-native-elements';
import { useNavigation, } from '@react-navigation/native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { Video } from 'expo-av';
import { shareAsync } from 'expo-sharing';
import { Context as RegistrationContext } from '../context/RegistrationContext';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const PhotoScreen = () => {

    let cameraRef = useRef();
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
    const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();

    const [isRecording, setIsRecording] = useState(false);
    const [video, setVideo] = useState();
    const navigation = useNavigation();
    const [flashMode, setFlashMode] = useState("off");
    const { isVisibleModal, setReportMedia } = useContext(RegistrationContext);
    const [photo, setPhoto] = useState();
    const [mode, setMode] = useState('picture');


    useEffect(() => {
        (async () => {
            await requestCameraPermission();
            await requestMicrophonePermission();
            await requestMediaLibraryPermission();
        })();
    }, []);

    if (!cameraPermission?.granted) {
        return <View style={styles.container}><Text>Requestion permissions...</Text></View>
    }

    const toggleFlashMode = () => {
        if (flashMode === "off") {
            setFlashMode("on");
        } else {
            setFlashMode("off");
        }
    };
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const base64 = await FileSystem.readAsStringAsync(result.assets, {
                encoding: FileSystem.EncodingType.Base64,
            });
            // ScanIdCard(`${base64}`)
            isVisibleModal();
            navigation.goBack();
        }
    };
    let takePic = async () => {
        let options = {
            quality: 0.5,
            base64: true,
            exif: false
        };
        let newPhoto = await cameraRef.current.takePictureAsync(options);
        setPhoto(newPhoto);
    };

    if (photo) {
        let savePhoto = () => {
            isVisibleModal('isVisibleIncident')
            setReportMedia(`data:image/jpeg;base64,${photo.base64}`, 'images')
            navigation.navigate('Mapa')
            MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
                setPhoto(undefined);
            });
        };
        return (
            <SafeAreaView style={styles.container}>
                <Image style={styles.preview} source={{ uri: "data:image/jpeg;base64," + photo.base64 }} />

                <View style={[{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: '3%' }]}>
                    <Button
                        title="Cancelar"
                        titleStyle={{ fontSize: 24 }}
                        containerStyle={{ width: '45%' }}
                        buttonStyle={{ backgroundColor: '#848484' }}
                        onPress={() => setPhoto(undefined)} />
                    {mediaLibraryPermission.granted
                        ?
                        <Button
                            title="Guardar"
                            titleStyle={{ fontSize: 24 }}
                            containerStyle={{ width: '45%' }}
                            buttonStyle={{ backgroundColor: '#1E0554' }}
                            onPress={() => savePhoto()} />
                        :
                        undefined
                    }
                </View>
            </SafeAreaView>
        );
    }
    let recordVideo = () => {
        setIsRecording(true);
        let options = {
            quality: "720p",
            maxDuration: 60,
            mute: false
        };

        cameraRef.current.recordAsync(options).then((recordedVideo) => {
            setVideo(recordedVideo);
            setIsRecording(false);
        });
    };
    let stopRecording = () => {
        setIsRecording(false);
        cameraRef.current.stopRecording();
    };
    if (video) {
        let shareVideo = () => {
            shareAsync(video.uri).then(() => {
                setVideo(undefined);
            });
        };

        let saveVideo = async () => {
            try {
                const videoBase64 = await FileSystem.readAsStringAsync(video.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                isVisibleModal('isVisibleIncident')
                setReportMedia(`data:video/mp4;base64,${videoBase64}`, 'videos')
                navigation.navigate('Mapa')
                setVideo(undefined)
            } catch (error) {
                console.log('Error al convertir el video a base64:', error);
                setVideo(undefined)
            }
        };

        return (
            <SafeAreaView style={styles.container}>
                <Video
                    style={styles.video}
                    source={{ uri: video.uri, overrideFileExtensionAndroid: 'mp4' }}
                    useNativeControls
                    resizeMode='cover'
                    isLooping
                />
                <View style={[{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: '3%' }]}>
                    {mediaLibraryPermission.granted
                        ?
                        <Button
                            title="Cancelar"
                            titleStyle={{ fontSize: 24 }}
                            containerStyle={{ width: '45%' }}
                            buttonStyle={{ backgroundColor: '#848484' }}
                            onPress={() => setVideo(undefined)} />
                        :
                        undefined
                    }
                    <Button
                        title="Guardar"
                        titleStyle={{ fontSize: 24 }}
                        containerStyle={{ width: '45%' }}
                        buttonStyle={{ backgroundColor: '#1E0554' }}
                        onPress={saveVideo} />

                </View>
            </SafeAreaView>
        );
    }
    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} facing='back' flashMode={flashMode} mode={mode} ref={cameraRef}>
                <View style={styles.topButtonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => setMode('picture')}>
                        <Icon
                            name="camera"
                            size={30}
                            type='ionicon'
                            color={mode == 'picture' ? 'red' : 'white'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => setMode('video')}>
                        <Icon
                            name="videocam"
                            size={30}
                            type='ionicon'
                            color={mode == 'video' ? 'red' : 'white'} />
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomButtonContainer}>
                   
                    <TouchableOpacity style={styles.button} onPress={() => toggleFlashMode()}>
                        <Icon
                            size={30}
                            name={flashMode === "on" ? 'flash' : 'flash-off'}
                            type='ionicon'
                            color={'white'} />
                    </TouchableOpacity>

                    
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={mode == 'video' ? (isRecording ? stopRecording : recordVideo) : takePic}>
                            <Icon
                                size={30}
                                name={ mode == 'video' ? (isRecording ? 'videocam-off' : 'videocam') : 'camera'}
                                type='MaterialIcons'
                                color={mode == 'video' ? (isRecording ? 'red' : 'white') : 'white'} />
                    </TouchableOpacity>
                </View>
            </CameraView>
            {/* Resto del código */}
        </View >
    );
}

export default PhotoScreen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    preview: {
        alignSelf: 'stretch',
        flex: 1
    },
    video: {
        flex: 1,
        alignSelf: "stretch"
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 20,
    },
    topButtonContainer: {
        position: 'absolute',
        top: 35,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        padding: 0,
    },
    button: {
        padding: 10,
    },
});