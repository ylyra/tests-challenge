import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new statement", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    const response = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: "Deposit test",
      type: "deposit" as any,
    });

    expect(response).toHaveProperty("id");
  });

  it("should not be able to create new statement if user does't exists", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "123467980123",
        amount: 1000,
        description: "Deposit test",
        type: "deposit" as any,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to withdraw money greater than the balance", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "john@doe.com",
        password: "123456",
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        amount: 1000,
        description: "Withdraw test",
        type: "withdraw" as any,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should be able to withdraw money", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: "Deposit test",
      type: "deposit" as any,
    });

    const response = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 50,
      description: "withdraw test",
      type: "withdraw" as any,
    });

    expect(response).toHaveProperty("id");
    expect(response.user_id).toBe(user.id);
  });
});
