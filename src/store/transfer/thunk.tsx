import TransferService from '../../services/transfer';
import { formatError } from '../../utils/helpers';
import crashlytics from '@react-native-firebase/crashlytics';

      export const getTransferDetails = async (id:any) => {
        try {
          const data = await TransferService.getTransferDetails(id);
          return data;
        } catch (error:any) {
          crashlytics().recordError(error);
          return {
            status: false,
            msg: formatError(error),
            data: null,
          };
        }
      };
