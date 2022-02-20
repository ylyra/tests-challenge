import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able view a deposit", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 1000,
      description: "Deposit test",
      type: "deposit" as any,
    });
    await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 500,
      description: "withdraw test",
      type: "withdraw" as any,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(result.id).toBe(statement.id);
    expect(result.user_id).toBe(user.id);
    expect(result.amount).toBe(statement.amount);
    expect(result.description).toBe(statement.description);
  });

  it("should be able view a withdraw", async () => {
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
    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      amount: 500,
      description: "withdraw test",
      type: "withdraw" as any,
    });

    const result = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(result.id).toBe(statement.id);
    expect(result.user_id).toBe(user.id);
    expect(result.amount).toBe(statement.amount);
    expect(result.description).toBe(statement.description);
  });

  it("should not be able list the a statement that does not exists", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        statement_id: "1",
        user_id: "123456789",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
