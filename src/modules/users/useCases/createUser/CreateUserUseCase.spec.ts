import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
    expect(user.email).toEqual("john@doe.com");
    expect(user.name).toEqual("John Doe");
  });

  it("should not be able to create a new user with existing email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john@doe.com",
        password: "123456",
      });
      await createUserUseCase.execute({
        name: "John Doe",
        email: "john@doe.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
