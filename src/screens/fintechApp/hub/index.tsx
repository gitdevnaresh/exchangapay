import React from "react";
import { ImageBackground, StyleSheet } from 'react-native';
import { useThemeColors } from '../../../hooks/themedHook/useThemeColors';
import { getThemedCommonStyles } from '../../../components/CommonStyles';
import { s } from '../../../constants/styels/scale';
import Container from '../../../components/container/container';
import ScrollViewComponent from '../../../components/scrollView/scrollView';
import TextMultiLangauge from '../../../components/textComponets/multiLanguageText/textMultiLangauge';
import CommonTouchableOpacity from '../../../components/touchableComponents/touchableOpacity';
import ViewComponent from '../../../components/view/view';
import { AlertHub, BannerImage, CampainHub, ConvertHub, CreditHUb, DipositHub, EarningsHub, GiftHub, HotDealsHub, RedPacketHUb, ReferralHUb, RewardsHub, ScanHub, ShareredPacketHub, VoucherHub, WithdrawHub, NavActiveBank } from '../../../assets/svg';
import { LinearGradient } from 'expo-linear-gradient';

const HubDashBoard = ({ navigation }: any) => {
  const NEW_COLOR = useThemeColors();
  const commonStyles = getThemedCommonStyles(NEW_COLOR);
  const styles = screenStyles(NEW_COLOR);
  return (
    <ViewComponent style={[commonStyles.flex1, commonStyles.screenBg]}>
      <Container style={commonStyles.container}>
        <ScrollViewComponent showsVerticalScrollIndicator={false}>
          <ImageBackground source={require("../../../assets/images/registration/hubbg.png")}
            resizeMode="cover"
            style={[commonStyles.sectionGap, {
              width: '100%',
              borderRadius: s(10),  // if you want rounded corners
              overflow: 'hidden'    // to apply borderRadius properly
            }]}
          >
            <ViewComponent style={[commonStyles.dflex, commonStyles.gap30, commonStyles.px18, commonStyles.py8]}>
              <TextMultiLangauge
                text={"GLOBAL_CONSTANTS.FAST_AND_SECURE_CRYPTO_EXCHANGE"}
                style={[commonStyles.textAlwaysWhite, commonStyles.fs18, commonStyles.fw600]}
              />
              <BannerImage height={s(89)} width={s(133)} />
            </ViewComponent>
          </ImageBackground>
          <ViewComponent style={[commonStyles.sectionGap]}>
            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.POPULAR"}
              style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
            />
            <ViewComponent style={styles.menuGrid}>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('MembersDashBoard')}
              >
                <ReferralHUb height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.REFERRAL"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <GiftHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.GIFT"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <VoucherHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.VOUCHERS"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <CreditHUb height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.CREDIT"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <EarningsHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.EARNINGS"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <RewardsHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.REWARDS"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              {/* Bank menu item */}
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('BankDashboard')}
              >
                <NavActiveBank height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.BANK"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
            </ViewComponent>
          </ViewComponent>
          <ViewComponent style={[commonStyles.titleSectionGap]}>
            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.GET_REWARDS"}
              style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
            />
            <ViewComponent style={styles.rewardGrid}>
              <CommonTouchableOpacity
                style={styles.rewardItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <LinearGradient
                  colors={['#060606', '#242727']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.rewardItemGradient}
                >
                  <TextMultiLangauge text={"GLOBAL_CONSTANTS.HOT_DEALS"} style={[commonStyles.textAlwaysWhite, commonStyles.fw600, commonStyles.fs14]} />
                  <HotDealsHub height={s(58)} width={s(58)} />
                </LinearGradient>
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.rewardItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <LinearGradient
                  colors={['#060606', '#242727']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.rewardItemGradient}
                >
                  <TextMultiLangauge text={"GLOBAL_CONSTANTS.SEND_CAMPAIGN"} style={[commonStyles.textAlwaysWhite, commonStyles.fw600, commonStyles.fs14]} />
                  <CampainHub height={s(64)} width={s(64)} />
                </LinearGradient>
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.rewardItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <LinearGradient
                  colors={['#060606', '#242727']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.rewardItemGradient}
                >
                  <TextMultiLangauge text={"GLOBAL_CONSTANTS.RED_PACKET_GIVEAWAY"} style={[commonStyles.textAlwaysWhite, commonStyles.fw600, commonStyles.fs14]} />
                  <RedPacketHUb height={s(53)} width={s(60)} />
                </LinearGradient>
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.rewardItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <LinearGradient
                  colors={['#060606', '#242727']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.rewardItemGradient}
                >
                  <TextMultiLangauge text={"GLOBAL_CONSTANTS.SHARE_RED_PACKET"} style={[commonStyles.textAlwaysWhite, commonStyles.fw600, commonStyles.fs14]} />
                  <ShareredPacketHub height={s(68)} width={s(68)} />
                </LinearGradient>
              </CommonTouchableOpacity>
            </ViewComponent>
          </ViewComponent>
          <ViewComponent >
            <TextMultiLangauge
              text={"GLOBAL_CONSTANTS.TRANSACTION"}
              style={[commonStyles.sectionTitle, commonStyles.titleSectionGap]}
            />
            <ViewComponent style={styles.menuGrid}>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('CryptoDeposit')}
              >
                <DipositHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.DEPOSIT"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('CrptoWithdraw')}
              >
                <WithdrawHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.WITHDRAW"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')} >
                <ScanHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.SCAN"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <ConvertHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.CONVERT"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter, commonStyles.fw600]}
                />
              </CommonTouchableOpacity>
              <CommonTouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate('ComingSoon')}
              >
                <AlertHub height={s(26)} width={s(26)} />
                <TextMultiLangauge
                  text={"GLOBAL_CONSTANTS.ALERT"}
                  style={[commonStyles.textWhite, commonStyles.fs12, commonStyles.textCenter]}
                />
              </CommonTouchableOpacity>
            </ViewComponent>
          </ViewComponent>
        </ScrollViewComponent>
      </Container>
    </ViewComponent>
  );
};

const screenStyles = (NEW_COLOR: any) => StyleSheet.create({
  banner: {
    height: s(120),
    backgroundColor: NEW_COLOR.SHEET_BG,
    borderRadius: s(12),
    padding: s(16),
    marginBottom: s(24),
    justifyContent: 'center',
  },
  section: {
    marginBottom: s(24),
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(22),
  },
  menuItem: {
    width: s(70), // Updated width
    height: s(70), // Added height
    backgroundColor: NEW_COLOR.HUBICON_BG,
    borderRadius: s(10),
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(5),
  },
  menuIcon: {
    fontSize: s(24),
  },
  rewardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardItem: {
    width: s(168),
    height: s(70),
    marginBottom: s(16),
    borderRadius: s(10), // Keep radius on touchable for ripple effect if any
  },
  rewardItemGradient: {
    flexDirection: 'row',
    width: '100%', // Take full width of parent (rewardItem)
    height: '100%', // Take full height of parent (rewardItem)
    padding: s(16),
    borderRadius: s(10),
    alignItems: 'center',
    gap: s(12),
    justifyContent: 'space-between', // To space text and icon
  },
  rewardIcon: {
    fontSize: s(24),
  },
});

export default HubDashBoard;