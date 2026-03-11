import { get } from "../../utils/ApiService";

export const myOrderServices = {
    getMyOrders: async (searchQuery:string|null,pageNo:string|number,pageSize:number,startDate:any,endDate:any) => {
        return await get(`api/v1/Affiliate/OrdersK/${searchQuery}/${startDate}/${endDate}?page=${pageNo}&pageSize=${pageSize}`);
      },
      getSelectedOrderDetails: async (orderId:string) => {
        return await get(`api/v1/Affiliate/OrderDetails/${orderId}`);
      },
      getDownloadInvoice: async (orderId:string) => {
        return await get(`api/v1/Affiliate/OrderTemplateDownload/${orderId}`);
      },
    }
