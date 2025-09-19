import React, { useState } from 'react';
import { View } from 'react-native';
import useLogout from '../hooks/useLogOut';
import { commonStyles } from './CommonStyles';
import ParagraphComponent from './Paragraph/Paragraph';
import DefaultButton from './DefaultButton';
import { useDispatch } from 'react-redux';
import { isSessionExpired } from '../redux/Actions/UserActions';
import CommonPopup from './commonPopup';

const SessionExpired: React.FC = () => {
    const { logout } = useLogout();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dispatch = useDispatch()
    const handleLoginRedirect = async () => {
        setIsLoading(true);
        try {
            await logout();
                    dispatch(isSessionExpired(false))
        } catch (error) {
            setIsLoading(false);
        }
    };

    return (
        <CommonPopup
        isVisible={true}
        title='Session Expired'
                  backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.40)' }}

        content={
        <View>
        <ParagraphComponent style={[commonStyles.fs16, commonStyles.textGrey, commonStyles.fw400, commonStyles.mb32, commonStyles.textCenter]}
            text={"Your session has timed out for security reasons. Please log in again to continue. "} />
        
        <DefaultButton
        title={"Log out"}
        loading={isLoading}
        disable={undefined}
        onPress={handleLoginRedirect}
        transparent={undefined}
        iconArrowRight={true}
        
        />
        </View>
        }
    
        
        />
    );
};

export default SessionExpired;