import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able list the all the balances of user", async () => {
    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "123456",
    });

    const { token } = responseSession.body;
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("statement");
    expect(response.body.statement.length).toBe(2);
    expect(response.status).toBe(200);
  });

  it("should not be able list the balance of a non-existing user", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer token-invalid`,
    });

    expect(response.status).toBe(401);
  });
});
