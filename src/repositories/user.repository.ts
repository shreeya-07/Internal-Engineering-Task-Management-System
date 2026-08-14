import {
    User
} from "../../generated/prisma/client.js";

import {
    prisma
} from "../configs/db.config.js";

export interface IUserRepository {

    create(
        fullName: string,
        email: string,
        passwordHash: string,
        roleId: bigint
    ): Promise<User>;

    find(
        email: string
    ): Promise<User | null>;
}

export class UserRepository
    implements IUserRepository {

    async create(
        fullName: string,
        email: string,
        passwordHash: string,
        roleId: bigint
    ): Promise<User> {

        return await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash,

                role: {
                    connect: {
                        id: roleId
                    }
                }
            }
        });
    }

    async find(
        email: string
    ): Promise<User | null> {

        return await prisma.user.findUnique({
            where: {
                email
            }
        });
    }
}