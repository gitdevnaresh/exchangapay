import { get } from "../../utils/ApiService"

export const BonusApiServices={
    getBounusKpis :async()=>{
        return await get(`api/v1/Affiliate/customerbonuskpi`);
    },
    getBounusList :async(type:any,id:any,fromDate:any,toDate:any,page:any,pageSize:any,)=>{
        return await get(`api/v1/Affiliate/customerbonuses/${type}/${id}/${fromDate}/${toDate}?page=${page}&pageSize=${pageSize}`);
    },
    getBounusGraph :async(type:any,duration:any)=>{
        return await get(`api/v1/Affiliate/customerbonusgraph/${type}/${duration}`);
    },
    bonustypeslookup :async()=>{
        return await get(`api/v1/Affiliate/bonustypeslookup`);
    }
}