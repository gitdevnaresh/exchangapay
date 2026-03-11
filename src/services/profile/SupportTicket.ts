import { get, post } from "../../utils/ApiService";

const SupportService = {
 createTicket: async (body: any) => {
    return post(`/api/v1/casemanagement/ticket/create`, body)
  },
  getSupportTickets: async (page: number,pageSize: number) => {
    return get(`/api/v1/casemanagement/tickets?page=${page}&pageSize=${pageSize}`)
  },
  getSupportTicketById: async (id: string) => {
    return get(`api/v1/casemanagement/ZendDesk/tickets/${id}`)
  },
    rePlayTicket: async (id: string,body: any) => {
    return post(`api/v1/casemanagement/ticket/${id}/reply`,body)
  },
}
export default SupportService;