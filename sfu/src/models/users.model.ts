import { db } from '../db'; 
import { user } from '../db/schemas/user.schema'; 
import { eq, and } from 'drizzle-orm';

class UserModel {
  public findByEmail = async (email: string) => (await db.select().from(user).where(eq(user.email, email)))[0] || null;

  public createUser = async (data: {
    username: string;
    email: string;
    passwordHash: string;
    pwdSalt: string;
    emailVerified?: Date | null;
  }) => (await db.insert(user).values(data).returning())[0];

  public findById = async (id: number) => (await db.select().from(user).where(eq(user.id, id)))[0] || null;

  public findOne = async (filter: Partial<{ email: string; id: number }>) => {
    // Tạo điều kiện truy vấn từ filter
    const conditions = [];
    if (filter.email) {
      conditions.push(eq(user.email, filter.email));
    }
    if (filter.id) {
      conditions.push(eq(user.id, filter.id));
    }

    // Xây dựng truy vấn với điều kiện (sử dụng 'and' nếu nhiều điều kiện)
    const query = db.select().from(user);
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    // Thực thi và trả về kết quả
    const results = await query;
    return results[0] || null;
  };
}

export const userModel = new UserModel();
