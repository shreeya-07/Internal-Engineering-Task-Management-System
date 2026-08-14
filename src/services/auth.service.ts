import bcrypt from "bcrypt";

import {
    User
} from "../../generated/prisma/client.js";

import {
    IUserRepository
} from "../repositories/user.repository.js";

import {
    IRoleRepository
} from "../repositories/role.repository.js";

import {
    SignupDto
} from "../dtos/auth.dto.js";

import {
    ConflictError,
    NotfoundError
} from "../utils/errors/app.error.js";

export interface IAuthService {

    signup(
        data: SignupDto
    ): Promise<Omit<User, "passwordHash">>;
}

export class AuthService
    implements IAuthService {

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly roleRepository: IRoleRepository
    ) {}

    async signup(
        data: SignupDto
    ): Promise<Omit<User, "passwordHash">> {

        // Check whether email already exists
        const existingUser =
            await this.userRepository.find(
                data.email
            );

        if (existingUser) {
            throw new ConflictError(
                "User with this email already exists"
            );
        }

        // Find default EMPLOYEE role
        const employeeRole =
            await this.roleRepository.findByName(
                "EMPLOYEE"
            );

        if (!employeeRole) {
            throw new NotfoundError(
                "EMPLOYEE role not found"
            );
        }

        // Hash password
        const passwordHash =
            await bcrypt.hash(
                data.password,
                10
            );

        // Create user
        // roleId is passed to repository
        const user =
            await this.userRepository.create(
                data.fullName,
                data.email,
                passwordHash,
                employeeRole.id
            );

        // Remove passwordHash from response
        const {
            passwordHash: _passwordHash,
            ...userWithoutPassword
        } = user;

        return userWithoutPassword;
    }
}