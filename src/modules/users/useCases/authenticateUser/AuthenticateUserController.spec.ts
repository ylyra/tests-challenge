import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
describe("Authenticate User", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const responseCreation = await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/users").send({
      email: "john@doe.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.id).toEqual(responseCreation.body.id);
  });

  it("should not be able to authenticate a nonexisting user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      email: "john1@doe.com",
      password: "123456",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user with invalid credentials", async () => {
    const response = await request(app).post("/api/v1/users").send({
      email: "john@doe.com",
      password: "1234567",
    });

    expect(response.status).toBe(401);
  });
});
