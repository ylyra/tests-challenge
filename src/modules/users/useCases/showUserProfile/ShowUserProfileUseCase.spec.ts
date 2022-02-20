import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to list a profile if user exists", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    const profile = await showUserProfileUseCase.execute(user.id as string);

    expect(profile).toHaveProperty("id");
    expect(profile.id).toEqual(user.id);
    expect(profile).toHaveProperty("name");
    expect(profile.name).toEqual(user.name);
    expect(profile).toHaveProperty("email");
    expect(profile.email).toEqual(user.email);
  });

  it("should not be able to list to a non-existing user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("non-existing-user-id");
    }).rejects.toBeInstanceOf(AppError);
  });
});
