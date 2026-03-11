import { get, post, put, remove } from "../../utils/ApiService";

export const productService = {
    getPackages: async () => {
        return await get(`api/v1/Affiliate/customerpackages`);
      },
      getProducts:async (categery:any,search: any, pageNo: any,pageSize:any)=>{
        return get(`/api/v1/Affiliate/ProductsK/${categery}/${search}?page=${pageNo}&pageSize=${pageSize}}`)
      },
      getProductDetails: async (id:string) => {
        return await get(`api/v1/Affiliate/ProductDetails/${id}`);
      },
      getCartProducts: async () => {
        return await get(`api/v1/Affiliate/CartDetails`);
      },
      getCustomerCartCount: async () => {
        return await get(`api/v1/Affiliate/CustomerCartCount`);
      },
      postUserReview: async (body: any) => {
        return await post(`/api/v1/Affiliate/reviewrating`, body)
      },
      getProductRatings: async (productId:string) => {
        return await get(`api/v1/Affiliate/reviewratingsummary/${productId}`);
      },
      postAddtoCart: async (body: any) => {
        return await post(`/api/v1/Affiliate/SaveCart`, body)
      },
      getProductReviews: async (productId:string) => {
        return await get(`api/v1/Affiliate/reviewrating/${productId}`);
      },
      updateAddtoCart: async (body: any) => {
        return await put(`/api/v1/Affiliate/UpdateProductCart`, body)
      },
      deleteProduct: async (cartId:string,body:any) => {
        return await remove(`api/v1/Affiliate/RemoveCartProduct/${cartId}`,body);
      },
      getProductCategerioes: async () => {
        return await get(`api/v1/Affiliate/ProductCategories`);
      },
      
    }

