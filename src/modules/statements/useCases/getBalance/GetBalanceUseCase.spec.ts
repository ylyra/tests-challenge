import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able list the balance all of the user", async () => {
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
    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: "Deposit test",
      type: "deposit" as any,
    });

    const response = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(response.statement.length).toBe(2);
  });

  it("should not be able to list balance of a non-existing user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "123467980123",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
