import {
  UserGenderEnum,
  UserRoleTypeEnum,
  UserStatusEnum,
} from "@packages/openapigen";
import { CursorPagination } from "@/utils/types/pagination";

/**
 * User search filters
 */
export interface UserSearchFilters {
  fullname?: string; // Partial match on fullname
  username?: string; // Exact or partial match on username
  email?: string; // Exact or partial match on email
  phoneNumber?: string; // Partial match on phone number
  gender?: UserGenderEnum; // Filter by gender
  roleType?: UserRoleTypeEnum; // Filter by role type
  status?: UserStatusEnum; // Filter by user status
  createdAfter?: Date; // Filter users created after this date
  createdBefore?: Date; // Filter users created before this date
}

/**
 * Combined parameters for user list/search with cursor pagination
 */
export interface UserListParams extends CursorPagination {
  filters?: UserSearchFilters;
  sortBy?: "id" | "createdAt" | "updatedAt" | "fullname"; // Sort field
  sortOrder?: "asc" | "desc"; // Sort direction (default: 'asc' for cursor pagination)
}
