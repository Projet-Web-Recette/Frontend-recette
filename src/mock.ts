import type { Item, Receipe, Resource } from "./types";

export function generateMock(): { resources: Resource[], items: Item[]} {
    const cooper: Resource = {
        id: 'rsc1',
        name: 'cuivre',
        logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/7/78/Copper_Ore.png'
    }

    const iron: Resource = {
        id: 'rsc2',
        name: 'Fer',
        logoPath: 'https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/8/87/Iron_Ore.png'
    }


    const ironIngotReceipe: Receipe = {
        id: 'rcp1',
        resources: [iron]
    }

    const ironIngot: Item = {
        id: 'itm1',
        logoPath: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/0/0a/Iron_Ingot.png",
        name: "Lingot de fer",
        receipe: ironIngotReceipe
    }

    const cooperIngotReceipe: Receipe = {
        id: 'rcp2',
        resources: [cooper]
    }

    const cooperIngot: Item = {
        id: 'itm2',
        logoPath: "https://static.wikia.nocookie.net/satisfactory_gamepedia_en/images/0/00/Copper_Ingot.png",
        name: "Lingot de cuivre",
        receipe: ironIngotReceipe
    }

    return {
        resources: [cooper, iron],
        items: [ironIngot]
    }
}