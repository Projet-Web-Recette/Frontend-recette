import type { Ressource } from "./types";

export function generateMock(): { ressources: Ressource[]} {
    const bronze = {
        id: 'b1',
        nom: 'Bronze',
        qualite: 'impur',
        logoChemin: 'https://satisfactory.fandom.com/fr/wiki/Minerai_de_cuivre#/media/Fichier:Copper_Ore.png'
    } as Ressource

    const fer = {
        id: 'f1',
        nom: 'Fer',
        qualite: 'normal',
        logoChemin: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/8/87/Iron_Ore.png'
    } as Ressource

    return {
        ressources: [bronze, fer]
    }
}