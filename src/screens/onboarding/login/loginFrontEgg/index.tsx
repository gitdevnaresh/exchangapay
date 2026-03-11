import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  switchTenant,
  login,
  logout,
  useAuth,
} from '@frontegg/react-native';
import type { ITenantsResponse } from '@frontegg/rest-api';
import Container from '../../../../newComponents/container/container';
import ViewComponent from '../../../../newComponents/view/view';
import { useThemeColors } from '../../../../hooks/useThemeColors';
import { getThemedCommonStyles } from '../../../../assets/styles/CommonStyles';
import ParagraphComponent from '../../../../newComponents/textComponets/paragraphText/paragraph';
import ButtonComponent from '../../../../newComponents/buttons/button';
import { jwtDecode } from 'jwt-decode';
import { useNavigation } from '@react-navigation/native';

const FrontEggLoginComponent = () => {
  const [switching, setSwitching] = useState<string>('');
  const [expiryTime, setExpiryTime] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const state = useAuth();
  const navigation = useNavigation();
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);

  // Decode access token to get expiry
  useEffect(() => {
    if (state.accessToken) {
      try {
        const decoded: any = jwtDecode(state.accessToken);
        if (decoded?.exp) {
          const expDate = new Date(decoded.exp * 1000);
          setExpiryTime(expDate.toLocaleString());
          setLastRefreshTime(new Date()); // mark when token last changed

          const interval = setInterval(() => {
            const now = new Date();
            const diffMs = expDate.getTime() - now.getTime();
            if (diffMs <= 0) {
              setTimeLeft('Expired');
              clearInterval(interval);
            } else {
              const mins = Math.floor(diffMs / 60000);
              const secs = Math.floor((diffMs % 60000) / 1000);
              setTimeLeft(`${mins}m ${secs}s`);
            }
          }, 1000);

          return () => clearInterval(interval);
        }
      } catch (e) {
        console.log('Error decoding token:', e);
      }
    }
  }, [state.accessToken]);
  // console.log('Rendering FrontEggLoginComponent with state:', state);
  return (
    <Container>
      <ViewComponent style={[commonStyles.sectionGap]} />

      <ParagraphComponent
        text={`User: ${state.user ? state.user.email : 'Not Logged In'}`}
        style={[commonStyles.textWhite, commonStyles.fs14, commonStyles.fw400]}
      />

      <ParagraphComponent
        text={`Access Token (last 40 chars): ${state.accessToken ? state.accessToken.slice(-40) : ''}`}
        style={[commonStyles.textWhite, commonStyles.fs12]}
      />

      <ParagraphComponent
        text={`Refresh Token (last 20 chars): ${state.refreshToken ? state.refreshToken.slice(-20) : ''}`}
        style={[commonStyles.textWhite, commonStyles.fs12]}
      />

      <View style={{ marginTop: 16 }}>
        <Text style={styles.infoText}>🕒 Access Token Expiry: {expiryTime || 'N/A'}</Text>
        <Text style={styles.infoText}>⏳ Time Left: {timeLeft || 'N/A'}</Text>
        <Text style={styles.infoText}>🔁 Last Refresh Time: {lastRefreshTime ? lastRefreshTime.toLocaleString() : 'N/A'}</Text>
      </View>

      <ViewComponent style={[commonStyles.myAuto]}>
        <ButtonComponent
          title={state.isAuthenticated ? 'Logout' : 'Login'}
          onPress={() => {
            state.isAuthenticated ? logout() : login();
          }}
        />
        <ViewComponent style={[commonStyles.mb10]} />

        <ButtonComponent
          title='ChangePassword'
          onPress={() => {
            navigation?.navigate("ChangePasswordComponent")
          }}
        />
        <ViewComponent style={[commonStyles.mb10]} />
        <ButtonComponent
          title='Devices List'
          onPress={() => {
            navigation?.navigate("devicesList")
          }}
        />
      </ViewComponent>


      <Text style={styles.tenantsTitle}>Tenants</Text>
      {(state.user?.tenants ?? [])
        .sort((a: any, b: any) => a.name.localeCompare(b.name))
        .map((tenant: ITenantsResponse) => (
          <View key={tenant.tenantId} style={styles.tenantRow}>
            <ButtonComponent
              title={`${tenant.name} ${tenant.tenantId === switching
                ? '(switching...)'
                : tenant.tenantId === state.user?.activeTenant.tenantId
                  ? '(active)'
                  : ''
                }`}
              onPress={() => {
                setSwitching(tenant.tenantId);
                switchTenant(tenant.tenantId).then(() => setSwitching(''));
              }}
            />
          </View>
        ))}
    </Container>
  );
};

const styles = StyleSheet.create({
  infoText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
  tenantsTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    color: 'white',
  },
  tenantRow: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
});

export default FrontEggLoginComponent;
