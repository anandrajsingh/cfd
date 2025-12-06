import express from "express";
import router from "./mainRoutes";
import cors from "cors"

const app = express();
app.use(express.json())
app.use( "/api/v1", router)
app.use(cors())

const port = 3000;

app.get("/", (req, res) => {
    res.send("Helloooooooooooooo")
})

app.listen(port);