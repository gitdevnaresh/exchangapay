export interface CreateTickets{
   subject: string,
   priority: string,
   message: string,
}

export interface SupportTicket {
  createdAt: string;
  description: string;
  email: string | null;
  id: number;
  priority: string;
  status: string;
  subject: string;
}