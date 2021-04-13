import 'reflect-metadata' 
import express from 'express';
import "./database"
import {router} from './routers'

const port = 8080
const app = express()

app.use(express.json())
app.use(router)

app.listen(port, () => console.log("The server is runnig!"));