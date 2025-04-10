import { Request } from "express"

export interface ModRequest extends Request {
  user: {
    userId: string
    role: string
    isSubscriptionActive?: boolean
  }
}
