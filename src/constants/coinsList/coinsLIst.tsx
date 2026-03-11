import { AliaPay, AmazonPay, CanceledIcon, DeposistImage, PendingIcon, ReceivedImages, ShopeeImage, Transactionwithdraw } from "../../assets/svg";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { s } from "../styels/scale";
import ViewComponent from "../../components/view/view";
import { SvgUri } from "react-native-svg";
import { NotificationBlobIcons } from "../../components/CommonStyles";
import ReferralsIcon from "../../components/svgIcons/mainmenuicons/referrals";

export const getStatusIconMap = (NEW_COLOR: any) => ({
    Approved: <AntDesign name="checkcircle" size={24} color={NEW_COLOR.BG_GREEN} />,
    Active: <AntDesign name="checkcircle" size={24} color={NEW_COLOR.BG_GREEN} />,
    Pending: <PendingIcon width={24} height={24} />,
    Rejected: <CanceledIcon width={24} height={24} />,
    Canceled: <CanceledIcon width={24} height={24} />,
    Freezed: <PendingIcon width={24} height={24} />
});

export const iconsList: any = {
    amazon: <AmazonPay height={s(25)} width={(s(25))} />,
    alipay: <AliaPay height={(s(25))} width={s(25)} />,
    shopee: <ShopeeImage height={(s(25))} width={s(25)} />,
    default: <ReferralsIcon width={s(25)} height={s(25)} />
};


export const getIconsLists = (commonStyles: any) => ({
    buy:
        <ViewComponent style={[commonStyles.buy]}>
            <ViewComponent>
                <SvgUri
                    width={s(16)}
                    height={s(16)}
                    uri={NotificationBlobIcons.buy}
                />
            </ViewComponent>
        </ViewComponent>,
    sell:
        <ViewComponent style={[commonStyles.sell]}>
            <ViewComponent>
                <SvgUri
                    width={s(16)}
                    height={s(16)}
                    uri={NotificationBlobIcons.sell}
                />
            </ViewComponent>
        </ViewComponent>,
    purchase:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    purchasefiat:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    purchasecrypto:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    withdraw:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    deposit:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    accountdeposit:
        <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    withdrawcrypto:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    depositfiat:
        <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    exchangewallettransfer:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    depositcrypto:
        <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    withdrawfiat:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payoutfiat:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payoutcrypto:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    accountrejected:
        <ViewComponent style={[commonStyles.Accountrejected]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.accountrejected}
                />
            </ViewComponent>
        </ViewComponent>,
    accountcreation:
        <ViewComponent style={[commonStyles.accountcreatedbg]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.accountcreation}
                />
            </ViewComponent>
        </ViewComponent>,
    kyc:
        <ViewComponent style={[commonStyles.kyckyb]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.kyc}
                />
            </ViewComponent>
        </ViewComponent>,
    kyb:
        <ViewComponent style={[commonStyles.kyckyb]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.kyb}
                />
            </ViewComponent>
        </ViewComponent>,
    customer:
        <ViewComponent style={[commonStyles.customer]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.customer}
                />
            </ViewComponent>
        </ViewComponent>,
    fastxEPhysicalcardapply:
        <ViewComponent style={[commonStyles.cardapply]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.FastXEphysicalcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    Buy:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payeeapproved:
        <ViewComponent style={[commonStyles.payeeapproved]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeeapproved}
                />
            </ViewComponent>
        </ViewComponent>,
    cases:
        <ViewComponent style={[commonStyles.cases]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.cases}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardapply:
        <ViewComponent style={[commonStyles.cardapply]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    payeesubmitted:
        <ViewComponent style={[commonStyles.payeesubmitted]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeesubmitted}
                />
            </ViewComponent>
        </ViewComponent>,
    payeepending:
        <ViewComponent style={[commonStyles.payeepending]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeepending}
                />
            </ViewComponent>
        </ViewComponent>,
    business:
        <ViewComponent style={[commonStyles.bussiness]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.business}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardtopup:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardrecharge:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    fastxePhysicalcardactivationsuccessful:
        <ViewComponent style={[commonStyles.cardactivated]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
    fastxephysicalcardapply:
        <ViewComponent style={[commonStyles.paymentbg]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,

    payments:
        <ViewComponent style={[commonStyles.paymentbg]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payments}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardactivationsuccessful:
        <ViewComponent style={[commonStyles.cardactivated]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardfreezed:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardunfreezed:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payeerejected:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    personal:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.personal}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardrecharge:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardrecharge}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardtopup:
        <ViewComponent style={[commonStyles.cardtopup]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardtopup}
                />
            </ViewComponent>
        </ViewComponent>,
    smashphysicalcardapply:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashphysicalcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardapply:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardunfreezed:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardunfreezed}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardfreezed:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardfreezed}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardactivationsuccessful:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
    addressbookapproved:
        <ViewComponent style={[commonStyles.payeeapproved]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.addressookapproved}
                />
            </ViewComponent>
        </ViewComponent>,
    addressbooksubmitted:
        <ViewComponent style={[commonStyles.payeesubmitted]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.addressbooksubmitted}
                />
            </ViewComponent>
        </ViewComponent>,
    addressbookdraft:
        <ViewComponent style={[commonStyles.addressdraft]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.Addressbookdraft}
                />
            </ViewComponent>
        </ViewComponent>,
    bankwithdrawfiat:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.bankwithdrawfiat}
                />
            </ViewComponent>
        </ViewComponent>,
    payeedraft:
        <ViewComponent style={[commonStyles.addressdraft]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeedraft}
                />
            </ViewComponent>
        </ViewComponent>,

});

