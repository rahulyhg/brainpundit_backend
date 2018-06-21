import { Request, Response } from "express";
export let welcomeMsg = (req: Request, res: Response) => {
    res.send("<h1> Welcome to BrainPundit Server </h1> <br> Developed on Nodejs Platform using Typescript and Mongodb.");
};