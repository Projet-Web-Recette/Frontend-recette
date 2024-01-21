import { authenticationStore } from "@/stores/authenticationStore"
import type { HttpRequest, Resource } from "@/types"

const baseUrl = 'https://webinfo.iutmontp.univ-montp2.fr/~bordl/API-PLATFORM-main/API-PLATFORM/public/api'
const baseUrl2 = 'https://webinfo.iutmontp.univ-montp2.fr/~royov/WebRecette/API-PLATFORM/public/api'

function translateResourceFromApi(resource: any): Resource {
    const {id, nomRessource, qualite, contentUrl} = resource
    return {
        id,
        name: nomRessource,
        quality: qualite,
        logoPath: contentUrl
    }
}

function translateResourceToApi(resource: Resource): any {
    const { id, name, quality, logoPath} = resource
    return {
        id,
        nomRessource: name,
        qualite: quality,
        file: logoPath
    }
}

export async function sendRequest(endpoint: string, method: 'GET' | 'POST', payload?: any, useJWT = false){
    let token = {}
    let request = {} as HttpRequest

    if(useJWT) {

        const authentication = authenticationStore()

        if(!authentication.isAuthenticated) return

        token = {
            'Authorization': authentication.JWT
        }
    }

    request.method = method
    request.headers = {
        'Content-Type': 'application/json',
        ...token
    }

    if(payload){
        request.body = JSON.stringify({...payload })
    }

    
    const response = await fetch(`${baseUrl}/${endpoint}`, request)

    const result = { status: response.status, content: await response.json()} 
    return result
}


export async function getResources(): Promise<Resource[]> {
    const request = await sendRequest('ressources', 'GET')

    const resources = request?.content

    const result = resources['hydra:member'].map((resource: any) => {
        const result = translateResourceFromApi(resource)
        return result
    })

    return result
}

// export async function registerResource(resource: Resource): Promise<Resource> {
//     const payload = translateResourceToApi(resource)
//     sendRequest('ressources', 'POST', payload, true)

//     const response = await fetch(`${baseUrl}/ressources`, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             nomResource: resource.name,
//             qualite: resource.quality,
//             file: resource.logoPath,
//             foreuse: ""
//         })
//     })
//     const result = await response.json()
//     return result
// }



// export async function getItems() {
//     const authentication = useAuthenticationStore()
//     if(authentication.isAuthenticated){
//         return sendRequest('items', 'GET', {}, true)
//     }
// }