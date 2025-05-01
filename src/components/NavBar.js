import React, { useContext, useEffect, useState } from 'react'
import { TouchableOpacity, Image, } from 'react-native';
import { Header, Icon } from 'react-native-elements';
import Logo from './Logo';
import Images from '../components/assets/images';

const NavBar = (navigation) => {




    const open = () => {
        navigation.navigation.openDrawer();
    }

    return (
        <Header
            backgroundColor="#363636"
            barStyle="default"
            containerStyle={{ height: 110 }}
            leftContainerStyle={{ justifyContent: 'center' }}
            rightComponent={
                <Image source={Images.logoAdmin} style={{
                    width: '50%',
                    height: 40,
                    resizeMode: 'stretch',
                }} />}
            centerComponent={null}
            leftComponent={
                <TouchableOpacity
                    onPress={() => open()}
                    style={{ position: 'absolute' }}>
                    <Icon
                        name='bars'
                        size={25}
                        type='font-awesome'
                        color='white' />
                </TouchableOpacity>
            }
        />

    )
}

export default NavBar