export const iconsLists = getIconsLists;
export const notificationIconsLists = (commonStyles: any) => ({
    buy:
        <ViewComponent style={[commonStyles.buy]}>
            <ViewComponent>
                <SvgUri
                    width={s(16)}
                    height={s(16)}
                    uri={NotificationBlobIcons.buy}
                />
            </ViewComponent>
        </ViewComponent>,
    sell:
        <ViewComponent style={[commonStyles.sell]}>
            <ViewComponent>
                <SvgUri
                    width={s(16)}
                    height={s(16)}
                    uri={NotificationBlobIcons.sell}
                />
            </ViewComponent>
        </ViewComponent>,
    purchase:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    purchasefiat:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    purchasecrypto:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    bankwithdrawfiat:
        (
            <ViewComponent style={[commonStyles.bgwithdraw]}>
                <ViewComponent>
                    <SvgUri
                        width={s(12)}
                        height={s(12)}
                        uri={NotificationBlobIcons.withdraw}
                    />
                </ViewComponent>
            </ViewComponent>
        ),
    bankdepositfiat: (
        <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>
    ),
    withdraw:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    deposit:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    accountdeposit:
        <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    withdrawcrypto:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    depositfiat:
        <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    exchangewallettransfer:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    depositcrypto:
        <ViewComponent style={[commonStyles.bgdeposist]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.deposit}
                />
            </ViewComponent>
        </ViewComponent>,
    withdrawfiat:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payoutfiat:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payoutcrypto:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    accountrejected:
        <ViewComponent style={[commonStyles.Accountrejected]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.accountrejected}
                />
            </ViewComponent>
        </ViewComponent>,
    accountcreation:
        <ViewComponent style={[commonStyles.accountcreatedbg]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.accountcreation}
                />
            </ViewComponent>
        </ViewComponent>,
    kyc:
        <ViewComponent style={[commonStyles.kyckyb]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.kyc}
                />
            </ViewComponent>
        </ViewComponent>,
    kyb:
        <ViewComponent style={[commonStyles.kyckyb]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.kyb}
                />
            </ViewComponent>
        </ViewComponent>,
    customer:
        <ViewComponent style={[commonStyles.customer]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.customer}
                />
            </ViewComponent>
        </ViewComponent>,
    fastxEPhysicalcardapply:
        <ViewComponent style={[commonStyles.cardapply]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.FastXEphysicalcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    Buy:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payeeapproved:
        <ViewComponent style={[commonStyles.payeeapproved]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeeapproved}
                />
            </ViewComponent>
        </ViewComponent>,
    cases:
        <ViewComponent style={[commonStyles.cases]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.cases}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardapply:
        <ViewComponent style={[commonStyles.cardapply]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    payeesubmitted:
        <ViewComponent style={[commonStyles.payeesubmitted]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeesubmitted}
                />
            </ViewComponent>
        </ViewComponent>,
    payeepending:
        <ViewComponent style={[commonStyles.payeepending]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeepending}
                />
            </ViewComponent>
        </ViewComponent>,
    business:
        <ViewComponent style={[commonStyles.bussiness]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.business}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardtopup:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardrecharge:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    fastxePhysicalcardactivationsuccessful:
        <ViewComponent style={[commonStyles.cardactivated]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
    fastxephysicalcardapply:
        <ViewComponent style={[commonStyles.paymentbg]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,

    payments:
        <ViewComponent style={[commonStyles.paymentbg]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payments}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardactivationsuccessful:
        <ViewComponent style={[commonStyles.cardactivated]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardfreezed:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    airwallexmeshcardunfreezed:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    payeerejected:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    personal:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.personal}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardrecharge:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardrecharge}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardtopup:
        <ViewComponent style={[commonStyles.cardtopup]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardtopup}
                />
            </ViewComponent>
        </ViewComponent>,
    smashphysicalcardapply:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashphysicalcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardapply:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardapply}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardunfreezed:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardunfreezed}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardfreezed:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardfreezed}
                />
            </ViewComponent>
        </ViewComponent>,
    smashvirtualcardactivationsuccessful:
        <ViewComponent style={[commonStyles.personal]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.smashvirtualcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
    addressbookapproved:
        <ViewComponent style={[commonStyles.payeeapproved]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.addressookapproved}
                />
            </ViewComponent>
        </ViewComponent>,
    addressbooksubmitted:
        <ViewComponent style={[commonStyles.payeesubmitted]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.addressbooksubmitted}
                />
            </ViewComponent>
        </ViewComponent>,
    addressbookdraft:
        <ViewComponent style={[commonStyles.addressdraft]}>
            <ViewComponent>
                <SvgUri
                    width={s(20)}
                    height={s(20)}
                    uri={NotificationBlobIcons.Addressbookdraft}
                />
            </ViewComponent>
        </ViewComponent>,
    payeedraft:
        <ViewComponent style={[commonStyles.addressdraft]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.payeedraft}
                />
            </ViewComponent>
        </ViewComponent>,
    rapidzmoneyphysicalcardwithdraw:
        <ViewComponent style={[commonStyles.bgwithdraw]}>
            <ViewComponent>
                <SvgUri
                    width={s(12)}
                    height={s(12)}
                    uri={NotificationBlobIcons.withdraw}
                />
            </ViewComponent>
        </ViewComponent>,
    rapidzmoneyphysicalcardactivationsuccessful:
        <ViewComponent style={[commonStyles.cardactivated]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
    rapidzmoneyvirtualcardactivationsuccessful:
        <ViewComponent style={[commonStyles.cardactivated]}>
            <ViewComponent>
                <SvgUri
                    width={s(18)}
                    height={s(18)}
                    uri={NotificationBlobIcons.airwallexmeshcardactivationsuccessful}
                />
            </ViewComponent>
        </ViewComponent>,
});