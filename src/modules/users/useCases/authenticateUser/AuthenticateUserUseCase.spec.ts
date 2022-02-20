import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: IUsersRepository;
let createUserUseCase: CreateUserUseCase;
describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to authenticate a user", async () => {
    const createdUser = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    const user = await authenticateUserUseCase.execute({
      email: "john@doe.com",
      password: "123456",
    });

    expect(user).toHaveProperty("token");
    expect(user.user.id).toEqual(createdUser.id);
  });

  it("should not be able to authenticate a nonexisting user", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "john@doe.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate a user with invalid credentials", () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john@doe.com",
        password: "123456",
      });

      await authenticateUserUseCase.execute({
        email: "john@doe.com",
        password: "1234567",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
