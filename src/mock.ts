import type { Resource } from "./types";

export function generateMock(): { resources: Resource[]} {
    const bronze = {
        id: 'b1',
        name: 'Bronze',
        logoPath: 'https://satisfactory.fandom.com/fr/wiki/Minerai_de_cuivre#/media/Fichier:Copper_Ore.png'
    } as Resource

    const fer = {
        id: 'f1',
        name: 'Fer',
        logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/8/87/Iron_Ore.png'
    } as Resource

    return {
        resources: [bronze, fer]
    }
}