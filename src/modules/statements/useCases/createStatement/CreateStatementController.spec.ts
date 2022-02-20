import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to deposit money", async () => {
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
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 1000,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(201);
  });

  it("should be able to withdraw money", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "123456",
    });

    const { token } = responseSession.body;
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 50,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
    expect(response.status).toBe(201);
  });

  it("should not be able to deposit money without a valid user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 10,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer token-invalid`,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to withdraw money without a valid user", async () => {
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 10,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer token-invalid`,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to withdraw money greater than the balance", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "123456",
    });

    const { token } = responseSession.body;
    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 2000,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
