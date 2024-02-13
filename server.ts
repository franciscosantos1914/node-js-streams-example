import http from 'node:http'
import { Readable } from 'node:stream'
import { randomUUID } from 'node:crypto'

const reqObject = {
    pagination: {
        perPage: 100,
        page: 1,
        total: 100
    }
}

async function* DatabaseMock() {
    for (let index = 0; index < reqObject.pagination.perPage; index++) {
        const data = {
            user: {
                id: randomUUID(),
                name: "Francis"
            }
        }
        yield data
    }
}

const handler = (request: http.IncomingMessage, response: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}) => {
    if (request.method !== "POST" || request.url !== "/") return response.end()
    const data = DatabaseMock()

    const readable = new Readable({
        read() {
            (async () => {
                for await (const datus of data) {
                    this.push(JSON.stringify(datus) + '\n')
                }
                this.push(null)
            })()
        }
    })
    readable.pipe(response)

}

http.createServer(handler)
    .listen(3_000)
    .on("listening", () => console.log("Server running on port: 3000!"))