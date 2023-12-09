const baseUrl = 'https://webinfo.iutmontp.univ-montp2.fr/~royov/WebRecette/API-PLATFORM/public/api'

export async function getResources(): Promise<any[]> {
    const response = await fetch(`${baseUrl}/ressources`)
    const ressources = await response.json()
    return ressources['hydra:member']
}