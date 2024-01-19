import type { Resource } from "@/types"

const baseUrl = 'https://webinfo.iutmontp.univ-montp2.fr/~bordl/API-PLATFORM-main/API-PLATFORM/public/api'
const baseUrl2 = 'https://webinfo.iutmontp.univ-montp2.fr/~royov/WebRecette/API-PLATFORM/public/api'

function translateFromApi(resource: any): Resource {
    const {id, nomRessource, qualite, contentUrl} = resource
    return {
        // y a pas id
        id,
        name: nomRessource,
        quality: qualite,
        logoPath: contentUrl
    }
}

export async function getResources(): Promise<Resource[]> {
    const response = await fetch(`${baseUrl}/ressources`, {method: 'GET'})
    const resources = await response.json()


    const result = resources['hydra:member'].map((resource: any) => {
        const result = translateFromApi(resource)
        return result
    })

    return result
}

export async function registerResource(resource: Resource): Promise<Resource> {
    const response = await fetch(`${baseUrl}/ressources`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nomResource: resource.name,
            qualite: resource.quality,
            file: resource.logoPath,
            foreuse: ""
        })
    })
    const result = await response.json()
    return result
}