import { AddressType } from "./AddressType"
import { ClientType } from "./ClientType"
import { EmailMessageType } from "./EmailMessageType"
import { FileType } from "./FileType"
import { ProductType } from "./ProductType"
import { UserType } from "./UserType"

export interface OrderType {
  id?: number
  name: string
  status: string
  notes: string | null
  price: number
  isPricePaid: boolean
  advance: number
  isAdvancePaid: boolean
  dateOfCompletion: Date
  secretNotes: string | null
  files: Partial<FileType>[]
  address: Partial<AddressType>
  products: Partial<ProductType>[]
  client: Partial<ClientType>
  // expenses: Partial<ExpensesType>[]
  tables: { name: string; table: (any | null)[][] }[]
  designs: { name: string; design: any }[]
  employees: Partial<UserType>[]
  emailMessages: Partial<EmailMessageType>[]
  emailMessagesText: Partial<EmailMessageType>[]
  createdAt: Date
  updatedAt: Date
}
