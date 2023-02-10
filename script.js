const AWS = require('aws-sdk')


const api = new AWS.ApiGatewayManagementApi({
  endpoint: 'k42olxgw0i.execute-api.us-west-2.amazonaws.com/production'
})

let avatarDict = {}

exports.handler = async (event) => {
    console.log(event)

    const route = event.requestContext.routeKey
    const connectionId = event.requestContext.connectionId

    switch (route) {
        case '$connect':
            console.log('Connection occurred')
            break
        case '$disconnect':
            if (connectionId in avatarDict){
                delete(avatarDict[connectionId])
            }
            console.log('Disconnection occurred')
            
            break
        case 'message':
            console.log('Received message:', event.body)
            console.log(event.body)
            const json = event.body
            console.log(json)
            const m = JSON.parse(json);
            console.log("obj", m.msg)
            const obj = JSON.parse(m.msg)
            console.log("c1", obj.c1)
            const aR = new avatarRepresentation(obj.c0, obj.c1, obj.hmd)
                avatarDict[connectionId] = aR
            console.log(avatarDict)
            let tempAR = avatarDict[connectionId]
            
            //suuuper jank solution
            delete(avatarDict[connectionId])
            await replyToMessage(avatarDict, connectionId)
            avatarDict[connectionId] = tempAR
            break
        default:
            console.log('Received unknown route:', route)
    }

    return {
      statusCode: 200
    }
}

async function replyToMessage(response, connectionId) {
    const data = { message: response }
    const params = {
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(data))
    }

    return api.postToConnection(params).promise()
}

class avatarRepresentation {
  constructor(leftC, rightC, hmd) {
    this.leftC = leftC;
    this.rightC = rightC;
    this.hmd = hmd;
  }
}
